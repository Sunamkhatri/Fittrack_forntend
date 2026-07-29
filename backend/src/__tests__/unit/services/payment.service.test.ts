import axios from "axios";
import { PaymentService } from "../../../services/payment.service.js";
import { UserModel } from "../../../models/user.model.js";
import { PaymentModel } from "../../../models/payment.model.js";
import { HttpException } from "../../../exceptions/http-exception.js";

jest.mock("axios");
jest.mock("../../../models/user.model.js", () => ({
  __esModule: true,
  UserModel: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
}));
jest.mock("../../../models/payment.model.js", () => ({
  __esModule: true,
  PaymentModel: { create: jest.fn(), findOne: jest.fn() },
}));

const mockedPost = axios.post as jest.Mock;
const mockedFindById = UserModel.findById as unknown as jest.Mock;
const mockedUpdate = UserModel.findByIdAndUpdate as unknown as jest.Mock;
const mockedCreate = PaymentModel.create as unknown as jest.Mock;
const mockedFindOne = PaymentModel.findOne as unknown as jest.Mock;

const TRAINER_ID = "6a688389dd1269df9c02e59d";
const USER_ID = "6a688389dd1269df9c02e5aa";

describe("PaymentService.initiatePayment", () => {
  const service = new PaymentService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject when the trainer does not exist", async () => {
    mockedFindById.mockResolvedValueOnce(null);

    await expect(
      service.initiatePayment(USER_ID, TRAINER_ID, 1000)
    ).rejects.toMatchObject({ status: 404 });

    // Must fail before spending a Khalti call on an unknown trainer.
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it("should reject when the target user is not a trainer", async () => {
    mockedFindById.mockResolvedValueOnce({ role: "user", firstName: "Bob" });

    await expect(
      service.initiatePayment(USER_ID, TRAINER_ID, 1000)
    ).rejects.toBeInstanceOf(HttpException);

    expect(mockedPost).not.toHaveBeenCalled();
  });

  it("should reject when the paying user does not exist", async () => {
    mockedFindById
      .mockResolvedValueOnce({ role: "trainer", firstName: "Coach" })
      .mockResolvedValueOnce(null);

    await expect(
      service.initiatePayment(USER_ID, TRAINER_ID, 1000)
    ).rejects.toMatchObject({ status: 404 });
  });

  it("should convert rupees to paisa before calling Khalti", async () => {
    mockedFindById
      .mockResolvedValueOnce({ role: "trainer", firstName: "Coach" })
      .mockResolvedValueOnce({
        firstName: "Pat",
        lastName: "Lee",
        email: "pat@fittrack.com",
      });
    mockedPost.mockResolvedValueOnce({
      data: { pidx: "pidx-1", payment_url: "https://khalti/pay" },
    });

    await service.initiatePayment(USER_ID, TRAINER_ID, 1000);

    const payload = mockedPost.mock.calls[0][1];
    // Khalti bills in paisa. Sending rupees would undercharge by 100x.
    expect(payload.amount).toBe(100000);
  });

  it("should record a pending payment and return the redirect url", async () => {
    mockedFindById
      .mockResolvedValueOnce({ role: "trainer", firstName: "Coach" })
      .mockResolvedValueOnce({
        firstName: "Pat",
        lastName: "Lee",
        email: "pat@fittrack.com",
      });
    mockedPost.mockResolvedValueOnce({
      data: { pidx: "pidx-1", payment_url: "https://khalti/pay" },
    });

    const result = await service.initiatePayment(USER_ID, TRAINER_ID, 1000);

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ pidx: "pidx-1", status: "pending" })
    );
    expect(result).toMatchObject({ pidx: "pidx-1", payment_url: "https://khalti/pay" });
  });

  it("should reject when Khalti returns no pidx", async () => {
    mockedFindById
      .mockResolvedValueOnce({ role: "trainer", firstName: "Coach" })
      .mockResolvedValueOnce({ firstName: "Pat", lastName: "Lee", email: "p@t.com" });
    mockedPost.mockResolvedValueOnce({ data: {} });

    await expect(
      service.initiatePayment(USER_ID, TRAINER_ID, 1000)
    ).rejects.toMatchObject({ status: 500 });

    // No ledger row for a payment that never started.
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});

describe("PaymentService.verifyPayment", () => {
  const service = new PaymentService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject an unknown pidx", async () => {
    mockedFindOne.mockResolvedValueOnce(null);

    await expect(service.verifyPayment("nope")).rejects.toMatchObject({
      status: 404,
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it("should short-circuit an already completed payment", async () => {
    mockedFindOne.mockResolvedValueOnce({ status: "completed" });

    const result = await service.verifyPayment("pidx-1");

    expect(result.status).toBe("already_completed");
    // Re-verifying must not hit Khalti or re-grant access.
    expect(mockedPost).not.toHaveBeenCalled();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("should subscribe the user to the trainer once completed", async () => {
    const payment = {
      status: "pending",
      user: USER_ID,
      trainer: TRAINER_ID,
      save: jest.fn().mockResolvedValue(undefined),
      transactionId: undefined as string | undefined,
    };
    mockedFindOne.mockResolvedValueOnce(payment);
    mockedPost.mockResolvedValueOnce({
      data: { status: "Completed", transaction_id: "txn-9" },
    });

    const result = await service.verifyPayment("pidx-1");

    expect(payment.status).toBe("completed");
    expect(payment.transactionId).toBe("txn-9");
    expect(mockedUpdate).toHaveBeenCalledWith(
      TRAINER_ID,
      expect.objectContaining({ $addToSet: { clients: USER_ID } })
    );
    expect(result.status).toBe("completed");
  });

  it("should mark the payment failed when Khalti reports anything else", async () => {
    const payment = {
      status: "pending",
      user: USER_ID,
      trainer: TRAINER_ID,
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockedFindOne.mockResolvedValueOnce(payment);
    mockedPost.mockResolvedValueOnce({ data: { status: "Pending" } });

    await expect(service.verifyPayment("pidx-1")).rejects.toMatchObject({
      status: 400,
    });

    expect(payment.status).toBe("failed");
    // Critically, no subscription is granted for an unconfirmed payment.
    expect(mockedUpdate).not.toHaveBeenCalled();
  });
});

import { UserService } from "../../../services/user.service.js";
import { UserModel } from "../../../models/user.model.js";
import { sendEmail } from "../../../utils/email.util.js";
import { HttpException } from "../../../exceptions/http-exception.js";

jest.mock("../../../models/user.model.js", () => ({
  __esModule: true,
  UserModel: { findOne: jest.fn() },
}));

jest.mock("../../../utils/email.util.js", () => ({
  __esModule: true,
  sendEmail: jest.fn(),
}));

const mockedFindOne = UserModel.findOne as unknown as jest.Mock;
const mockedSendEmail = sendEmail as jest.Mock;

// Stands in for a mongoose document: records save() calls and hands back a
// known reset token so the email body can be asserted.
function mockUser(email = "athlete@fittrack.com") {
  return {
    email,
    resetPasswordToken: undefined as string | undefined,
    resetPasswordExpire: undefined as Date | undefined,
    getResetPasswordToken: jest.fn(() => "reset-token-abc"),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

describe("userService.forgotPassword", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send a reset email containing the generated token", async () => {
    const user = mockUser();
    mockedFindOne.mockResolvedValue(user);
    mockedSendEmail.mockResolvedValue(undefined);

    await service.forgotPassword(user.email);

    expect(user.getResetPasswordToken).toHaveBeenCalledTimes(1);
    expect(mockedSendEmail).toHaveBeenCalledTimes(1);

    const sent = mockedSendEmail.mock.calls[0][0];
    expect(sent.email).toBe(user.email);
    expect(sent.message).toContain("reset-token-abc");
  });

  it("should clear the reset token when email sending fails", async () => {
    const user = mockUser();
    mockedFindOne.mockResolvedValue(user);
    mockedSendEmail.mockRejectedValue(new Error("SMTP unavailable"));

    await expect(service.forgotPassword(user.email)).rejects.toThrow(
      HttpException
    );

    // Leaving a live token behind after a failed send would let a reset be
    // completed by anyone who later guessed it.
    expect(user.resetPasswordToken).toBeUndefined();
    expect(user.resetPasswordExpire).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(2);
  });

  it("should reject with 404 when no user has that email", async () => {
    mockedFindOne.mockResolvedValue(null);

    await expect(service.forgotPassword("ghost@nowhere.com")).rejects.toMatchObject(
      { status: 404 }
    );

    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it("should not send an email when the user lookup fails", async () => {
    mockedFindOne.mockResolvedValue(null);

    await expect(service.forgotPassword("ghost@nowhere.com")).rejects.toThrow();
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });
});

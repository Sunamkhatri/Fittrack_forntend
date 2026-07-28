import mongoose from "mongoose";
import { connectToMongoDB } from "../../../config/database.js";

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    connection: { on: jest.fn(), close: jest.fn() },
  },
}));

const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe("connectToMongoDB", () => {
  let log: jest.SpyInstance;
  let error: jest.SpyInstance;
  let exit: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    log = jest.spyOn(console, "log").mockImplementation(() => {});
    error = jest.spyOn(console, "error").mockImplementation(() => {});
    // Without this a failed connection would tear down the test runner.
    exit = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
    exit.mockRestore();
    process.removeAllListeners("SIGINT");
  });

  it("should log success message when mongoose connects", async () => {
    (mockedMongoose.connect as jest.Mock).mockResolvedValue({
      connection: { host: "localhost" },
    } as never);

    await connectToMongoDB();

    expect(mockedMongoose.connect).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("MongoDB Connected: localhost")
    );
    expect(exit).not.toHaveBeenCalled();
  });

  it("should log error and exit when mongoose connection fails", async () => {
    (mockedMongoose.connect as jest.Mock).mockRejectedValue(
      new Error("ECONNREFUSED") as never
    );

    await connectToMongoDB();

    expect(error).toHaveBeenCalled();
    // The service must not continue silently against an unreachable database.
    expect(exit).toHaveBeenCalledWith(1);
  });

  it("should register handlers for connection loss and recovery", async () => {
    (mockedMongoose.connect as jest.Mock).mockResolvedValue({
      connection: { host: "localhost" },
    } as never);

    await connectToMongoDB();

    const events = (mockedMongoose.connection.on as jest.Mock).mock.calls.map(
      (call) => call[0]
    );
    expect(events).toEqual(
      expect.arrayContaining(["error", "disconnected", "reconnected"])
    );
  });
});

import { Response } from "express";

interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    status: number,
    message: string,
    data: T = {} as T
  ) {
    const response: ApiResponse<T> = {
      status,
      success: true,
      message,
      data,
    };

    return res.status(status).json(response);
  }

  static error(res: Response, status: number, message: string, data = {}) {
    const response: ApiResponse = {
      status,
      success: false,
      message,
      data,
    };

    return res.status(status).json(response);
  }
}

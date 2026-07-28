import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  user: Types.ObjectId;
  trainer: Types.ObjectId;
  pidx: string;
  transactionId?: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pidx: { type: String, required: true, unique: true },
    transactionId: { type: String },
    amount: { type: Number, required: true }, // Amount in Rupees
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const PaymentModel = model<IPayment>("Payment", paymentSchema);

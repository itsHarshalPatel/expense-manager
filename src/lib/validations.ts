import { z } from "zod";

export const TransactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentType: z.string().min(1, "Payment type is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  remark: z.string().optional().default(""),
  paymentDate: z.string().min(1, "Date is required"),
  groupId: z.string().optional(),
});

export const FriendSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  prefix: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  group: z.string().optional(),
});

export const GroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type FriendInput = z.infer<typeof FriendSchema>;
export type GroupInput = z.infer<typeof GroupSchema>;

export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
};

import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1, "数量至少为1"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "数量至少为1"),
});

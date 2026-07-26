import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(2, "优惠码至少2个字符")
    .regex(/^[A-Z0-9]+$/, "只能使用大写字母和数字"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z
    .number()
    .int()
    .min(1, "折扣值必须大于0")
    .refine(
      (val) => val <= 100,
      { message: "百分比不能超过100" }
    ),
  minOrderValue: z.number().int().min(0).nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, "请输入优惠码"),
  orderTotal: z.number().int().min(0),
});

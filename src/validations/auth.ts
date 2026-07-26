import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符").max(20),
  email: z.string().email("邮箱格式不正确"),
  password: z
    .string()
    .min(8, "密码至少8个字符")
    .regex(/[a-zA-Z]/, "密码必须包含字母")
    .regex(/[0-9]/, "密码必须包含数字"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

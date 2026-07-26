import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符").max(20),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少6个字符"),
});

export const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

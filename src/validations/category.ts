import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "分类名不能为空"),
  slug: z
    .string()
    .min(1, "Slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "只能包含小写字母、数字和连字符"),
});

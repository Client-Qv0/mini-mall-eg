import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "请评分").max(5),
  comment: z.string().max(500, "评论不能超过500字").optional(),
});

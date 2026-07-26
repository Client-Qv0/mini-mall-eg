import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "商品名不能为空"),
  description: z.string().min(1, "描述不能为空"),
  price: z.number().int().positive("价格必须为正整数"),
  stock: z.number().int().min(0, "库存不能为负"),
  categoryId: z.number().int().positive("请选择分类"),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

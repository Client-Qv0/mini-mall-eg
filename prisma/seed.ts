import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("user123", 12);
  const adminPasswordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@minimall.com",
      password: adminPasswordHash,
      role: "admin",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      username: "testuser",
      email: "user@test.com",
      password: passwordHash,
      role: "customer",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: { name: "电子产品", slug: "electronics" },
    }),
    prisma.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: { name: "服装", slug: "clothing" },
    }),
    prisma.category.upsert({
      where: { slug: "food" },
      update: {},
      create: { name: "食品", slug: "food" },
    }),
    prisma.category.upsert({
      where: { slug: "books" },
      update: {},
      create: { name: "图书", slug: "books" },
    }),
    prisma.category.upsert({
      where: { slug: "home" },
      update: {},
      create: { name: "家居用品", slug: "home" },
    }),
  ]);

  const electronicsProducts = [
    { name: "无线蓝牙耳机", price: 29900, stock: 100, description: "高品质降噪蓝牙耳机，续航30小时" },
    { name: "机械键盘", price: 45900, stock: 50, description: "Cherry MX 青轴，RGB背光" },
    { name: "USB-C 扩展坞", price: 19900, stock: 80, description: "7合1多功能扩展坞，支持4K输出" },
    { name: "便携充电宝 20000mAh", price: 12900, stock: 200, description: "大容量快充移动电源，支持PD3.0" },
  ];

  const clothingProducts = [
    { name: "纯棉T恤", price: 7900, stock: 300, description: "100%精梳棉，舒适透气" },
    { name: "牛仔裤", price: 25900, stock: 150, description: "修身直筒，弹力面料" },
    { name: "连帽卫衣", price: 19900, stock: 120, description: "加绒保暖，潮流宽松版型" },
    { name: "运动跑鞋", price: 39900, stock: 80, description: "轻量缓震，透气网面" },
  ];

  const foodProducts = [
    { name: "有机绿茶 250g", price: 5900, stock: 500, description: "高山云雾茶，清香回甘" },
    { name: "进口咖啡豆 500g", price: 8900, stock: 200, description: "阿拉比卡咖啡豆，中度烘焙" },
    { name: "坚果礼盒", price: 12900, stock: 150, description: "6种坚果混合装，每日一包" },
    { name: "蜂蜜柚子茶 500ml", price: 3900, stock: 300, description: "手工熬制，冷热皆宜" },
  ];

  const booksProducts = [
    { name: "深入理解计算机系统", price: 9900, stock: 60, description: "计算机科学经典教材，CSAPP第三版" },
    { name: "JavaScript高级程序设计", price: 8900, stock: 80, description: "前端开发必读，第4版" },
    { name: "三体全集", price: 6800, stock: 200, description: "刘慈欣科幻巨著，共三册" },
    { name: "设计模式", price: 5900, stock: 100, description: "GoF经典，面向对象软件设计" },
  ];

  const homeProducts = [
    { name: "北欧风台灯", price: 14900, stock: 90, description: "简约设计，三档调光，护眼LED" },
    { name: "记忆棉枕头", price: 12900, stock: 150, description: "慢回弹，颈椎支撑，透气枕套" },
    { name: "不锈钢保温杯 500ml", price: 9900, stock: 250, description: "316不锈钢，12小时保温" },
    { name: "收纳箱三件套", price: 6900, stock: 180, description: "可折叠，加厚PP材质" },
  ];

  const allProducts = [
    ...electronicsProducts.map((p) => ({ ...p, categoryIdx: 0 })),
    ...clothingProducts.map((p) => ({ ...p, categoryIdx: 1 })),
    ...foodProducts.map((p) => ({ ...p, categoryIdx: 2 })),
    ...booksProducts.map((p) => ({ ...p, categoryIdx: 3 })),
    ...homeProducts.map((p) => ({ ...p, categoryIdx: 4 })),
  ];

  for (const p of allProducts) {
    await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description,
        categoryId: categories[p.categoryIdx].id,
        imageUrl: `/uploads/placeholder.svg`,
      },
    });
  }

  const products = await prisma.product.findMany({ take: 5 });

  await prisma.review.createMany({
    data: [
      { userId: user.id, productId: products[0].id, rating: 5, comment: "音质很棒，降噪效果出乎意料的好" },
      { userId: user.id, productId: products[1].id, rating: 4, comment: "手感不错，灯光很炫" },
      { userId: admin.id, productId: products[0].id, rating: 4, comment: "性价比很高，推荐购买" },
    ],
  });

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.coupon.upsert({
      where: { code: "WELCOME10" },
      update: {},
      create: {
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 5000,
        usageLimit: 100,
        expiresAt: nextMonth,
      },
    }),
    prisma.coupon.upsert({
      where: { code: "SAVE50" },
      update: {},
      create: {
        code: "SAVE50",
        discountType: "FIXED",
        discountValue: 5000,
        minOrderValue: 20000,
        usageLimit: 50,
        expiresAt: nextWeek,
      },
    }),
    prisma.coupon.upsert({
      where: { code: "SUMMER20" },
      update: {},
      create: {
        code: "SUMMER20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderValue: 10000,
        usageLimit: 200,
        expiresAt: nextMonth,
      },
    }),
  ]);

  console.log("Seed completed:");
  console.log(`  Users: ${await prisma.user.count()}`);
  console.log(`  Categories: ${await prisma.category.count()}`);
  console.log(`  Products: ${await prisma.product.count()}`);
  console.log(`  Reviews: ${await prisma.review.count()}`);
  console.log(`  Coupons: ${await prisma.coupon.count()}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

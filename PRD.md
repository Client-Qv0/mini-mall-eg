# Mini Mall PRD

## 项目概述

微型电商项目，支持商品浏览、用户注册登录、购物车、下单、优惠券、模拟支付、后台管理、商品评价。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.2.11 | App Router |
| React | 19.2.4 | |
| TypeScript | ^5 | strict mode |
| Prisma | 6.19.3 | ORM (Node 24 兼容) |
| SQLite | — | 通过 Prisma 驱动 |
| TailwindCSS | ^4 | |
| jose | 6.2.4 | JWT 认证 |
| bcryptjs | 3.0.3 | 密码哈希 |
| zod | 4.4.3 | 请求校验 |
| tsx | ^4.23.1 | 运行 seed 脚本 |

## 功能模块

### 前台

- **商品浏览**：首页精选、列表页（SSR + SearchParams 分页）、搜索、分类筛选、详情页
- **用户系统**：注册、登录、登出，JWT cookie 认证
- **购物车**：添加、修改数量、删除、清空（仅登录用户）
- **订单**：从购物车下单、模拟支付（点击改状态）、订单列表/详情、状态流转
- **优惠券**：下单时输入优惠码，支持百分比/固定金额折扣，最低消费门槛，使用次数限制，过期校验
- **评价**：1-5 星评分 + 可选文字评论，每用户每商品限评一次

### 后台管理

- **仪表盘**：订单数、商品数、用户数统计
- **商品管理**：CRUD、图片上传（本地 public/uploads）
- **订单管理**：查看、状态更新
- **分类管理**：CRUD
- **优惠券管理**：CRUD

## 数据模型

```prisma
model User {
  id        Int        @id @default(autoincrement())
  username  String     @unique
  email     String     @unique
  password  String
  role      String     @default("customer") // "customer" | "admin"
  createdAt DateTime   @default(now())
  orders    Order[]
  cartItems CartItem[]
  reviews   Review[]
}

model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now())
  products  Product[]
}

model Product {
  id          Int         @id @default(autoincrement())
  name        String
  description String
  price       Int         // 单位：分
  imageUrl    String?
  stock       Int         @default(0)
  categoryId  Int
  category    Category    @relation(fields: [categoryId], references: [id])
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  orderItems  OrderItem[]
  cartItems   CartItem[]
  reviews     Review[]
}

model CartItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  @@unique([userId, productId])
}

model Order {
  id             Int         @id @default(autoincrement())
  userId         Int
  user           User        @relation(fields: [userId], references: [id])
  status         String      @default("pending") // pending|paid|shipped|completed|cancelled
  subtotal       Int         // 商品小计，单位：分
  discountAmount Int         @default(0)   // 优惠金额，单位：分
  total          Int         // subtotal - discountAmount
  couponId       Int?
  coupon         Coupon?     @relation(fields: [couponId], references: [id])
  createdAt      DateTime    @default(now())
  items          OrderItem[]
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Int     // 下单时快照价格，单位：分
}

model Review {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
  @@unique([userId, productId])
}

model Coupon {
  id            Int       @id @default(autoincrement())
  code          String    @unique
  discountType  String    @default("PERCENTAGE")  // PERCENTAGE | FIXED
  discountValue Int                               // 百分比 1-100，固定金额则为分
  minOrderValue Int?                              // 最低消费（分）
  usageLimit    Int?                              // 使用次数上限
  usedCount     Int       @default(0)
  expiresAt     DateTime?
  isActive      Boolean   @default(true)
  orders        Order[]
  createdAt     DateTime  @default(now())
}
```

## API 路由

| Method | Path | 说明 | 权限 |
|--------|------|------|------|
| POST | /api/auth/register | 注册 | public |
| POST | /api/auth/login | 登录 | public |
| POST | /api/auth/logout | 登出 | user |
| GET | /api/auth/me | 当前用户 | user |
| GET | /api/products | 列表（?search=&categoryId=&page=&pageSize=） | public |
| GET | /api/products/[id] | 详情 | public |
| POST | /api/products | 创建 | admin |
| PUT | /api/products/[id] | 更新 | admin |
| DELETE | /api/products/[id] | 删除 | admin |
| GET | /api/categories | 全部 | public |
| POST | /api/categories | 创建 | admin |
| PUT | /api/categories/[id] | 更新 | admin |
| DELETE | /api/categories/[id] | 删除 | admin |
| GET | /api/cart | 我的购物车 | user |
| POST | /api/cart | 添加商品 | user |
| PUT | /api/cart/[id] | 修改数量 | user |
| DELETE | /api/cart/[id] | 移除 | user |
| POST | /api/orders | 从购物车创建订单 | user |
| GET | /api/orders | 我的订单 | user |
| GET | /api/orders/[id] | 订单详情 | user |
| PUT | /api/orders/[id]/status | 更新状态 | admin |
| POST | /api/orders/[id]/pay | 模拟支付 | user |
| GET | /api/products/[id]/reviews | 评价列表 | public |
| POST | /api/products/[id]/reviews | 提交评价 | user |
| POST | /api/coupon/validate | 校验优惠码 `{ code, orderTotal }` | user |
| GET | /api/admin/coupons | 优惠券列表 | admin |
| POST | /api/admin/coupons | 创建优惠券 | admin |
| PUT | /api/admin/coupons/[id] | 更新优惠券 | admin |
| DELETE | /api/admin/coupons/[id] | 删除优惠券 | admin |

## 渲染策略

- 前台：SSR + SearchParams（URL 参数驱动搜索/分页）
- 后台：CSR（fetch API）
- 购物车/用户交互：客户端状态

## 目录结构

```
mini-mall/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── categories/page.tsx
│   │   │   └── coupons/page.tsx
│   │   ├── api/
│   │   │   ├── auth/...
│   │   │   ├── products/...
│   │   │   ├── cart/...
│   │   │   ├── orders/...
│   │   │   └── categories/...
│   │   │   └── coupon/...
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── auth/
│   │   └── admin/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/uploads/
├── .env
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## 实施步骤

1. 项目初始化（create-next-app + 依赖安装）
2. Prisma Schema + 迁移 + seed
3. 全局布局 & 基础 UI 组件
4. 认证系统
5. 商品模块
6. 购物车模块
7. 订单模块
8. 后台管理
9. 评价系统
10. 优惠券系统
11. lint/typecheck

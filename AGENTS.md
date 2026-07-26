# Mini Mall — AI Agent Instructions

微型电商演示项目，含商品浏览、用户认证、购物车、下单、优惠券、评价、后台管理。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.11 | App Router 框架 |
| React | 19.2.4 | UI 库 |
| TypeScript | ^5 | strict mode |
| Prisma | 6.19.3 | ORM |
| SQLite | — | 数据库 |
| TailwindCSS | ^4 | 样式 |
| jose | 6.2.4 | JWT 签发/校验 |
| bcryptjs | 3.0.3 | 密码哈希 |
| zod | 4.4.3 | 请求/表单校验 |
| tsx | ^4.23.1 | TypeScript 执行器 (seed) |

## 目录结构

```
mini-mall/
├── prisma/
│   ├── schema.prisma          # 数据模型
│   └── seed.ts                # 种子数据
├── src/
│   ├── app/
│   │   ├── (shop)/            # 前台路由组
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── products/
│   │   │   │   ├── page.tsx   # 商品列表
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/             # 后台
│   │   │   ├── page.tsx       # 仪表盘
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── categories/page.tsx
│   │   │   └── coupons/page.tsx
│   │   ├── api/               # Route Handlers
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── categories/
│   │   │   └── coupon/
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Button, Input, Modal, Pagination
│   │   ├── product/           # ProductCard, ProductGrid
│   │   ├── cart/              # CartItem, CartSummary
│   │   ├── order/             # OrderStatusBadge
│   │   ├── auth/              # LoginForm, RegisterForm
│   │   └── admin/             # Sidebar, StatCard, ProductForm
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 单例
│   │   ├── auth.ts            # JWT sign/verify
│   │   └── utils.ts           # formatCurrency, cn
│   ├── types/
│   │   └── index.ts           # 共享类型
│   └── middleware.ts          # 路由鉴权
├── public/uploads/            # 商品图片
├── .env                       # DATABASE_URL, JWT_SECRET
├── PRD.md                     # 完整产品文档
└── package.json
```

## 常用命令

```bash
npm run dev              # 开发服务器 (localhost:3000)
npm run build            # 生产构建
npm run lint             # ESLint
npx prisma db push       # 同步 schema → SQLite
npx prisma db seed       # 运行种子脚本
npx prisma studio        # 数据库 GUI
npx prisma generate      # 生成 Prisma Client
npx tsx prisma/seed.ts   # 直接运行 seed
```

## 数据模型 (8 个)

```
User ──→ CartItem ←── Product ──→ Category
  │        │                                  │
  │        └──→ Order ──→ OrderItem ←────────┘
  │                  │
  └──→ Review        └──→ Coupon
```

核心约定：
- 价格一律用 `Int`，单位**分**（避免浮点精度问题）
- 角色枚举：`"customer"` | `"admin"`
- 订单状态：`"pending"` → `"paid"` → `"shipped"` → `"completed"` / `"cancelled"`
- 优惠券折扣类型：`"PERCENTAGE"`（1-100）| `"FIXED"`（分）

详见 `prisma/schema.prisma` 和 `PRD.md`。

## 认证方案

- JWT token 存储在 httpOnly cookie（名 `token`），自动随请求发送
- 服务端用 `jose` 库签发/校验，不依赖 next-auth
- 密码 bcryptjs 哈希（cost=12）
- `middleware.ts` 拦截 `/admin/*` 和敏感 `/api/*` 路由，校验 role=admin
- API Routes 通过 `lib/auth.ts` 的工具函数读取当前用户

## 身份分层

| 层级 | 用户 | 访问范围 |
|------|------|----------|
| public | 未登录 | 商品浏览、搜索、分类、评价查看、注册/登录 |
| user | 已登录 (customer) | 购物车、下单、支付、订单管理、评价、优惠券校验 |
| admin | 已登录 (admin) | 后台全部功能、商品/分类/优惠券 CRUD、订单状态管理 |

## 渲染策略

- **前台**：SSR + SearchParams（URL 参数驱动搜索/分页/筛选，SEO 友好）
- **后台**：CSR（fetch API 请求，客户端渲染）
- **交互状态**：React Context + useState（购物车、用户会话）
- 不引入 zustand、react-hook-form、shadcn/ui 等额外库——全部手写

## API 约定

- 全部使用 Next.js Route Handlers（`route.ts`），不单独搭建 Express
- 请求体用 Zod schema 校验
- 公开接口无鉴权，用户接口需 JWT，管理员接口需 role=admin
- 返回格式：`{ data, error, message }`
- 全部 API 端点见 `PRD.md`

## 编码规范

- TypeScript strict mode，禁止 `any`
- 所有组件使用函数组件 + 箭头函数，不写默认导出
- `src/lib/utils.ts` 提供 `cn()`（classnames 合并）和 `formatCurrency()`（分→元格式化）
- 组件分属于对应功能目录（`components/product/`、`components/admin/` 等）
- 每个 `layout.tsx` 包裹对应的路由组
- 不添加代码注释，除非逻辑极复杂必须说明

## 实施计划 (11 步)

1. ✅ 项目初始化（create-next-app + 依赖安装）
2. ✅ Prisma Schema + 迁移 + seed
3. ✅ 全局布局 & 基础 UI 组件
4. ✅ 认证系统
5. ✅ 商品模块
6. ✅ 购物车模块
7. ✅ 订单模块
8. ✅ 后台管理
9. ✅ 评价系统
10. ✅ 优惠券系统
11. ✅ lint/typecheck

## 种子测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 普通用户 | user@test.com | user123 |

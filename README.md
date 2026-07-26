# Mini Mall

微型电商项目 — Next.js 16 + TypeScript + Prisma + SQLite + TailwindCSS 4

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.11 | App Router |
| React | 19.2.4 | UI |
| TypeScript | ^5 | strict mode |
| Prisma | 6.19.3 | ORM |
| SQLite | — | 数据库 |
| TailwindCSS | ^4 | 样式 |
| jose | 6.2.4 | JWT 认证 |
| bcryptjs | 3.0.3 | 密码哈希 |
| zod | 4.4.3 | 请求校验 |

## 功能

**前台**
- 商品浏览 — 首页精选、列表页（搜索/分类筛选/分页，SSR）、详情页
- 用户系统 — 注册、登录、登出，JWT httpOnly Cookie 认证
- 购物车 — 添加、修改数量、删除，库存校验，Header 数量角标
- 下单结算 — 事务保证库存一致性，下单时价格快照，优惠券支持
- 订单管理 — 列表、详情、模拟支付（pending → paid）
- 评价系统 — 1-5 星评分 + 文字评论，每用户每商品限评一次
- 优惠券 — 百分比/固定金额折扣，最低消费门槛，使用次数限制

**后台管理**
- 仪表盘 — 商品/订单/用户数统计
- 商品管理 — CRUD + 表格展示
- 订单管理 — 列表 + 状态下拉实时更新
- 分类管理 — CRUD（Modal 表单）
- 优惠券管理 — CRUD（折扣类型/金额/有效期/用量）

**安全**
- JWT 密钥启动校验，无硬编码回退
- JWT jti 吊销（登出即失效）
- 登录/注册 IP 级速率限制
- 时序攻击防护（dummy bcrypt compare）
- httpOnly + secure + sameSite Cookie
- Zod 输入校验，Prisma 参数化查询

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 填充种子数据
npm run db:seed

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 普通用户 | user@test.com | user123 |

## 命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run lint         # ESLint
npm run db:push      # 同步 schema → SQLite
npm run db:seed      # 运行种子脚本
npm run db:studio    # Prisma Studio 数据库浏览器
```

## 项目结构

```
mini-mall/
├── prisma/
│   ├── schema.prisma         # 8 个数据模型
│   └── seed.ts               # 种子数据（20 商品 / 5 分类 / 3 优惠券）
├── src/
│   ├── app/
│   │   ├── (shop)/           # 前台路由组
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── products/     # 商品列表 / 详情
│   │   │   ├── cart/         # 购物车
│   │   │   └── orders/       # 订单列表 / 详情
│   │   ├── auth/             # 登录 / 注册
│   │   ├── admin/            # 后台管理（仪表盘 / 商品 / 订单 / 分类 / 优惠券）
│   │   └── api/              # RESTful API
│   ├── components/
│   │   ├── ui/               # Button / Input / Modal / Pagination
│   │   ├── layout/           # Header / Footer / AdminSidebar
│   │   ├── product/          # ProductCard / SearchBar / CategoryFilter
│   │   ├── cart/             # CartItems / CartSummary / AddToCartButton
│   │   ├── order/            # OrderStatusBadge / PayButton
│   │   ├── auth/             # LoginForm / RegisterForm
│   │   ├── review/           # ReviewForm
│   │   └── admin/            # ProductForm
│   ├── lib/
│   │   ├── prisma.ts         # Prisma 单例
│   │   ├── auth.ts           # JWT 签发/校验/撤销
│   │   ├── rate-limiter.ts   # 内存速率限制器
│   │   └── utils.ts          # cn() / formatCurrency()
│   ├── validations/          # Zod schemas
│   ├── types/                # 共享 TypeScript 类型
│   └── middleware.ts         # 路由鉴权
├── public/uploads/           # 商品图片
└── .env.example
```

## 数据模型

```
User ──→ CartItem ←── Product ──→ Category
  │        │
  │        └──→ Order ──→ OrderItem
  │                  │
  └──→ Review        └──→ Coupon
```

- 价格用 `Int`，单位**分**
- 角色：`customer` / `admin`
- 订单状态：`pending` → `paid` → `shipped` → `completed` / `cancelled`
- 优惠券类型：`PERCENTAGE` / `FIXED`

## API

| Method | Path | 权限 |
|--------|------|------|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| POST | /api/auth/logout | user |
| GET | /api/auth/me | user |
| GET | /api/products | public |
| GET | /api/products/[id] | public |
| POST | /api/products | admin |
| PUT | /api/products/[id] | admin |
| DELETE | /api/products/[id] | admin |
| GET | /api/categories | public |
| POST | /api/categories | admin |
| PUT | /api/categories/[id] | admin |
| DELETE | /api/categories/[id] | admin |
| GET | /api/cart | user |
| POST | /api/cart | user |
| PUT | /api/cart/[id] | user |
| DELETE | /api/cart/[id] | user |
| POST | /api/orders | user |
| GET | /api/orders | user |
| GET | /api/orders/[id] | user |
| PUT | /api/orders/[id] | admin |
| POST | /api/orders/[id]/pay | user |
| GET | /api/products/[id]/reviews | public |
| POST | /api/products/[id]/reviews | user |
| POST | /api/coupon/validate | user |
| GET | /api/admin/coupons | admin |
| POST | /api/admin/coupons | admin |
| PUT | /api/admin/coupons/[id] | admin |
| DELETE | /api/admin/coupons/[id] | admin |

## License

MIT

# 优选商城 - Vue3 电商前端项目

基于 Vue3 + TypeScript + Vite 构建的移动端电商项目，涵盖商品浏览、购物车、订单结算、优惠券、秒杀等核心电商功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 语言 | TypeScript |
| 构建工具 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 请求 | Axios（封装请求/响应拦截器） |
| UI 组件库 | Vant 4 + Element Plus |
| Mock 数据 | Mock.js |
| 代码规范 | ESLint + Prettier |
| 单元测试 | Vitest |

## 项目结构

```
src/
├── api/              # API 接口层（按模块拆分）
│   ├── address.ts    # 地址管理
│   ├── cart.ts       # 购物车
│   ├── coupon.ts     # 优惠券
│   ├── login.ts      # 登录注册
│   ├── order.ts      # 订单
│   ├── product.ts    # 商品
│   └── seckill.ts    # 秒杀
├── components/       # 公共组件
├── mock/             # Mock 数据与接口模拟
├── router/           # 路由配置
├── stores/           # Pinia 状态管理（按模块拆分）
│   ├── cart.ts       # 购物车状态（含 localStorage 持久化）
│   ├── product.ts    # 商品收藏
│   ├── user.ts       # 用户登录状态
│   └── favorite.ts   # 收藏夹
├── types/            # TypeScript 类型定义（按领域拆分）
├── utils/            # 工具函数（价格计算、优惠券计算、本地存储）
├── views/            # 页面组件（按功能模块拆分）
│   ├── cart/         # 购物车页
│   ├── checkout/     # 结算页
│   ├── home/         # 首页
│   ├── login/        # 登录注册
│   ├── order/        # 订单列表
│   ├── product/      # 商品列表/详情
│   └── user/         # 用户中心/收藏/优惠券
└── __tests__/        # 单元测试
```

## 核心功能模块

- **商品模块**：商品列表、分类筛选、商品详情、规格选择、收藏/取消收藏
- **购物车**：添加/删除/修改数量、全选/单选、库存校验、localStorage 持久化
- **订单模块**：订单预览、优惠券抵扣、地址选择、提交订单、订单列表
- **优惠券**：优惠券领取、满减/折扣/无门槛三种类型、自动计算最优折扣
- **秒杀模块**：限时秒杀商品展示、库存倒计时
- **用户模块**：登录/注册、地址管理、个人中心

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（Mock 数据模式）
npm run dev

# 构建生产版本
npm run build

# 运行单元测试
npm test

# 代码检查
npm run lint
```

## 状态管理设计

- **userStore**：管理用户登录状态、token、用户信息
- **cartStore**：管理购物车数据，支持 localStorage 持久化与后端同步
- **productStore**：管理商品收藏状态
- **favoriteStore**：管理收藏夹列表

## API 层设计

- 统一使用 Axios 实例，配置 `baseURL`、超时时间
- 请求拦截器：自动携带 token
- 响应拦截器：统一处理 HTTP 状态码与业务状态码
- 按业务模块拆分 API 文件，TypeScript 接口类型约束请求/响应
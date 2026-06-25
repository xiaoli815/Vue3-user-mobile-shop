# 优选商城 - Vue3 移动端电商项目

基于 Vue3 + TypeScript + Vite + Pinia 构建的移动端电商应用，涵盖商品浏览、搜索、购物车、订单结算、优惠券、秒杀等核心电商功能。全量 Mock 数据驱动，无需后端即可完整运行与演示。

**在线体验**：[https://xiaoli815.github.io/Vue3-user-mobile-shop/](https://xiaoli815.github.io/Vue3-user-mobile-shop/)

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 语言 | TypeScript |
| 构建工具 | Vite 6 |
| 状态管理 | Pinia + pinia-plugin-persistedstate |
| 路由 | Vue Router 4（Hash 模式 + 路由懒加载） |
| HTTP | Axios（XHR 适配器 + 拦截器） |
| UI 组件库 | Vant 4 |
| Mock 数据 | Mock.js + vite-plugin-mock（开发 & 生产环境均可用） |
| 数据生成 | @faker-js/faker |
| 图片优化 | vite-plugin-image-optimizer（自动生成 WebP） |
| 代码压缩 | Gzip（vite-plugin-compression）+ Terser |
| 代码规范 | ESLint + Prettier |
| 单元测试 | Vitest + @testing-library/vue |

## 项目结构

```
src/
├── api/                  # API 接口层
│   ├── address.ts        # 地址管理
│   ├── cart.ts           # 购物车
│   ├── category.ts       # 分类
│   ├── coupon.ts         # 优惠券
│   ├── home.ts           # 首页（轮播图、热门推荐）
│   ├── login.ts          # 登录注册
│   ├── order.ts          # 订单
│   ├── product.ts        # 商品
│   ├── search.ts         # 搜索（建议 + 商品搜索）
│   ├── seckill.ts        # 秒杀
│   └── shipping.ts       # 运费计算
├── components/           # 公共组件
│   ├── home/ProductList.vue   # 商品卡片列表（异步组件）
│   ├── CouponPopUp.vue        # 优惠券选择弹窗
│   ├── Skeleton.vue           # 骨架屏
│   ├── SkuPopUp.vue           # 规格选择弹窗
│   └── Tabbar.vue             # 底部导航栏（fixed 定位）
├── composables/          # 组合式函数
│   ├── useDebounce.ts         # 防抖
│   ├── useLoading.ts          # 加载状态管理
│   ├── usePagination.ts       # 分页/下拉加载更多
│   └── useSearchHistory.ts    # 搜索历史（localStorage 持久化）
├── directives/           # 自定义指令
│   └── lazy.ts           # 图片懒加载（IntersectionObserver）
├── mock/                 # Mock 数据（14 个模块，60+ 接口）
│   ├── index.ts          # Mock 入口 + setupProdMockServer
│   ├── storage.ts        # 内存/localStorage 兼容存储适配
│   ├── product.ts        # 30 个真实商品 + SKU + 商品列表/详情/收藏 API
│   ├── home.ts           # 轮播图、热门商品、分类
│   ├── cart.ts           # 购物车 CRUD
│   ├── order.ts          # 订单创建/列表/支付/确认收货
│   ├── address.ts        # 地址 CRUD + 默认地址（localStorage 持久化）
│   ├── coupon.ts         # 优惠券领取/列表/计算
│   ├── seckill.ts        # 秒杀商品列表
│   ├── search.ts         # 搜索建议 + 商品搜索（按名称/描述）
│   ├── shipping.ts       # 运费规则计算
│   ├── category.ts       # 分类数据
│   ├── user.ts           # 用户登录/注册
│   └── goods.ts          # 商品详情扩展数据
├── router/               # 路由配置（16 条路由，全部懒加载）
├── stores/               # Pinia Store
│   ├── cart.ts           # 购物车（persistedstate 持久化）
│   ├── favorite.ts       # 收藏夹
│   ├── order.ts          # 订单临时数据
│   ├── product.ts        # 商品收藏状态管理
│   └── user.ts           # 用户登录状态 + token
├── types/                # TypeScript 类型定义（11 个领域文件）
│   ├── address.ts / cart.ts / coupon.ts / home.ts
│   ├── order.ts / product.ts / seckill.ts / shipping.ts
│   ├── user.ts / category.ts / api.ts / index.ts
├── utils/                # 工具函数
│   ├── request.ts        # Axios 实例（拦截器 + 类型解包）
│   ├── price.ts          # 价格格式化
│   ├── coupon.ts         # 优惠券计算引擎
│   ├── shipping.ts       # 运费计算规则
│   ├── token.ts          # Token 存取
│   ├── storage.ts        # localStorage 封装
│   └── area.ts           # 省市区数据处理
├── views/                # 页面组件（16 个页面）
│   ├── home/Home.vue          # 首页（轮播图、分类、秒杀、推荐）
│   ├── product/ProductList.vue  # 商品列表（筛选 + 排序 + 下拉加载）
│   ├── product/ProductDetail.vue # 商品详情（SKU 选择、收藏）
│   ├── cart/Cart.vue           # 购物车（全选、数量调整、结算）
│   ├── checkout/Checkout.vue   # 订单结算（地址、优惠券、运费）
│   ├── seckill/index.vue       # 秒杀专区
│   ├── user/UserCenter.vue     # 个人中心
│   ├── user/OrderList.vue      # 订单列表（状态筛选、支付、收货）
│   ├── user/Refund.vue         # 申请退款
│   ├── user/Address.vue        # 地址管理
│   ├── user/Coupon.vue         # 优惠券中心
│   ├── user/Favorite.vue       # 我的收藏
│   ├── user/Login.vue          # 登录
│   ├── user/Register.vue       # 注册
│   ├── user/Setting.vue        # 设置
│   └── ...
└── __tests__/             # 单元测试
    ├── coupon.test.ts
    ├── price.test.ts
    └── storage.test.ts
```

## 核心功能

### 首页
- 轮播图（首图 eager 加载 + 其余懒加载，固定高度防 CLS）
- 8 分类导航（手机数码、服装鞋帽、家用电器、美妆护肤、食品生鲜、家居家装、母婴玩具、图书文娱）
- 秒杀专区（横向滚动）
- 搜索（搜索建议、搜索历史、防抖）
- 热门商品推荐（下拉加载更多 + 骨架屏）
- 异步组件加载 ProductList

### 商品模块
- 分类/关键词/排序筛选（综合、价格升降、销量）
- 图片懒加载指令（`v-lazy`，IntersectionObserver）
- 搜索支持商品名称和描述匹配
- 下拉加载更多（usePagination）
- 商品详情：图片轮播、SKU 规格选择、收藏/取消

### 购物车
- 添加/删除/修改数量（含库存校验）
- 全选/单选 + 价格汇总
- 登录校验（未登录跳转登录页）
- localStorage 持久化（Pinia persistedstate）

### 订单模块
- 订单预览（商品列表 + 地址选择 + 优惠券选择 + 运费计算）
- 提交订单（库存扣减、清空购物车已购商品）
- 订单列表（全部/待付款/待发货/待收货/待评价 状态筛选）
- 支付（模拟）、确认收货、申请退款
- 订单数据 localStorage 持久化

### 优惠券
- 三种类型：满减券、折扣券、无门槛券
- 优惠券领取
- 结算时自动计算最优优惠

### 用户模块
- 登录/注册（模拟 token）
- 地址管理（增删改查、设置默认地址，localStorage 持久化）
- 收藏夹
- 个人中心

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 本地预览构建产物
npm run preview

# 运行单元测试
npm test

# 代码检查与格式化
npm run lint
npm run format
```

## 环境变量

项目根目录 `.env` 文件：

```env
VITE_APP_TITLE=优选商城
VITE_API_BASE_URL=/api
VITE_USE_MOCK=true    # false 则走真实后端 API
```

## 性能优化

- **路由懒加载**：全部 16 条路由使用动态 `import()`
- **代码分割**：vant / axios / mockjs / pinia / area-data 独立 chunk
- **Gzip 压缩**：构建产物 .gz 文件，体积减少 60-70%
- **图片优化**：WebP 格式生成、mozjpeg 压缩、缓存复用
- **图片懒加载**：自定义 `v-lazy` 指令（IntersectionObserver + 50px 预加载距离）
- **首屏优化**：banner 图片 preload、内联关键 CSS、v-cloak 防闪烁、骨架屏
- **CLS 优化**：轮播图/区域固定最小高度、图片显式宽高
- **异步组件**：ProductList 使用 `defineAsyncComponent`
- **构建优化**：Terser 压缩 + 移除 console/debugger

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages：

```
https://xiaoli815.github.io/Vue3-user-mobile-shop/
```

每次推送到 `main` 分支自动触发构建与部署。

## 设计要点

- **全量 Mock**：Mock.js + vite-plugin-mock，60+ 接口覆盖首页到订单完整流程，生产环境也可独立运行
- **真实数据**：商品数据由 @faker-js/faker 生成，30 个商品覆盖 8 大品类、每个商品包含 SKU 规格组合
- **类型安全**：TypeScript 全量覆盖，API 请求/响应类型约束，消除 `any` 类型
- **状态持久化**：购物车、地址、订单、搜索历史等核心数据通过 localStorage 持久化
- **移动端适配**：max-width 750px、touch 交互、Vant 移动端组件

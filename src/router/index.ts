import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/home/Home.vue'),
      meta: { title: '优选商城', requiresAuth: false }
    },
    {
      path: '/product/list',
      name: 'ProductList',
      component: () => import('@/views/product/ProductList.vue'),
      meta: { title: '商品列表', requiresAuth: false }
    },
    {
      path: '/product/detail',
      name: 'ProductDetail',
      component: () => import('@/views/product/ProductDetail.vue'),
      meta: { title: '商品详情', requiresAuth: false }
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('@/views/cart/Cart.vue'),
      meta: { title: '购物车', requiresAuth: true }
    },
    {
      path: '/checkout/:id?',
      name: 'Checkout',
      component: () => import('@/views/checkout/Checkout.vue'),
      meta: { title: '确认订单', requiresAuth: true }
    },
    {
      path: '/user',
      name: 'UserCenter',
      component: () => import('@/views/user/UserCenter.vue'),
      meta: { title: '个人中心', requiresAuth: true }
    },
    {
      path: '/orders/:id?',
      name: 'OrderList',
      component: () => import('@/views/user/OrderList.vue'),
      meta: { title: '我的订单', requiresAuth: true }
    },
    {
      path: '/refund/:id',
      name: 'Refund',
      component: () => import('@/views/user/Refund.vue'),
      meta: { title: '申请退款', requiresAuth: true }
    },
    {
      path: '/seckill',
      name: 'Seckill',
      component: () => import('@/views/seckill/index.vue'),
      meta: { title: '秒杀商品', requiresAuth: false }
    },
    {
      path: '/setting',
      name: 'Setting',
      component: () => import('@/views/user/Setting.vue'),
      meta: { title: '设置', requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/user/Login.vue'),
      meta: { title: '登录', requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/user/Register.vue'),
      meta: { title: '注册', requiresAuth: false }
    },
    {
      path: '/favorite',
      name: 'Favorite',
      component: () => import('@/views/user/Favorite.vue'),
      meta: { title: '我的收藏', requiresAuth: true }
    },
    {
      path: '/coupon',
      name: 'Coupon',
      component: () => import('@/views/user/Coupon.vue'),
      meta: { title: '优惠券中心', requiresAuth: true }
    },
  ]
})

router.beforeEach((to,from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '优选商城'

  const userStore = useUserStore()

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 保存当前路由，登录后跳转回来
    const redirect = to.fullPath
    next({
      path: '/login',
      query: { redirect }
    })
  } else {
    next()
  }
})

export default router
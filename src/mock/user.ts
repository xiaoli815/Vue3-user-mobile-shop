import Mock from 'mockjs'
import { getToken, removeToken as clearToken } from '@/utils/token'
import type { MockOptions } from './index'
import { getItem, setItem } from './storage'

interface User {
  id: number
  nickname: string
  avatar: string
  phone: string
  password: string
}

const userStore: Record<string, User> = {
  admin: {
    id: 1,
    nickname: '小明',
    avatar: './images/avatar_sm.jpg',
    phone: '13800138000',
    password: '123456'
  },
  test: {
    id: 2,
    nickname: '测试用户',
    avatar: './images/avatar_sm.jpg',
    phone: '13900139000',
    password: '123456'
  }
}

const TOKEN_STORE_KEY = 'token_store'
let tokenStore: Record<string, number> = {}

const loadTokenStore = () => {
  try {
    const data = getItem(TOKEN_STORE_KEY)
    if (data) {
      tokenStore = JSON.parse(data)
    }
  } catch (e) {
    console.error('加载 tokenStore 失败:', e)
    tokenStore = {}
  }
}

const saveTokenStore = () => {
  try {
    setItem(TOKEN_STORE_KEY, JSON.stringify(tokenStore))
  } catch (e) {
    console.error('保存 tokenStore 失败:', e)
  }
}

loadTokenStore()

interface LoginBody {
  username: string
  password: string
}

Mock.mock('/api/user/login', 'post', (options: MockOptions) => {
  let body: LoginBody = { username: '', password: '' }
  try {
    if (typeof options.body === 'string') {
      body = JSON.parse(options.body)
    }
  } catch (e) {
    console.error('解析请求体失败:', e)
  }
  const { username, password } = body
  const user = userStore[username]
  if (!user || user.password !== password) {
    return { code: 401, msg: '用户名或密码错误', data: null }
  }
  const token = `token_${user.id}_${Date.now()}`
  tokenStore[token] = user.id
  saveTokenStore()
  return {
    code: 200,
    msg: '登录成功',
    data: {
      token,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone
      }
    }
  }
})

interface MockOptionsWithHeaders extends MockOptions {
  headers?: Record<string, string>
}

Mock.mock('/api/user/info', 'get', (options: MockOptionsWithHeaders) => {
  let token = (options.headers || {}).Authorization || (options.headers || {}).authorization || ''

  if (!token) {
    token = getToken() || ''
  }

  const userId = tokenStore[token.replace('Bearer ', '')]
  if (!userId) {
    return { code: 401, msg: '未登录或登录已过期', data: null }
  }
  const user = Object.values(userStore).find(u => u.id === userId)
  if (!user) {
    return { code: 401, msg: '用户不存在', data: null }
  }
  return {
    code: 200,
    msg: 'success',
    data: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone
    }
  }
})

Mock.mock('/api/user/logout', 'post', (options: MockOptionsWithHeaders) => {
  let token = (options.headers || {}).Authorization || (options.headers || {}).authorization || ''

  if (!token) {
    token = getToken() || ''
  }

  delete tokenStore[token.replace('Bearer ', '')]
  saveTokenStore()
  clearToken()
  return { code: 200, msg: '退出成功', data: null }
})

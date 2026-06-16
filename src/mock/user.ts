import Mock from 'mockjs'

// ========== 用户数据存储 ==========
const userStore: Record<string, { id: number; nickname: string; avatar: string; phone: string; password: string }> = {
  'admin': { id: 1, nickname: '小明', avatar: '/images/avatar.png', phone: '13800138000', password: '123456' },
  'test': { id: 2, nickname: '测试用户', avatar: '/images/avatar.png', phone: '13900139000', password: '123456' }
}

// 当前登录用户的 token 映射 - 从 localStorage 恢复
const TOKEN_STORE_KEY = 'token_store'
let tokenStore: Record<string, number> = {}

// 从 localStorage 恢复 tokenStore
const loadTokenStore = () => {
  try {
    const data = localStorage.getItem(TOKEN_STORE_KEY)
    if (data) {
      tokenStore = JSON.parse(data)
    }
  } catch (e) {
    console.error('加载 tokenStore 失败:', e)
    tokenStore = {}
  }
}

// 保存 tokenStore 到 localStorage
const saveTokenStore = () => {
  try {
    localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(tokenStore))
  } catch (e) {
    console.error('保存 tokenStore 失败:', e)
  }
}

// 初始化加载
loadTokenStore()

// ========== Mock 接口 ==========

// 登录
Mock.mock('/api/user/login', 'post', (options: any) => {
  let body = options.body
  // 尝试解析请求体
  try {
    if (typeof body === 'string') {
      body = JSON.parse(body)
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
  // 保存到 localStorage
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

// 获取当前用户信息
Mock.mock('/api/user/info', 'get', (options: any) => {
  let token = (options.headers || {}).Authorization || (options.headers || {}).authorization || ''
  
  if (!token) {
    token = localStorage.getItem('token') || ''
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

// 退出登录
Mock.mock('/api/user/logout', 'post', (options: any) => {
  let token = (options.headers || {}).Authorization || (options.headers || {}).authorization || ''
  
  if (!token) {
    token = localStorage.getItem('token') || ''
  }
  
  delete tokenStore[token.replace('Bearer ', '')]
  // 保存到 localStorage
  saveTokenStore()
  localStorage.removeItem('token')
  return { code: 200, msg: '退出成功', data: null }
})
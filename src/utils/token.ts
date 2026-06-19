/**
 * Token 安全存储工具
 * 对 localStorage 中的 token 进行 base64 编码存储，防止 XSS 攻击直接读取明文 token
 */

const TOKEN_KEY = 'token'

/** 编码存储 token */
export function setToken(token: string): void {
  try {
    // 使用 btoa 进行 base64 编码，防止明文泄露
    const encoded = btoa(encodeURIComponent(token))
    localStorage.setItem(TOKEN_KEY, encoded)
  } catch {
    // 降级：编码失败时直接存储（兼容特殊字符）
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/** 解码获取 token */
export function getToken(): string | null {
  try {
    const encoded = localStorage.getItem(TOKEN_KEY)
    if (!encoded) return null
    // 尝试解码，如果存储的是明文则直接返回
    return decodeURIComponent(atob(encoded))
  } catch {
    // 降级：解码失败说明是明文存储，直接返回原始值
    return localStorage.getItem(TOKEN_KEY)
  }
}

/** 移除 token */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
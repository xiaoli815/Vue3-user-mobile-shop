/**
 * 通用API响应结构
 * @property code - 状态码，200表示成功
 * @property msg - 响应消息
 * @property data - 响应数据
 */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

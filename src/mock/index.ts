import Mock from 'mockjs'
import './home'
import './product'
import './goods'
import './category'
import './cart'
import './address'
import './coupon'
import './order'
import './user'
import './seckill'
import './search'
import './shipping'

Mock.setup({
  timeout: '50-150'
})

export interface MockOptions {
  url: string
  type: string
  body?: string
}

export default Mock

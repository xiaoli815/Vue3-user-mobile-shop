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

// 设置全局延迟
Mock.setup({
  timeout: '200-500'
})

export default Mock

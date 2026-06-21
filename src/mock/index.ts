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
  timeout: '50-150'
})

export default Mock

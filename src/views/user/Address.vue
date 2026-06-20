<template>
  <div class="address-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="收货地址"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onAddAddress"
    >
      <template #right>
        <van-icon name="plus" size="20" />
      </template>
    </van-nav-bar>

    <!-- 地址列表 -->
    <div v-if="addressList.length > 0" class="address-list" >
      <div
        v-for="item in addressList"
        :key="item.id"
        class="address-card"
        :class="{ 'is-default': item.isDefault }"
        @click="selectAddress(item)"
      >
        <!-- 默认标签 -->
        <div v-if="item.isDefault" class="default-tag">默认</div>

        <!-- 地址信息 -->
        <div class="address-info">
          <div class="contact-row">
            <span class="name">{{ item.receiverName }}</span>
            <span class="phone">{{ formatPhone(item.phone) }}</span>
            <van-icon
              v-if="!item.isDefault"
              name="edit"
              class="edit-icon"
              @click.stop="onEditAddress(item)"
            />
          </div>
          <div class="address-detail">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
          </div>
        </div>

        <!-- 操作栏 -->
        <div class="action-bar">
          <!-- 设置默认 -->
          <div
            class="action-item"
            :class="{ active: item.isDefault }"
            @click.stop="setDefaultAddress(item.id)"
          >
            <van-icon :name="item.isDefault ? 'checked' : 'circle'" size="18" />
            <span>{{ item.isDefault ? '默认地址' : '设为默认' }}</span>
          </div>

          <!-- 删除 -->
          <div class="action-item delete" @click.stop="deleteAddress(item.id)">
            <van-icon name="delete-o" size="18" />
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-else description="暂无收货地址" image="location-o" />

    <!-- 底部新增按钮 -->
    <div v-if="addressList.length > 0" class="bottom-action" >
      <van-button type="primary" block round @click="onAddAddress">
        <van-icon name="plus" /> 添加新地址
      </van-button>
    </div>

    <!-- 新增/编辑地址弹出层 -->
    <van-popup
      v-model:show="showAddressForm"
      position="bottom"
      round
      :style="{ height: '85%' }"
      closeable
      @close="onFormClose"
    >
      <div class="form-container">
        <h3 class="form-title">{{ isEditing ? '编辑地址' : '新增地址' }}</h3>

        <van-form @submit="onSubmitAddress">
          <van-cell-group inset>
            <!-- 收货人 -->
            <van-field
              v-model="formData.receiverName"
              name="receiverName"
              label="收货人"
              placeholder="请输入收货人姓名"
              :rules="[{ required: true, message: '请输入收货人姓名' }]"
            />

            <!-- 手机号 -->
            <van-field
              v-model="formData.phone"
              type="tel"
              name="phone"
              label="手机号"
              placeholder="请输入手机号码"
              maxlength="11"
              :rules="[
                { required: true, message: '请输入手机号码' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' }
              ]"
            />

            <!-- 所在地区 -->
            <van-field
              v-model="addressText"
              is-link
              readonly
              name="area"
              label="所在地区"
              placeholder="请选择省市区"
              :rules="[{ required: true, message: '请选择所在地区' }]"
              @click="showAreaPicker = true"
            />

            <!-- 详细地址 -->
            <van-field
              v-model="formData.detail"
              name="detail"
              label="详细地址"
              type="textarea"
              placeholder="请输入详细地址（街道、楼栋号等）"
              rows="2"
              autosize
              :rules="[{ required: true, message: '请输入详细地址' }]"
            />

            <!-- 设为默认 -->
            <van-field name="isDefault" label="设为默认">
              <template #input>
                <van-switch
                  v-model="formData.isDefault"
                  size="20"
                  active-color="#ee0a24"
                />
              </template>
            </van-field>
          </van-cell-group>

          <div class="form-submit">
            <van-button
              type="primary"
              native-type="submit"
              block
              round
              :loading="submitting"
            >
              保存地址
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 地区选择器 -->
    <van-popup v-model:show="showAreaPicker" position="bottom">
      <van-area
        v-model="areaValue"
        :area-list="areaList"
        @confirm="onAreaConfirm"
        @cancel="showAreaPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import type { Address } from '@/types/address'
import { getAddressList, addAddress, deleteAddress as deleteAddressApi, setDefaultAddress as setDefaultApi } from '@/api/address'

// 地区列表数据
import { areaList } from '@/utils/area'

const router = useRouter()
const route = useRoute()

// 地址列表
const addressList = ref<Address[]>([])

// 表单相关
const showAddressForm = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const showAreaPicker = ref(false)
const addressText = ref('')
const areaValue = ref('440000,440300,440305')

const formData = reactive({
  id: 0,
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 格式化手机号（中间四位隐藏）
const formatPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 加载地址列表
const loadAddressList = async () => {
  try {
    showLoadingToast({ message: '加载中...', forbidClick: true })
    const res = await getAddressList()
    console.log(res)
    if (res && res.code === 200) {
      addressList.value = res.data || []
    } else {
      showToast(res?.msg || '获取地址失败')
    }
  } catch (error) {
    showToast('网络错误')
    console.error('获取地址失败:', error)
  } finally {
    closeToast()
  }
}

// 新增地址
const onAddAddress = () => {
  isEditing.value = false
  resetForm()
  showAddressForm.value = true
}

// 编辑地址
const onEditAddress = (item: Address) => {
  isEditing.value = true
  formData.id = item.id
  formData.receiverName = item.receiverName
  formData.phone = item.phone
  formData.province = item.province
  formData.city = item.city
  formData.district = item.district
  formData.detail = item.detail
  formData.isDefault = item.isDefault
  addressText.value = `${item.province}/${item.city}/${item.district}`
  showAddressForm.value = true
}

// 重置表单
const resetForm = () => {
  formData.id = 0
  formData.receiverName = ''
  formData.phone = ''
  formData.province = ''
  formData.city = ''
  formData.district = ''
  formData.detail = ''
  formData.isDefault = false
  addressText.value = ''
  areaValue.value = '440000,440300,440305'
}

// 地区选择确认
const onAreaConfirm = (values: any) => {
  const selected = values.selectedOptions || []
  formData.province = selected[0]?.text || ''
  formData.city = selected[1]?.text || ''
  formData.district = selected[2]?.text || ''
  addressText.value = `${formData.province}/${formData.city}/${formData.district}`
  showAreaPicker.value = false
}

// 提交地址
const onSubmitAddress = async () => {
  if (!formData.province || !formData.city || !formData.district) {
    showToast('请选择完整的地区信息')
    return
  }

  try {
    submitting.value = true
    const res = await addAddress(formData)
    if (res && res.code === 200) {
      showToast(isEditing.value ? '修改成功' : '添加成功')
      showAddressForm.value = false
      loadAddressList()
    } else {
      showToast(res?.msg || '保存失败')
    }
  } catch (error) {
    showToast('网络错误')
    console.error('保存地址失败:', error)
  } finally {
    submitting.value = false
  }
}

// 删除地址
const deleteAddress = async (id: number) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除该收货地址吗？'
    })

    const res = await deleteAddressApi(id)
    if (res && res.code === 200) {
      showToast('删除成功')
      loadAddressList()
    } else {
      showToast(res?.msg || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 设置默认地址
const setDefaultAddress = async (id: number) => {
  try {
    const res = await setDefaultApi(id)
    if (res && res.code === 200) {
      showToast('设置成功')
      loadAddressList()
    } else {
      showToast(res?.msg || '设置失败')
    }
  } catch (error) {
    showToast('网络错误')
    console.error('设置默认地址失败:', error)
  }
}

// 选择地址（用于结算页面选择收货地址）
const selectAddress = (item: Address) => {
  // 如果是从结算页面跳转过来，则返回选中的地址
  if (route.query.from === 'checkout') {
    // 可以通过 localStorage 或 Pinia 传递选中的地址
    localStorage.setItem('selectedAddress', JSON.stringify(item))
    router.back()
  }
}

// 表单关闭时重置
const onFormClose = () => {
  resetForm()
}

// 页面加载时获取地址列表
onMounted(() => {
  loadAddressList()
})
</script>

<style scoped>
.address-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

/* 导航栏 */
:deep(.van-nav-bar) {
  background: #fff;
}

:deep(.van-nav-bar__title) {
  font-weight: 600;
}

/* 地址列表 */
.address-list {
  padding: 12px;
}

.address-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.address-card:active {
  transform: scale(0.98);
}

.address-card.is-default {
  border: 2px solid #ee0a24;
}

/* 默认标签 */
.default-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #ee0a24 0%, #ff6034 100%);
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 0 12px 0 12px;
}

/* 地址信息 */
.address-info {
  margin-bottom: 12px;
}

.contact-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.contact-row .name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-right: 12px;
}

.contact-row .phone {
  font-size: 14px;
  color: #666;
  flex: 1;
}

.contact-row .edit-icon {
  color: #999;
  padding: 4px;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
  padding: 6px 12px;
  border-radius: 16px;
  background: #f5f5f5;
  transition: all 0.2s;
}

.action-item:active {
  transform: scale(0.95);
}

.action-item.active {
  color: #ee0a24;
  background: #fff0f0;
}

.action-item.delete {
  color: #999;
}

/* 底部按钮 */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.bottom-action :deep(.van-button) {
  height: 44px;
  font-size: 16px;
}

.bottom-action :deep(.van-button__text) {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 表单容器 */
.form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.form-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  padding: 16px;
  background: #fff;
  margin: 0;
}

.form-submit {
  padding: 20px 16px;
}

.form-submit :deep(.van-button) {
  height: 44px;
  font-size: 16px;
}

/* 空状态 */
:deep(.van-empty) {
  padding-top: 100px;
}

:deep(.van-empty__description) {
  color: #999;
  font-size: 14px;
}
</style>

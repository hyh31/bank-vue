<template>
  <!-- 数据统计卡片 - 紧凑布局 -->
  <div class="grid grid-cols-4 gap-2">
    <div class="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-2 border border-blue-200/50">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-blue-600 font-medium">总业务量</p>
          <p class="text-sm font-bold text-blue-700">{{ formatNumber(totalBusinessCount) }}</p>
        </div>
        <div class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
          <Target class="w-3 h-3 text-blue-600" />
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-2 border border-green-200/50">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-green-600 font-medium">ATM占比</p>
          <p class="text-sm font-bold text-green-700">{{ atmData.percentage }}%</p>
        </div>
        <div class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
          <CreditCard class="w-3 h-3 text-green-600" />
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg p-2 border border-orange-200/50">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-orange-600 font-medium">FX占比</p>
          <p class="text-sm font-bold text-orange-700">{{ fxData.percentage }}%</p>
        </div>
        <div class="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
          <DollarSign class="w-3 h-3 text-orange-600" />
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg p-2 border border-purple-200/50">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-purple-600 font-medium">活跃省份</p>
          <p class="text-sm font-bold text-purple-700">{{ activeProvinces }}</p>
        </div>
        <div class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
          <MapPin class="w-3 h-3 text-purple-600" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Target, CreditCard, DollarSign, MapPin } from 'lucide-vue-next'
import type { ATMData, FXData } from './types'
import { formatNumber, calculateTotalBusinessCount, calculateActiveProvinces } from './utils'

/**
 * 组件属性
 */
interface Props {
  atmData: ATMData
  fxData: FXData
}

const props = defineProps<Props>()

/**
 * 计算属性
 */
const totalBusinessCount = computed(() => {
  return calculateTotalBusinessCount(props.atmData, props.fxData)
})

const activeProvinces = computed(() => {
  return calculateActiveProvinces(props.atmData, props.fxData)
})
</script>

<style scoped>
/* 统计卡片悬停效果 */
.bg-gradient-to-r:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>

<template>
  <!-- 对比分析模式 -->
  <div class="h-full p-4 flex flex-col">
    <!-- 全部业务：ATM vs FX 对比分析 -->
    <div v-if="selectedBusinessType === 'all'">
      <!-- 对比分析标题 -->
      <div class="mb-4">
        <h4 class="font-semibold text-sm text-gray-700">业务类型对比分析</h4>
        <p class="text-xs text-gray-500">ATM与外汇业务关键指标对比</p>
      </div>

      <!-- 图表容器 - 固定高度 -->
      <div class="h-80 w-full">
        <v-chart
          ref="comparisonChartRef"
          class="w-full h-full"
          :option="comparisonChartOption"
          :autoresize="true"
        />
      </div>

      <!-- 对比数据表格 -->
      <div class="mt-4 bg-gray-50 rounded-lg p-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium text-sm text-blue-600">ATM业务</h5>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>交易笔数:</span>
                <span class="font-medium">{{ formatNumber(atmData.totalTransactions) }}</span>
              </div>
              <div class="flex justify-between">
                <span>总金额:</span>
                <span class="font-medium">{{ formatCurrency(atmData.totalAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span>平均金额:</span>
                <span class="font-medium">{{ formatCurrency(atmData.avgAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span>增长率:</span>
                <span class="font-medium" :class="atmData.trend > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ atmData.trend > 0 ? '+' : '' }}{{ atmData.trend.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h5 class="font-medium text-sm text-green-600">外汇业务</h5>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>交易笔数:</span>
                <span class="font-medium">{{ formatNumber(fxData.total) }}</span>
              </div>
              <div class="flex justify-between">
                <span>总金额:</span>
                <span class="font-medium">{{ formatCurrency(fxData.sumAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span>平均金额:</span>
                <span class="font-medium">{{ formatCurrency(fxData.avgAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span>增长率:</span>
                <span class="font-medium" :class="fxData.trend > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ fxData.trend > 0 ? '+' : '' }}{{ fxData.trend.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ATM业务：省份 vs 金额分布对比 -->
    <div v-else-if="selectedBusinessType === 'atm'">
      <!-- 对比分析标题 -->
      <div class="mb-4">
        <h4 class="font-semibold text-sm text-gray-700">ATM业务对比分析</h4>
        <p class="text-xs text-gray-500">省份分布与金额分布对比</p>
      </div>

      <!-- 图表容器 -->
      <div class="h-80 w-full">
        <v-chart
          class="w-full h-full"
          :option="atmComparisonChartOption"
          :autoresize="true"
        />
      </div>

      <!-- ATM对比数据表格 -->
      <div class="mt-4 bg-gray-50 rounded-lg p-4">
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium text-sm text-blue-600">省份分析</h5>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>活跃省份:</span>
                <span class="font-medium">{{ atmData.provinceData.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>最高交易:</span>
                <span class="font-medium">{{ getTopAtmProvince(atmData) }}</span>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <h5 class="font-medium text-sm text-blue-600">金额分析</h5>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>金额档次:</span>
                <span class="font-medium">{{ atmData.amountDistribution.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>主要档次:</span>
                <span class="font-medium">{{ getTopAtmAmount(atmData) }}</span>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <h5 class="font-medium text-sm text-blue-600">总体指标</h5>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span>总交易量:</span>
                <span class="font-medium">{{ formatNumber(atmData.totalTransactions) }}</span>
              </div>
              <div class="flex justify-between">
                <span>增长率:</span>
                <span class="font-medium" :class="atmData.trend > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ atmData.trend > 0 ? '+' : '' }}{{ atmData.trend.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FX业务：对比分析模式不可用 -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <DollarSign class="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-2">FX业务对比分析</h4>
          <p class="text-sm text-gray-500 mb-4">外汇业务暂不支持对比分析模式</p>
          <p class="text-xs text-gray-400">请选择"总览"或"详细分析"模式查看FX业务数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DollarSign } from 'lucide-vue-next'
import VChart from 'vue-echarts'
import type { ATMData, FXData, BusinessType } from './types'
import { formatNumber, formatCurrency, getTopAtmProvince, getTopAtmAmount } from './utils'
import { createComparisonChartOption, createAtmComparisonChartOption } from './chartConfigs'

/**
 * 组件属性
 */
interface Props {
  atmData: ATMData
  fxData: FXData
  selectedBusinessType: BusinessType
}

const props = defineProps<Props>()



/**
 * 响应式引用
 */
const comparisonChartRef = ref<InstanceType<typeof VChart> | null>(null)

/**
 * 计算属性
 */
const comparisonChartOption = computed(() => {
  return createComparisonChartOption(props.atmData, props.fxData)
})

const atmComparisonChartOption = computed(() => {
  return createAtmComparisonChartOption(props.atmData)
})


</script>

<style scoped>
/* 图表容器动画 */
.v-chart {
  transition: opacity 0.3s ease;
}
</style>

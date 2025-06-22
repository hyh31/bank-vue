<template>
  <!-- 🚀 现代化总览模式 -->
  <div class="h-full p-4 space-y-4 overflow-y-auto">
    <!-- 🎯 顶部核心KPI指标区域 -->
    <div class="grid grid-cols-4 gap-4">
      <!-- 总交易量 -->
      <div class="group overview-kpi-card bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25">
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <Target class="w-6 h-6 text-white" />
            </div>
            <div class="text-xs bg-white/20 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              总计
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium opacity-90">总交易量</div>
            <div class="text-2xl font-bold data-number">{{ formatNumber(atmData.totalTransactions + fxData.total) }}</div>
            <div class="text-xs opacity-75 flex items-center">
              <TrendingUp class="w-3 h-3 mr-1" />
              较昨日 +{{ ((atmData.trend + fxData.trend) / 2).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 总金额 -->
      <div class="group overview-kpi-card bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/25">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <DollarSign class="w-6 h-6 text-white" />
            </div>
            <div class="text-xs bg-white/20 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              总计
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium opacity-90">总金额</div>
            <div class="text-2xl font-bold data-number">{{ formatCurrency(atmData.totalAmount + fxData.sumAmount) }}</div>
            <div class="text-xs opacity-75 flex items-center">
              <TrendingUp class="w-3 h-3 mr-1" />
              平均 {{ formatCurrency((atmData.avgAmount + fxData.avgAmount) / 2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ATM业务占比 -->
      <div class="group overview-kpi-card bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <CreditCard class="w-6 h-6 text-white" />
            </div>
            <div class="text-xs bg-white/20 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              ATM
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium opacity-90">ATM业务</div>
            <div class="text-2xl font-bold data-number">{{ atmData.percentage }}%</div>
            <div class="text-xs opacity-75 flex items-center">
              <TrendingUp v-if="atmData.trend > 0" class="w-3 h-3 mr-1" />
              <TrendingDown v-else class="w-3 h-3 mr-1" />
              {{ atmData.trend > 0 ? '+' : '' }}{{ atmData.trend.toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- FX业务占比 -->
      <div class="group overview-kpi-card bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/25">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <Globe class="w-6 h-6 text-white" />
            </div>
            <div class="text-xs bg-white/20 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              FX
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium opacity-90">外汇业务</div>
            <div class="text-2xl font-bold data-number">{{ fxData.percentage }}%</div>
            <div class="text-xs opacity-75 flex items-center">
              <TrendingUp v-if="fxData.trend > 0" class="w-3 h-3 mr-1" />
              <TrendingDown v-else class="w-3 h-3 mr-1" />
              {{ fxData.trend > 0 ? '+' : '' }}{{ fxData.trend.toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 📊 中央业务分布可视化区域 -->
    <div class="bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 rounded-2xl p-6 border border-gray-100/60 shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-gray-800">业务分布概览</h3>
          <p class="text-sm text-gray-600">ATM与外汇业务实时数据分析</p>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-xs text-gray-600">ATM</span>
          <div class="w-3 h-3 rounded-full bg-emerald-500 ml-4"></div>
          <span class="text-xs text-gray-600">外汇</span>
        </div>
      </div>

      <div class="h-80 relative">
        <v-chart
          ref="mainChartRef"
          class="w-full h-full"
          :option="chartOption"
          :autoresize="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  TrendingUp,
  TrendingDown,
  Target,
  CreditCard,
  DollarSign,
  Globe
} from 'lucide-vue-next'
import VChart from 'vue-echarts'
import type { ATMData, FXData } from './types'
import { formatNumber, formatCurrency } from './utils'
import { createModernOverviewChartOption } from './chartConfigs'

/**
 * 组件属性
 */
interface Props {
  atmData: ATMData
  fxData: FXData
}

const props = defineProps<Props>()



/**
 * 响应式引用
 */
const mainChartRef = ref<InstanceType<typeof VChart> | null>(null)

/**
 * 计算属性
 */
const chartOption = computed(() => {
  return createModernOverviewChartOption(props.atmData, props.fxData)
})


</script>

<style scoped>
/* 🚀 总览模式专属动画效果 */

/* 1. KPI卡片的呼吸和悬浮效果 */
@keyframes overview-card-float {
  0%, 100% {
    transform: translateY(0px) scale(1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
}

.overview-kpi-card {
  animation: overview-card-float 4s ease-in-out infinite;
  background-size: 200% 200%;
}

/* 错开KPI卡片动画时间 */
.overview-kpi-card:nth-child(1) { animation-delay: 0s; }
.overview-kpi-card:nth-child(2) { animation-delay: 1s; }
.overview-kpi-card:nth-child(3) { animation-delay: 2s; }
.overview-kpi-card:nth-child(4) { animation-delay: 3s; }

/* 2. 悬浮时的特殊效果 */
.overview-kpi-card:hover {
  animation-play-state: paused;
  transform: translateY(-8px) scale(1.05) !important;
}

/* 3. 图标旋转效果 */
@keyframes icon-rotate-subtle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
}

.overview-kpi-card .w-12 {
  animation: icon-rotate-subtle 4s ease-in-out infinite;
}

/* 4. 减少动画偏好的用户 */
@media (prefers-reduced-motion: reduce) {
  .overview-kpi-card,
  .overview-kpi-card .w-12 {
    animation: none;
  }
}

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

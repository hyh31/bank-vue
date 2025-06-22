<template>
  <!-- 详细分析模式 -->
  <div class="h-full p-4">
    <!-- 全部业务：显示ATM和FX的详细对比 -->
    <div v-if="selectedBusinessType === 'all'" class="grid grid-cols-2 gap-4 max-h-96">
      <!-- ATM业务详细分析 -->
      <div class="bg-background rounded-lg p-4 border h-80">
        <h4 class="font-semibold text-sm mb-3 flex items-center">
          <CreditCard class="w-4 h-4 mr-2 text-blue-500" />
          ATM业务分析
        </h4>
        <div class="h-56">
          <v-chart
            ref="atmDetailChartRef"
            class="w-full h-full"
            :option="atmDetailChartOption"
            :autoresize="true"
          />
        </div>
        <!-- ATM业务数据摘要 -->
        <div class="mt-2 text-xs text-gray-600">
          <div class="flex justify-between">
            <span>省份数量:</span>
            <span>{{ atmData.provinceData.length }}</span>
          </div>
          <div class="flex justify-between">
            <span>金额档次:</span>
            <span>{{ atmData.amountDistribution.length }}</span>
          </div>
        </div>
      </div>

      <!-- FX外汇业务详细分析 -->
      <div class="bg-background rounded-lg p-4 border h-80">
        <h4 class="font-semibold text-sm mb-3 flex items-center">
          <DollarSign class="w-4 h-4 mr-2 text-green-500" />
          外汇业务分析
        </h4>
        <div class="h-56">
          <v-chart
            ref="fxDetailChartRef"
            class="w-full h-full"
            :option="fxDetailChartOption"
            :autoresize="true"
          />
        </div>
        <!-- FX业务数据摘要 -->
        <div class="mt-2 text-xs text-gray-600">
          <div class="flex justify-between">
            <span>热门币种:</span>
            <span>{{ getTopCurrency(fxData) }}</span>
          </div>
          <div class="flex justify-between">
            <span>主要目的:</span>
            <span>{{ getTopPurpose(fxData) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ATM业务：显示ATM专属的多维度分析 -->
    <div v-else-if="selectedBusinessType === 'atm'" class="space-y-4">
      <!-- 上半部分：省份分布和金额分布 -->
      <div class="grid grid-cols-2 gap-4">
        <!-- ATM省份分布 -->
        <div class="bg-background rounded-lg p-4 border h-72">
          <h4 class="font-semibold text-sm mb-3 flex items-center">
            <MapPin class="w-4 h-4 mr-2 text-blue-500" />
            省份分布分析
          </h4>
          <div class="h-52">
            <v-chart
              class="w-full h-full"
              :option="atmProvinceChartOption"
              :autoresize="true"
            />
          </div>
        </div>

        <!-- ATM金额分布 -->
        <div class="bg-background rounded-lg p-4 border h-72">
          <h4 class="font-semibold text-sm mb-3 flex items-center">
            <CreditCard class="w-4 h-4 mr-2 text-blue-500" />
            金额分布分析
          </h4>
          <div class="h-52">
            <v-chart
              ref="atmDetailChartRef"
              class="w-full h-full"
              :option="atmDetailChartOption"
              :autoresize="true"
            />
          </div>
        </div>
      </div>

      <!-- 下半部分：关键指标卡片 -->
      <div class="grid grid-cols-5 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-blue-600 font-medium">总交易量</div>
              <div class="text-lg font-bold text-blue-700">{{ formatNumber(atmData.totalTransactions) }}</div>
            </div>
            <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Target class="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-blue-600 font-medium">总金额</div>
              <div class="text-lg font-bold text-blue-700">{{ formatCurrency(atmData.totalAmount) }}</div>
            </div>
            <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <DollarSign class="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-blue-600 font-medium">平均金额</div>
              <div class="text-lg font-bold text-blue-700">{{ formatCurrency(atmData.avgAmount) }}</div>
            </div>
            <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CreditCard class="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-blue-600 font-medium">活跃省份</div>
              <div class="text-lg font-bold text-blue-700">{{ atmData.provinceData.length }}</div>
            </div>
            <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <MapPin class="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-blue-600 font-medium">增长率</div>
              <div class="text-lg font-bold" :class="atmData.trend > 0 ? 'text-green-600' : 'text-red-600'">
                {{ atmData.trend > 0 ? '+' : '' }}{{ atmData.trend.toFixed(1) }}%
              </div>
            </div>
            <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <TrendingUp v-if="atmData.trend > 0" class="w-4 h-4 text-green-600" />
              <TrendingDown v-else class="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FX业务：显示FX专属的多维度分析 -->
    <div v-else class="space-y-4 h-full overflow-y-auto">
      <!-- 第一行：目的分布、币种分布、年龄分布 -->
      <div class="grid grid-cols-3 gap-4">
        <!-- FX目的分布 -->
        <div class="group bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 rounded-xl p-4 border border-green-100/60 h-88 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
          <!-- 背景装饰 -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

          <div class="flex items-center justify-between mb-3 relative z-10">
            <h4 class="font-semibold text-sm flex items-center text-gray-700">
              <div class="w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Target class="w-4 h-4 text-white" />
              </div>
              <span class="group-hover:text-green-700 transition-colors duration-300">交易目的分析</span>
            </h4>
            <div class="text-xs text-green-600 bg-green-100/80 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              点击交互
            </div>
          </div>

          <div class="h-69 relative overflow-hidden rounded-xl bg-white/50 backdrop-blur-sm border border-green-100/50">
            <v-chart
              ref="fxDetailChartRef"
              class="w-full h-full transition-all duration-500 group-hover:scale-105"
              :option="fxDetailChartOption"
              :autoresize="true"
            />
            <!-- 悬浮遮罩 -->
            <div class="absolute inset-0 bg-gradient-to-t from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        <!-- FX币种分布 -->
        <div class="group bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/50 rounded-xl p-4 border border-blue-100/60 h-88 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
          <!-- 背景装饰 -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

          <div class="flex items-center justify-between mb-3 relative z-10">
            <h4 class="font-semibold text-sm flex items-center text-gray-700">
              <div class="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <DollarSign class="w-4 h-4 text-white" />
              </div>
              <span class="group-hover:text-blue-700 transition-colors duration-300">币种分布分析</span>
            </h4>
            <div class="text-xs text-blue-600 bg-blue-100/80 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              点击交互
            </div>
          </div>

          <div class="h-69 relative overflow-hidden rounded-xl bg-white/50 backdrop-blur-sm border border-blue-100/50">
            <v-chart
              class="w-full h-full transition-all duration-500 group-hover:scale-105"
              :option="fxKindChartOption"
              :autoresize="true"
            />
            <!-- 悬浮遮罩 -->
            <div class="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        <!-- FX年龄分布 -->
        <div class="group bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 rounded-xl p-4 border border-purple-100/60 h-88 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
          <!-- 背景装饰 -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>

          <div class="flex items-center justify-between mb-3 relative z-10">
            <h4 class="font-semibold text-sm flex items-center text-gray-700">
              <div class="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <TrendingUp class="w-4 h-4 text-white" />
              </div>
              <span class="group-hover:text-purple-700 transition-colors duration-300">年龄分布分析</span>
            </h4>
            <div class="text-xs text-purple-600 bg-purple-100/80 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              点击交互
            </div>
          </div>

          <div class="h-69 relative overflow-hidden rounded-xl bg-white/50 backdrop-blur-sm border border-purple-100/50">
            <v-chart
              class="w-full h-full transition-all duration-500 group-hover:scale-105"
              :option="fxAgeChartOption"
              :autoresize="true"
            />
            <!-- 悬浮遮罩 -->
            <div class="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </div>

      <!-- 第二行：FX专属关键指标卡片 -->
      <div class="grid grid-cols-4 gap-4">
        <!-- FX总交易量卡片 -->
        <div class="group bg-gradient-to-br from-white via-green-50/40 to-emerald-50/60 rounded-xl p-4 border border-green-100/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/5 to-emerald-400/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>

          <div class="flex items-center justify-between relative z-10">
            <div>
              <div class="text-xs text-green-600 font-medium mb-1 group-hover:text-green-700 transition-colors duration-300">FX总交易量</div>
              <div class="text-lg font-bold text-green-700 group-hover:text-green-800 transition-colors duration-300">{{ formatNumber(fxData.total) }}</div>
              <div class="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">点击查看详情</div>
            </div>
            <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <Target class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <!-- FX总金额卡片 -->
        <div class="group bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/60 rounded-xl p-4 border border-blue-100/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>

          <div class="flex items-center justify-between relative z-10">
            <div>
              <div class="text-xs text-blue-600 font-medium mb-1 group-hover:text-blue-700 transition-colors duration-300">FX总金额</div>
              <div class="text-lg font-bold text-blue-700 group-hover:text-blue-800 transition-colors duration-300">{{ formatCurrency(fxData.sumAmount) }}</div>
              <div class="text-xs text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">点击查看详情</div>
            </div>
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <DollarSign class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <!-- 热门币种卡片 -->
        <div class="group bg-gradient-to-br from-white via-purple-50/40 to-pink-50/60 rounded-xl p-4 border border-purple-100/60 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>

          <div class="flex items-center justify-between relative z-10">
            <div>
              <div class="text-xs text-purple-600 font-medium mb-1 group-hover:text-purple-700 transition-colors duration-300">热门币种</div>
              <div class="text-lg font-bold text-purple-700 group-hover:text-purple-800 transition-colors duration-300">{{ getTopCurrency(fxData) }}</div>
              <div class="text-xs text-purple-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">点击查看详情</div>
            </div>
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <CreditCard class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <!-- 主要目的卡片 -->
        <div class="group bg-gradient-to-br from-white via-orange-50/40 to-amber-50/60 rounded-xl p-4 border border-orange-100/60 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
          <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/5 to-amber-400/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>

          <div class="flex items-center justify-between relative z-10">
            <div>
              <div class="text-xs text-orange-600 font-medium mb-1 group-hover:text-orange-700 transition-colors duration-300">主要目的</div>
              <div class="text-lg font-bold text-orange-700 group-hover:text-orange-800 transition-colors duration-300">{{ getTopPurpose(fxData) }}</div>
              <div class="text-xs text-orange-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">点击查看详情</div>
            </div>
            <div class="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <MapPin class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
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
  MapPin
} from 'lucide-vue-next'
import VChart from 'vue-echarts'
import type { ATMData, FXData, BusinessType } from './types'
import { formatNumber, formatCurrency, getTopCurrency, getTopPurpose } from './utils'
import {
  createAtmDetailChartOption,
  createFxDetailChartOption,
  createAtmProvinceChartOption,
  createFxKindChartOption,
  createFxAgeChartOption
} from './chartConfigs'

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
const atmDetailChartRef = ref<InstanceType<typeof VChart> | null>(null)
const fxDetailChartRef = ref<InstanceType<typeof VChart> | null>(null)

/**
 * 计算属性
 */
const atmDetailChartOption = computed(() => {
  return createAtmDetailChartOption(props.atmData)
})

const fxDetailChartOption = computed(() => {
  return createFxDetailChartOption(props.fxData)
})

const atmProvinceChartOption = computed(() => {
  return createAtmProvinceChartOption(props.atmData)
})

const fxKindChartOption = computed(() => {
  return createFxKindChartOption(props.fxData)
})

const fxAgeChartOption = computed(() => {
  return createFxAgeChartOption(props.fxData)
})


</script>

<style scoped>
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

/* 图表容器动画 */
.v-chart {
  transition: opacity 0.3s ease;
}
</style>

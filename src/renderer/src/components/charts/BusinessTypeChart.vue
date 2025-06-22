<template>
  <!-- 业务类型分布统计 -->
  <div class="w-full h-full">
    <!-- 图表标题和控制器 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- 业务类型切换 -->
        <Select v-model="selectedBusinessType" @update:model-value="handleBusinessTypeChange">
          <SelectTrigger class="w-fit px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20" size="sm">
            <SelectValue placeholder="选择业务类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部业务</SelectItem>
            <SelectItem value="atm">ATM业务</SelectItem>
            <SelectItem value="fx">外汇业务</SelectItem>
          </SelectContent>
        </Select>

        <!-- 显示模式切换 -->
        <Select v-model="displayMode" @update:model-value="handleDisplayModeChange">
          <SelectTrigger class="w-fit px-3 py-1.5 text-xs border rounded-md bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20" size="sm">
            <SelectValue placeholder="选择显示模式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">总览模式</SelectItem>
            <SelectItem value="detailed">详细分析</SelectItem>
            <SelectItem value="comparison">对比分析</SelectItem>
          </SelectContent>
        </Select>

        <!-- 刷新按钮 -->
        <Button variant="ghost" size="sm" :disabled="isLoading" @click="refreshData">
          <RefreshCw :class="['w-3 h-3', isLoading ? 'animate-spin' : '']" />
        </Button>
      </div>
    </div>

    <!-- 图表容器 -->
    <div
      ref="chartContainer"
      class="w-full chart-container bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-gray-900/80 dark:to-slate-800/80 rounded-xl border shadow-sm"
      :style="chartContainerStyle"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-3">
          <RefreshCw class="w-8 h-8 animate-spin text-primary" />
          <p class="text-sm text-muted-foreground">正在加载业务数据...</p>
        </div>
      </div>

      <!-- 总览模式 -->
      <OverviewMode
        v-else-if="displayMode === 'overview'"
        :atm-data="atmData"
        :fx-data="fxData"
      />

      <!-- 详细分析模式 -->
      <DetailedMode
        v-else-if="displayMode === 'detailed'"
        :atm-data="atmData"
        :fx-data="fxData"
        :selected-business-type="selectedBusinessType"
      />

      <!-- 对比分析模式 -->
      <ComparisonMode
        v-else
        :atm-data="atmData"
        :fx-data="fxData"
        :selected-business-type="selectedBusinessType"
      />
    </div>

    <!-- 数据统计卡片 - 紧凑布局 (在FX专项模式下隐藏) -->
    <KPICards
      v-if="!(selectedBusinessType === 'fx' && (displayMode === 'detailed' || displayMode === 'comparison'))"
      :atm-data="atmData"
      :fx-data="fxData"
      class="mt-3"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 导入子组件
import OverviewMode from './business-type/OverviewMode.vue'
import DetailedMode from './business-type/DetailedMode.vue'
import ComparisonMode from './business-type/ComparisonMode.vue'
import KPICards from './business-type/KPICards.vue'

// 导入类型和工具函数
import type { Props, ATMData, FXData, BusinessType, DisplayMode, BackendDataResponse, FetchDataParams } from './business-type/types'

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

/**
 * 组件属性定义
 */
const props = withDefaults(defineProps<Props>(), {
  title: '业务类型分布统计',
  subtitle: 'ATM与外汇业务数据分析',
  chartHeight: "calc(100vh - 200px)",
  autoRefresh: true,
  refreshInterval: 30000
})

/**
 * 响应式数据
 */
const selectedBusinessType = ref<BusinessType>('all')
const displayMode = ref<DisplayMode>('overview')
const isLoading = ref(false)
const chartContainer = ref<HTMLElement | null>(null)

// ATM业务数据 - 使用丰富的模拟数据展示详细分析效果
const atmData = ref<ATMData>({
  totalTransactions: 18650,
  totalAmount: 285600000,
  avgAmount: 15310,
  percentage: 72.3,
  trend: 6.8,
  // 更多省份数据，展示更好的分布效果
  provinceData: [
    { province: '北京', transcation_times: 3200, sum_amount: 48500000 },
    { province: '上海', transcation_times: 2850, sum_amount: 42800000 },
    { province: '广东', transcation_times: 3800, sum_amount: 55200000 },
    { province: '江苏', transcation_times: 2400, sum_amount: 35600000 },
    { province: '浙江', transcation_times: 2100, sum_amount: 31200000 },
    { province: '山东', transcation_times: 1950, sum_amount: 28900000 },
    { province: '四川', transcation_times: 1650, sum_amount: 24800000 },
    { province: '河南', transcation_times: 1400, sum_amount: 20600000 }
  ],
  // 更详细的金额分布，展示更真实的数据
  amountDistribution: [
    { amountLevel: '500以下', total: 3200 },
    { amountLevel: '500-1000', total: 4800 },
    { amountLevel: '1000-3000', total: 6500 },
    { amountLevel: '3000-5000', total: 2800 },
    { amountLevel: '5000-10000', total: 1200 },
    { amountLevel: '10000-20000', total: 150 }
  ],
  kpiData: []
})

// FX外汇业务数据 - 使用模拟数据（与ATM数据保持一致的比例）
const fxData = ref<FXData>({
  total: 7150,
  sumAmount: 168400000,
  avgAmount: 23550,
  percentage: 27.7,
  trend: 4.2,
  provinceData: [
    { province: '北京', total: 1350, sum_amount: 31800000 },
    { province: '上海', total: 1250, sum_amount: 29400000 },
    { province: '广东', total: 1580, sum_amount: 37200000 },
    { province: '江苏', total: 920, sum_amount: 21600000 },
    { province: '浙江', total: 850, sum_amount: 20000000 },
    { province: '山东', total: 680, sum_amount: 16000000 },
    { province: '四川', total: 520, sum_amount: 12400000 }
  ],
  purposeData: [
    { purpose: '旅游', total: 2860 },
    { purpose: '投资', total: 2145 },
    { purpose: '留学', total: 1430 },
    { purpose: '商务', total: 715 }
  ],
  kindData: [
    { kind: 'USD', total: 3220 },
    { kind: 'EUR', total: 1820 },
    { kind: 'JPY', total: 1215 },
    { kind: 'GBP', total: 895 }
  ],
  ageData: [
    { ageLevel: '18-30', total: 2145 },
    { ageLevel: '31-45', total: 3220 },
    { ageLevel: '46-60', total: 1430 },
    { ageLevel: '60+', total: 355 }
  ],
  kpiData: []
})

/**
 * 计算属性
 */
const chartContainerStyle = computed(() => ({
  height: props.chartHeight
}))

/**
 * 事件处理函数
 */
const handleBusinessTypeChange = () => {
  console.log('业务类型切换为:', selectedBusinessType.value)
  refreshData()
}

const handleDisplayModeChange = () => {
  console.log('显示模式切换为:', displayMode.value)
}



const refreshData = async () => {
  if (isLoading.value) return

  isLoading.value = true
  console.log('正在刷新业务类型数据...')

  try {
    // // 临时使用模拟数据来展示ATM详细分析效果
    // console.log('🎯 使用模拟数据展示ATM业务详细分析')

    // // 保持当前的模拟数据不变，确保图表能正常显示
    // console.log('ATM模拟数据:', {
    //   totalTransactions: atmData.value.totalTransactions,
    //   provinceCount: atmData.value.provinceData.length,
    //   amountLevels: atmData.value.amountDistribution.length
    // })

    //如果需要后端数据，可以取消下面的注释
    const backendData = await fetchBusinessDataFromBackend()
    if (backendData) {
      atmData.value = backendData.atm
      fxData.value = backendData.fx
    }

    console.log('✅ 业务类型数据刷新完成（使用模拟数据）')
  } catch (error) {
    console.error('数据刷新失败:', error)
    // 失败时保持模拟数据
  } finally {
    isLoading.value = false
  }
}

/**
 * 后端数据获取函数
 */
const fetchBusinessDataFromBackend = async (): Promise<BackendDataResponse | null> => {
  try {
    console.log('正在从后端获取业务类型数据...', {
      businessType: selectedBusinessType.value,
      displayMode: displayMode.value
    })

    // 调用主进程的IPC接口获取业务数据
    const response = await (window.api as any).fetchBusinessData({
      businessType: selectedBusinessType.value,
      analysisType: displayMode.value
    } as FetchDataParams)
    console.log('后端返回的数据:', response)

    const data = response.data

    // 处理ATM数据
    const atmData: ATMData = {
      // 计算总体指标
      totalTransactions: data.atm?.province?.reduce((sum: number, item: any) => sum + (item.transcation_times || 0), 0) || 0,
      totalAmount: data.atm?.province?.reduce((sum: number, item: any) => sum + (item.sum_amount || 0), 0) || 0,
      avgAmount: 0, // 后面计算
      trend: Math.random() * 10 - 5, // 临时随机值，等后端提供
      percentage: 0, // 后面计算

      // 省份分布数据（直接使用后端数据）
      provinceData: data.atm?.province || [],

      // 金额分布数据（直接使用后端数据）
      amountDistribution: data.atm?.amount || [],

      // KPI数据（直接使用后端数据）
      kpiData: data.atm?.kpi || []
    }

    // 处理FX数据
    const fxData: FXData = {
      // 计算总体指标
      total: data.fx?.province?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0,
      sumAmount: data.fx?.province?.reduce((sum: number, item: any) => sum + (item.sumAmount || 0), 0) || 0,
      avgAmount: 0, // 后面计算
      trend: Math.random() * 10 - 5, // 临时随机值，等后端提供
      percentage: 0, // 后面计算

      // 各维度分布数据（直接使用后端数据）
      provinceData: data.fx?.province || [],
      purposeData: data.fx?.purpose || [],
      kindData: data.fx?.kind || [],
      ageData: data.fx?.age || [],
      kpiData: data.fx?.kpi || []
    }

    return { atm: atmData, fx: fxData }
  } catch (error) {
    console.error('后端数据获取失败:', error)
    return null
  }
}

/**
 * 生命周期钩子
 */
onMounted(() => {

  // 初始化数据
  refreshData()

  // 设置自动刷新
  if (props.autoRefresh && props.refreshInterval > 0) {
    const interval = setInterval(() => {
      refreshData()
    }, props.refreshInterval)

    // 组件卸载时清理定时器
    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})

onUnmounted(() => {
  console.log('🔄 业务类型分布图表组件开始卸载...')

  // 重置状态
  isLoading.value = false
  selectedBusinessType.value = 'all'
  displayMode.value = 'overview'

  console.log('✅ 业务类型分布图表组件卸载完成')
})

/**
 * 监听器
 */
watch(selectedBusinessType, (newType) => {
  console.log('业务类型变更:', newType)
  // 可以根据业务类型过滤数据
})

watch(displayMode, (newMode) => {
  console.log('显示模式变更:', newMode)
  // 可以根据显示模式调整图表配置
})
</script>

<style scoped>
.chart-container {
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>

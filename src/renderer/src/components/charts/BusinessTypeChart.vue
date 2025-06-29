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
        ref="overviewModeRef"
        :atm-data="atmData"
        :fx-data="fxData"
        :overview-data="overviewData"
        :selected-business-type="selectedBusinessType"
      />

      <!-- 详细分析模式 -->
      <DetailedMode
        v-else-if="displayMode === 'detailed'"
        ref="detailedModeRef"
        :atm-data="atmData"
        :fx-data="fxData"
        :selected-business-type="selectedBusinessType"
      />

      <!-- 对比分析模式 -->
      <ComparisonMode
        v-else
        ref="comparisonModeRef"
        :atm-data="atmData"
        :fx-data="fxData"
        :selected-business-type="selectedBusinessType"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
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

// 导入类型和工具函数
import type {
  Props,
  ATMData,
  FXData,
  BusinessType,
  DisplayMode,
  BackendDataResponse,
  OverviewDataResponse,
  FetchDataParams,
} from './business-type/types'

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

// 子组件引用
const overviewModeRef = ref<InstanceType<typeof OverviewMode> | null>(null)
const detailedModeRef = ref<InstanceType<typeof DetailedMode> | null>(null)
const comparisonModeRef = ref<InstanceType<typeof ComparisonMode> | null>(null)

// 记录上一次的值，用于避免重复刷新
const previousBusinessType = ref<BusinessType>('all')
const previousDisplayMode = ref<DisplayMode>('overview')

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

// FX外汇业务数据 - 从IPC接口获取
const fxData = ref<FXData>({
  total: 0,
  sumAmount: 0,
  avgAmount: 0,
  percentage: 0,
  trend: 0,
  provinceData: [],
  purposeData: [],
  kindData: [],
  ageData: [],
  kpiData: []
})

// 总览模式数据 - 从总览数据接口获取
const overviewData = ref<OverviewDataResponse | undefined>(undefined)

/**
 * 计算属性
 */
const chartContainerStyle = computed(() => ({
  height: props.chartHeight
}))

/**
 * ECharts实例安全操作函数
 */
const safeEChartsOperation = (callback: () => void) => {
  try {
    callback()
  } catch (error) {
    console.warn('ECharts操作失败:', error)
  }
}

/**
 * 清理子组件中的ECharts实例
 */
const cleanupChildCharts = () => {
  safeEChartsOperation(() => {
    // 清理总览模式的图表
    if (overviewModeRef.value && (overviewModeRef.value as any).cleanup) {
      (overviewModeRef.value as any).cleanup()
    }

    // 清理详细分析模式的图表
    if (detailedModeRef.value && (detailedModeRef.value as any).cleanup) {
      (detailedModeRef.value as any).cleanup()
    }

    // 清理对比分析模式的图表
    if (comparisonModeRef.value && (comparisonModeRef.value as any).cleanup) {
      (comparisonModeRef.value as any).cleanup()
    }
  })
}

/**
 * 事件处理函数
 */
const handleBusinessTypeChange = async (newValue: any) => {
  console.log('业务类型切换为:', newValue, '上一次:', previousBusinessType.value)

  // 只有真正改变时才刷新数据
  if (newValue && newValue !== previousBusinessType.value) {
    console.log('业务类型已切换，开始刷新数据')
    previousBusinessType.value = newValue

    cleanupChildCharts()
    await nextTick()
    refreshData()
  } else {
    console.log('业务类型未变化，跳过刷新')
  }
}

const handleDisplayModeChange = async (newValue: any) => {
  console.log('显示模式切换为:', newValue, '上一次:', previousDisplayMode.value)

  // 只有真正改变时才刷新数据
  if (newValue && newValue !== previousDisplayMode.value) {
    console.log('显示模式已切换，开始刷新数据')
    previousDisplayMode.value = newValue

    cleanupChildCharts()
    await nextTick()
    refreshData()
  } else {
    console.log('显示模式未变化，跳过刷新')
  }
}

const refreshData = async () => {
  if (isLoading.value) return

  isLoading.value = true
  console.log('正在刷新业务类型数据...')

  try {

    if (displayMode.value === 'detailed') {
      // 详细分析和对比分析模式：直接使用IPC接口
      console.log('🎯 详细模式使用后端数据')
      const backendData = await fetchBusinessDataFromBackend()
      if (backendData) {
        atmData.value = backendData.atm
        fxData.value = backendData.fx
        console.log('✅ 详细数据获取成功')
      }
    } else if (displayMode.value === 'overview') {
      // 总览模式：使用专用的总览数据接口
      console.log('🎯 总览模式使用总览数据接口')
      const fetchedOverviewData = await fetchOverviewDataFromBackend()
      if (fetchedOverviewData) {
        // 处理总览数据并更新组件状态
        overviewData.value = fetchedOverviewData
        console.log('✅ 总览数据获取成功', fetchedOverviewData)
      }
    }
    
    console.log('✅ 业务类型数据刷新完成')
  } catch (error) {
    console.error('数据刷新失败:', error)
    // 失败时保持现有数据
  } finally {
    isLoading.value = false
  }
}

/**
 * 总览数据获取函数
 */
const fetchOverviewDataFromBackend = async (): Promise<OverviewDataResponse | undefined> => {
  try {
    console.log('正在从后端获取总览数据...', {
      businessType: selectedBusinessType.value,
      displayMode: displayMode.value
    })

    // 调用主进程的IPC接口获取总览数据
    const response = await (window.api as any).fetchOverviewData({
      businessType: selectedBusinessType.value,
      timeRange: 'week'
    })
    console.log('后端返回的总览数据:', response)

    const data = response.data

    // 构建符合OverviewDataResponse接口的数据结构
    const overviewResult: OverviewDataResponse = {}

    // 处理外汇业务数据
    if (selectedBusinessType.value === 'fx' && data.fx) {
      overviewResult.fx = {
        summary: {
          total: data.fx.summary?.total || 0,
          sumAmount: data.fx.summary?.sumAmount || 0,
          trend: data.fx.summary?.trend || 0,
        },
        weeklyComparison: data.fx.weeklyComparison || { thisWeek: 0, lastWeek: 0, percentage: 0, dailyData: [] },
        topProvinces: data.fx.topProvinces || [],
        quickInsights: data.fx.quickInsights || []
      }
    }

    // 处理ATM业务数据
    if (selectedBusinessType.value === 'atm' && data.atm) {
      overviewResult.atm = {
        summary: {
          total: data.atm.summary?.total || 0,
          sumAmount: data.atm.summary?.sumAmount || 0,
          trend: data.atm.summary?.trend || 0,
        },
        weeklyComparison: data.atm.weeklyComparison || { thisWeek: 0, lastWeek: 0, percentage: 0, dailyData: [] },
        topProvinces: data.atm.topProvinces || [],
        quickInsights: data.atm.quickInsights || []
      }
    }

    // 处理综合业务数据
    if (selectedBusinessType.value === 'all' && data.dashboard) {
      overviewResult.dashboard = data.dashboard
    }

    return overviewResult
  } catch (error) {
    console.error('总览数据获取失败:', error)
    return undefined
  }
}

/**
 * 详细数据获取函数（保持原有逻辑）
 */
const fetchBusinessDataFromBackend = async (): Promise<BackendDataResponse | undefined> => {
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

    // 创建默认的空数据
    const defaultATMData: ATMData = {
      totalTransactions: 0,
      totalAmount: 0,
      avgAmount: 0,
      percentage: 0,
      trend: 0,
      provinceData: [],
      amountDistribution: [],
      kpiData: []
    }

    const defaultFXData: FXData = {
      total: 0,
      sumAmount: 0,
      avgAmount: 0,
      percentage: 0,
      trend: 0,
      provinceData: [],
      purposeData: [],
      kindData: [],
      ageData: [],
      kpiData: []
    }

    const result: BackendDataResponse = {
      atm: defaultATMData,
      fx: defaultFXData
    }

    // 根据业务的选择类型处理数据
    if (selectedBusinessType.value === 'atm' || selectedBusinessType.value === 'all') {
      result.atm = {
        // 优先使用overview数据，后备使用province数据计算
        totalTransactions: data.atm?.province?.reduce((sum: number, item: any) => sum + (item.transcation_times || 0), 0) || 0,
        totalAmount: data.atm?.province?.reduce((sum: number, item: any) => sum + (item.sum_amount || 0), 0) || 0,
        avgAmount: 0, // 优先使用后端平均金额
        trend: Math.random() * 10 - 5, // 优先使用后端趋势数据
        percentage: 0, // 后面计算

        provinceData: data.atm?.province || [],
        amountDistribution: data.atm?.amount || [],
        kpiData: data.atm?.kpi || []
      }
    }

    if (selectedBusinessType.value === 'fx' || selectedBusinessType.value === 'all') {
      result.fx = {
        total: data.fx?.province?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0,
        sumAmount: data.fx?.province?.reduce((sum: number, item: any) => sum + (item.sumAmount || 0), 0) || 0,
        trend: Math.random() * 10 - 5, // 优先使用后端趋势数据
        avgAmount: 0, // 优先使用后端平均金额
        percentage: 0, // 后面计算

        // 各维度分布数据（直接使用后端数据）
        provinceData: data.fx?.province || [],
        purposeData: data.fx?.purpose || [],
        kindData: data.fx?.kind || [],
        ageData: data.fx?.age || [],
        kpiData: data.fx?.kpi || []
      }
    }

    return result
  } catch (error) {
    console.error('后端数据获取失败:', error)
    return undefined
  }
}

/**
 * 生命周期钩子
 */
onMounted(() => {
  // 初始化记录的值
  previousBusinessType.value = selectedBusinessType.value
  previousDisplayMode.value = displayMode.value

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

// 组件卸载前清理ECharts实例
onBeforeUnmount(() => {
  // 清理所有子组件的ECharts实例
  cleanupChildCharts()
})

onUnmounted(() => {
  // 重置状态
  isLoading.value = false
  selectedBusinessType.value = 'all'
  displayMode.value = 'overview'
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

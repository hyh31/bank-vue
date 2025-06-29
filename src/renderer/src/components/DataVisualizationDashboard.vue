<template>
  <div>
    <!-- 数据可视化顶部标题栏 -->
    <div class="border-b bg-card px-6 py-4 hover:bg-muted/30 transition-colors duration-300">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">数据可视化大屏</h1>
          <p class="text-sm text-muted-foreground mt-1">银行业务数据分析与图表展示</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- 时间范围选择器 -->
          <div class="flex items-center space-x-2">
            <Clock class="w-4 h-4 text-muted-foreground" />
            <Select v-model="selectedTimeRange" @update:model-value="handleTimeRangeChange">
              <SelectTrigger class="w-fit text-sm border rounded-md px-3 py-1 bg-background" size="sm">
                <SelectValue placeholder="选择时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24小时</SelectItem>
                <SelectItem value="7d">7天</SelectItem>
                <SelectItem value="30d">30天</SelectItem>
                <SelectItem value="90d">90天</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 刷新按钮 -->
          <Button
            variant="outline"
            size="sm"
            :disabled="isRefreshing"
            class="hover:scale-105 transition-all duration-300 hover:shadow-md"
            @click="refreshCurrentView"
          >
            <RefreshCw :class="['w-4 h-4 mr-2', isRefreshing ? 'animate-spin' : '']" />
            刷新数据
          </Button>

          <!-- 导出按钮 -->
          <Button
            variant="outline"
            size="sm"
            class="hover:scale-105 transition-all duration-300 hover:shadow-md"
            @click="exportCurrentView"
          >
            <Download class="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>
    </div>

    <!-- 可视化模块切换按钮栏 - 横向布局 -->
    <div class="border-b bg-muted/20 px-6 py-2">
      <div class="flex items-center justify-center space-x-1 overflow-x-auto">
        <Button
          v-for="module in visualizationModules"
          :key="module.id"
          :variant="currentModule === module.id ? 'default' : 'ghost'"
          size="sm"
          class="transition-all duration-300 hover:scale-105 min-w-[140px] whitespace-nowrap"
          :class="{
            'bg-primary text-primary-foreground shadow-md': currentModule === module.id,
            'hover:bg-muted': currentModule !== module.id
          }"
          @click="switchModule(module.id)"
        >
          <component :is="module.icon" class="w-4 h-4 mr-2" />
          {{ module.name }}
        </Button>
      </div>
    </div>

    <!-- 主要内容区域 - 大屏显示 -->
    <div class="flex-1 p-6 overflow-hidden">
      <!-- 交易趋势分析模块 -->
      <div v-if="currentModule === 'transaction-trend'" class="h-full">
        <Card class="h-full hover:shadow-lg transition-shadow duration-300 gap-0">
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl font-bold flex items-center">
                  <TrendingUp class="w-6 h-6 mr-3 text-blue-500" />
                  交易趋势分析
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-1">实时交易量与成功率监控</p>
              </div>
              <Badge variant="outline" class="text-xs">
                {{ getTimeRangeLabel }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="h-full pb-6">
            <TransactionTrendChart
              title=""
              subtitle=""
              chart-height="calc(100vh - 280px)"
              :auto-refresh="true"
              :refresh-interval="120000"
            />
          </CardContent>
        </Card>
      </div>

      <!-- 风险等级分布模块 -->
      <div v-else-if="currentModule === 'risk-distribution'" class="h-full">
        <Card class="h-full hover:shadow-lg transition-shadow duration-300 gap-0">
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl font-bold flex items-center">
                  <Shield class="w-6 h-6 mr-3 text-orange-500" />
                  风险等级分布
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-1">交易风险分析统计与趋势监控</p>
              </div>
              <Badge variant="outline" class="text-xs"> 实时更新 </Badge>
            </div>
          </CardHeader>
          <CardContent class="h-full pb-6">
            <RiskDistributionChart
              title=""
              subtitle=""
              :auto-refresh="true"
              :refresh-interval="150000"
            />
          </CardContent>
        </Card>
      </div>

      <!-- 地域分布统计模块 -->
      <div v-else-if="currentModule === 'region-distribution'" class="h-full">
        <Card class="h-full hover:shadow-lg transition-shadow duration-300 gap-0">
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl font-bold flex items-center">
                  <BarChart3 class="w-6 h-6 mr-3 text-green-500" />
                  地域分布统计
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-1">各地区交易量分布与对比分析</p>
              </div>
              <Badge variant="outline" class="text-xs">
                {{ getTimeRangeLabel }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="h-full">
            <!-- 使用shadcn组件集成ECharts图表 -->
            <RegionDistributionChart
              title=""
              subtitle=""
              chart-height="calc(100vh - 443px)"
              :auto-refresh="true"
              :refresh-interval="150000"
            />
          </CardContent>
        </Card>
      </div>

      <!-- 时段分析模块 -->
      <div v-else-if="currentModule === 'time-analysis'" class="h-full">
        <Card class="h-full hover:shadow-lg transition-shadow duration-300 gap-0">
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl font-bold flex items-center">
                  <Clock class="w-6 h-6 mr-3 text-purple-500" />
                  时段分析
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-1">不同时间段的交易活跃度分析</p>
              </div>
              <Badge variant="outline" class="text-xs">
                {{ getTimeRangeLabel }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="h-full pb-6">
            <div class="flex items-center justify-center h-full">
              <div class="text-center">
                <Clock class="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <h3 class="text-lg font-semibold mb-2">时段分析</h3>
                <p class="text-muted-foreground">不同时间段的交易活跃度分析图表</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 业务类型分布模块 -->
      <div v-else-if="currentModule === 'business-type'" class="h-full">
        <Card class="h-full hover:shadow-lg transition-shadow duration-300 gap-0">
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl font-bold flex items-center">
                  <Target class="w-6 h-6 mr-3 text-indigo-500" />
                  业务类型分布
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-1">各类业务交易占比与趋势分析</p>
              </div>
              <Badge variant="outline" class="text-xs">
                {{ getTimeRangeLabel }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="h-full">
            <!-- 使用shadcn组件集成ECharts图表 -->
            <BusinessTypeChart
              title=""
              subtitle=""
              chart-height="calc(100vh - 360px)"
              :auto-refresh="true"
              :refresh-interval="120000"
            />
          </CardContent>
        </Card>
      </div>

      <!-- 实时数据流模块 -->
      <div v-else-if="currentModule === 'realtime-stream'" class="h-full">
        <Card class="h-full hover:shadow-lg transition-shadow duration-300 gap-0">
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl font-bold flex items-center">
                  <Activity class="w-6 h-6 mr-3 text-red-500" />
                  实时数据流监控
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-1">系统性能与交易数据实时监控</p>
              </div>
              <Badge variant="outline" class="text-xs"> 实时流 </Badge>
            </div>
          </CardHeader>
          <CardContent class="h-full pb-6">
            <!-- 使用RealtimeDataStream组件 -->
            <RealtimeDataStream
              title=""
              subtitle=""
              chart-height="500px"
              :max-data-points="50"
            />
          </CardContent>
        </Card>
      </div>

      <!-- IPC 测试模块 -->
      <div v-else-if="currentModule === 'ipc-test'" class="h-full">
        <Card class="h-full hover:shadow-lg transition-shadow duration-300 gap-0">
          <CardHeader class="pb-4">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl font-bold flex items-center">
                  <Settings class="w-6 h-6 mr-3 text-purple-500" />
                  IPC 通信测试
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-1">测试前后端数据接口通信状态</p>
              </div>
              <Badge variant="outline" class="text-xs">
                调试工具
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="h-full">
            <IPCTest />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  TrendingUp,
  RefreshCw,
  Download,
  BarChart3,
  Clock,
  Target,
  Activity,
  Shield,
  Settings
} from 'lucide-vue-next'

// shadcn-vue 组件导入
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// 导入专门的图表组件
import TransactionTrendChart from '@/components/charts/TransactionTrendChart.vue'
import RiskDistributionChart from '@/components/charts/RiskDistributionChart.vue'
import RegionDistributionChart from '@/components/charts/RegionDistributionChart.vue'
import BusinessTypeChart from '@/components/charts/BusinessTypeChart.vue'
import RealtimeDataStream from '@/components/charts/RealtimeDataStream.vue'
import IPCTest from '@/components/test/IPCTest.vue'

// 导入性能监控工具
import { performanceMonitor } from '@/utils/performance'

/**
 * 可视化模块接口定义
 */
interface VisualizationModule {
  id: string
  name: string
  icon: any
  description: string
}

/**
 * 响应式数据
 */
const selectedTimeRange = ref('24h')
const isRefreshing = ref(false)
const currentModule = ref('transaction-trend')

/**
 * 可视化模块配置 - 横向布局优化
 */
const visualizationModules = ref<VisualizationModule[]>([
  {
    id: 'transaction-trend',
    name: '交易趋势',
    icon: TrendingUp,
    description: '实时交易量与成功率监控'
  },
  {
    id: 'risk-distribution',
    name: '风险分布',
    icon: Shield,
    description: '交易风险分析统计'
  },
  {
    id: 'region-distribution',
    name: '地域分布',
    icon: BarChart3,
    description: '各地区交易量分布'
  },
  {
    id: 'time-analysis',
    name: '时段分析',
    icon: Clock,
    description: '不同时间段交易活跃度'
  },
  {
    id: 'business-type',
    name: '业务类型',
    icon: Target,
    description: '各类业务交易占比'
  },
  {
    id: 'realtime-stream',
    name: '实时数据',
    icon: Activity,
    description: '系统性能实时监控'
  },
  {
    id: 'ipc-test',
    name: 'API测试',
    icon: Settings,
    description: 'IPC通信接口测试'
  }
])

/**
 * 计算属性
 */
const getTimeRangeLabel = computed(() => {
  const labels = {
    '24h': '24小时',
    '7d': '7天',
    '30d': '30天',
    '90d': '90天'
  }
  return labels[selectedTimeRange.value] || '24小时'
})

/**
 * 事件处理函数
 */

/**
 * 切换可视化模块
 */
const switchModule = (moduleId: string) => {
  console.log('切换到模块:', moduleId)
  currentModule.value = moduleId

  // 切换模块时刷新数据
  refreshCurrentView()
}

/**
 * 处理时间范围变化
 */
const handleTimeRangeChange = () => {
  console.log('时间范围变更为:', selectedTimeRange.value)
  refreshCurrentView()
}

/**
 * 刷新当前视图数据
 */
const refreshCurrentView = async () => {
  if (isRefreshing.value) {
    console.log('数据正在刷新中，请稍候...')
    return
  }

  isRefreshing.value = true
  console.log(`正在刷新${currentModule.value}模块数据...`)

  try {
    // 模拟数据加载
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('数据刷新完成')
  } catch (error) {
    console.error('数据刷新失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

/**
 * 导出当前视图数据
 */
const exportCurrentView = () => {
  const moduleNames = {
    'transaction-trend': '交易趋势分析',
    'risk-distribution': '风险等级分布',
    'region-distribution': '地域分布统计',
    'time-analysis': '时段分析',
    'business-type': '业务类型分布',
    'realtime-stream': '实时数据流'
  }

  const moduleName = moduleNames[currentModule.value] || '数据可视化'
  console.log(`导出${moduleName}报表`)

  // 这里可以实现具体的导出功能
  alert(`正在导出${moduleName}报表...`)
}

/**
 * 生命周期钩子
 */
onMounted(() => {
  console.log('数据可视化大屏组件已挂载')
  console.log('当前模块:', currentModule.value)
  console.log('可视化模块列表:', visualizationModules.value)

  // 初始化数据
  refreshCurrentView()
})

onUnmounted(() => {
  console.log('🔄 数据可视化大屏组件开始卸载...')

  // 重置状态
  isRefreshing.value = false
  currentModule.value = 'transaction-trend'

  // 清理性能监控
  performanceMonitor.cleanup()

  console.log('✅ 数据可视化大屏组件卸载完成')
})
</script>

<style scoped>

</style>

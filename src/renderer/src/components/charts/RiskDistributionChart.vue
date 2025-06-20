<template>
  <div class="w-full h-full">
    <!-- 图表标题 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-foreground">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        :disabled="isLoading"
        @click="refreshData"
        class="hover:bg-primary/10 transition-colors"
      >
        <RefreshCw :class="['w-3 h-3', isLoading ? 'animate-spin' : '']" />
      </Button>
    </div>

    <!-- 图表容器 -->
    <div
      class="w-full bg-gradient-to-br from-slate-50/80 via-white to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800 dark:to-slate-900/60 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm"
      :style="{ height: chartHeight }"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-3">
          <div class="relative">
            <RefreshCw class="w-8 h-8 animate-spin text-primary" />
            <div class="absolute inset-0 w-8 h-8 border-2 border-primary/20 rounded-full animate-pulse"></div>
          </div>
          <p class="text-sm text-muted-foreground font-medium">数据加载中...</p>
        </div>
      </div>

      <!-- 图表内容 -->
      <div v-else class="h-full p-6">
        <div class="flex items-center justify-center h-full">
          <div class="w-full max-w-md space-y-6" style="float: left">
            <!-- 现代化饼图 -->
            <div class="relative flex items-center justify-center">
              <!-- 外层阴影 -->
              <div class="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 rounded-full blur-xl transform translate-y-2"></div>

              <!-- 主饼图 -->
              <div class="relative">
                <svg class="w-56 h-56 transform -rotate-90 drop-shadow-lg" viewBox="0 0 240 240">
                  <!-- 背景圆环 -->
                  <circle
                    cx="120"
                    cy="120"
                    r="90"
                    fill="none"
                    stroke="rgba(0,0,0,0.05)"
                    stroke-width="24"
                    class="dark:stroke-white/10"
                  />

                  <!-- 低风险扇形 -->
                  <circle
                    cx="120"
                    cy="120"
                    r="90"
                    fill="none"
                    stroke="url(#lowRiskGradient)"
                    stroke-width="24"
                    :stroke-dasharray="`${lowRiskCircumference} ${totalCircumference - lowRiskCircumference}`"
                    stroke-dashoffset="0"
                    stroke-linecap="round"
                    class="transition-all duration-1500 ease-out hover:stroke-width-26 cursor-pointer"
                    @mouseenter="highlightSegment('low')"
                    @mouseleave="clearHighlight"
                  />

                  <!-- 中风险扇形 -->
                  <circle
                    cx="120"
                    cy="120"
                    r="90"
                    fill="none"
                    stroke="url(#mediumRiskGradient)"
                    stroke-width="24"
                    :stroke-dasharray="`${mediumRiskCircumference} ${totalCircumference - mediumRiskCircumference}`"
                    :stroke-dashoffset="-lowRiskCircumference"
                    stroke-linecap="round"
                    class="transition-all duration-1500 ease-out hover:stroke-width-26 cursor-pointer"
                    @mouseenter="highlightSegment('medium')"
                    @mouseleave="clearHighlight"
                  />

                  <!-- 高风险扇形 -->
                  <circle
                    cx="120"
                    cy="120"
                    r="90"
                    fill="none"
                    stroke="url(#highRiskGradient)"
                    stroke-width="24"
                    :stroke-dasharray="`${highRiskCircumference} ${totalCircumference - highRiskCircumference}`"
                    :stroke-dashoffset="-(lowRiskCircumference + mediumRiskCircumference)"
                    stroke-linecap="round"
                    class="transition-all duration-1500 ease-out hover:stroke-width-26 cursor-pointer"
                    @mouseenter="highlightSegment('high')"
                    @mouseleave="clearHighlight"
                  />

                  <!-- 渐变定义 -->
                  <defs>
                    <linearGradient id="lowRiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="mediumRiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="highRiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>

                <!-- 中心内容 -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg border border-border/20">
                    <div class="text-lg font-bold text-foreground">{{ totalCount }}</div>
                    <div class="text-xs text-muted-foreground font-medium">总交易</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 现代化图例和数据 -->
            <div class="space-y-3">
              <!-- 低风险 -->
              <div
                class="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/60 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-700/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                :class="{ 'ring-2 ring-green-400/50 shadow-lg': highlightedSegment === 'low' }"
                @click="handleLegendClick('low')"
              >
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <div class="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg"></div>
                    <div class="absolute inset-0 w-5 h-5 rounded-full bg-green-400/30 animate-ping group-hover:animate-pulse"></div>
                  </div>
                  <div>
                    <span class="text-sm font-semibold text-green-800 dark:text-green-200">低风险</span>
                    <div class="text-xs text-green-600 dark:text-green-400">安全交易</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-700 dark:text-green-300">{{ riskData.low.count.toLocaleString() }}</div>
                  <div class="text-sm text-green-600 dark:text-green-400 font-medium">{{ riskData.low.percentage }}%</div>
                </div>
              </div>

              <!-- 中风险 -->
              <div
                class="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-50/80 to-amber-50/60 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200/50 dark:border-yellow-700/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                :class="{ 'ring-2 ring-yellow-400/50 shadow-lg': highlightedSegment === 'medium' }"
                @click="handleLegendClick('medium')"
              >
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <div class="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg"></div>
                    <div class="absolute inset-0 w-5 h-5 rounded-full bg-yellow-400/30 animate-ping group-hover:animate-pulse"></div>
                  </div>
                  <div>
                    <span class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">中风险</span>
                    <div class="text-xs text-yellow-600 dark:text-yellow-400">需要关注</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-yellow-700 dark:text-yellow-300">{{ riskData.medium.count.toLocaleString() }}</div>
                  <div class="text-sm text-yellow-600 dark:text-yellow-400 font-medium">{{ riskData.medium.percentage }}%</div>
                </div>
              </div>

              <!-- 高风险 -->
              <div
                class="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-rose-50/60 dark:from-red-900/20 dark:to-rose-900/10 border border-red-200/50 dark:border-red-700/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                :class="{ 'ring-2 ring-red-400/50 shadow-lg': highlightedSegment === 'high' }"
                @click="handleLegendClick('high')"
              >
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <div class="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg"></div>
                    <div class="absolute inset-0 w-5 h-5 rounded-full bg-red-400/30 animate-ping group-hover:animate-pulse"></div>
                  </div>
                  <div>
                    <span class="text-sm font-semibold text-red-800 dark:text-red-200">高风险</span>
                    <div class="text-xs text-red-600 dark:text-red-400">需要处理</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-red-700 dark:text-red-300">{{ riskData.high.count.toLocaleString() }}</div>
                  <div class="text-sm text-red-600 dark:text-red-400 font-medium">{{ riskData.high.percentage }}%</div>
                </div>
              </div>
            </div>

            <!-- 现代化风险趋势指示 -->
            <div class="mt-6 p-4 bg-gradient-to-r from-slate-50/80 to-gray-50/60 dark:from-slate-800/80 dark:to-gray-800/60 rounded-xl border border-border/50 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span class="text-sm font-medium text-muted-foreground">风险趋势</span>
                </div>
                <div class="flex items-center space-x-2 px-3 py-1 rounded-full bg-background/80 border border-border/30">
                  <component
                    :is="riskTrend.direction === 'up' ? TrendingUp : riskTrend.direction === 'down' ? TrendingDown : Minus"
                    :class="['w-4 h-4 transition-transform duration-300', getRiskTrendColor()]"
                  />
                  <span :class="['text-sm font-semibold transition-colors duration-300', getRiskTrendColor()]">
                    {{ riskTrend.change }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

/**
 * 组件属性定义
 */
interface Props {
  title?: string
  subtitle?: string
  chartHeight?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '风险等级分布',
  subtitle: '交易风险分析统计',
  chartHeight: '350px',
  autoRefresh: true,
  refreshInterval: 45000 // 45秒
})

/**
 * 响应式数据
 */
const isLoading = ref(false)
const highlightedSegment = ref<string | null>(null)

// 风险数据
const riskData = ref({
  low: { count: 1247, percentage: 72.5 },
  medium: { count: 385, percentage: 22.4 },
  high: { count: 88, percentage: 5.1 }
})

// 风险趋势
const riskTrend = ref({
  direction: 'down' as 'up' | 'down' | 'neutral',
  change: '-2.3%'
})

// 现代化颜色配置
const riskColors = {
  low: '#10b981',    // emerald-500
  medium: '#f59e0b', // amber-500
  high: '#ef4444'    // red-500
}

/**
 * 计算属性
 */
const totalCount = computed(() => {
  return riskData.value.low.count + riskData.value.medium.count + riskData.value.high.count
})

const totalCircumference = computed(() => {
  return 2 * Math.PI * 90 // 半径为90的圆周长，增大饼图
})

const lowRiskCircumference = computed(() => {
  return (riskData.value.low.percentage / 100) * totalCircumference.value
})

const mediumRiskCircumference = computed(() => {
  return (riskData.value.medium.percentage / 100) * totalCircumference.value
})

const highRiskCircumference = computed(() => {
  return (riskData.value.high.percentage / 100) * totalCircumference.value
})

/**
 * 工具函数
 */
const getRiskTrendColor = () => {
  switch (riskTrend.value.direction) {
    case 'up':
      return 'text-red-500 hover:text-red-600'
    case 'down':
      return 'text-green-500 hover:text-green-600'
    default:
      return 'text-gray-500 hover:text-gray-600'
  }
}

/**
 * 交互功能
 */
const highlightSegment = (segment: string) => {
  highlightedSegment.value = segment
}

const clearHighlight = () => {
  highlightedSegment.value = null
}

const handleLegendClick = (riskLevel: string) => {
  console.log(`点击了${riskLevel}风险图例`)
  // 可以在这里添加更多交互逻辑，比如显示详细信息
}

/**
 * 事件处理函数
 */
const refreshData = async () => {
  isLoading.value = true
  console.log('刷新风险分布数据...')

  // 清除高亮状态
  clearHighlight()

  // 模拟数据加载，增加更真实的延迟
  setTimeout(() => {
    // 生成新的模拟数据，使数据更加真实
    const total = Math.floor(Math.random() * 800) + 1200 // 1200-2000
    const highPercentage = Math.random() * 6 + 3 // 3-9%
    const mediumPercentage = Math.random() * 12 + 18 // 18-30%
    const lowPercentage = 100 - highPercentage - mediumPercentage

    riskData.value = {
      high: {
        count: Math.floor(total * highPercentage / 100),
        percentage: Math.round(highPercentage * 10) / 10
      },
      medium: {
        count: Math.floor(total * mediumPercentage / 100),
        percentage: Math.round(mediumPercentage * 10) / 10
      },
      low: {
        count: Math.floor(total * lowPercentage / 100),
        percentage: Math.round(lowPercentage * 10) / 10
      }
    }

    // 更新趋势，使趋势更加合理
    const trendValue = (Math.random() - 0.5) * 8 // 减小波动范围
    riskTrend.value = {
      direction: trendValue > 0.5 ? 'up' : trendValue < -0.5 ? 'down' : 'neutral',
      change: `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`
    }

    isLoading.value = false
    console.log('风险分布数据刷新完成', riskData.value)
  }, 1200) // 增加加载时间，让用户感受到数据更新
}

/**
 * 自动刷新定时器
 */
let autoRefreshTimer: NodeJS.Timeout

/**
 * 生命周期钩子
 */
onMounted(() => {
  console.log('风险分布图表组件已挂载')

  // 启动自动刷新
  if (props.autoRefresh) {
    autoRefreshTimer = setInterval(() => {
      refreshData()
    }, props.refreshInterval)
  }

  // 初始化数据
  refreshData()
})

onUnmounted(() => {
  console.log('风险分布图表组件已卸载')

  // 清理定时器
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style scoped>
/**
 * 现代化风险分布图表样式
 * 使用CSS变量和现代动画效果
 */

/* SVG圆环动画 */
circle {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

circle:hover {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  transform: scale(1.02);
  transform-origin: center;
}

/* 自定义动画 */
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* 图例卡片悬停效果 */
.group:hover .animate-ping {
  animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  svg {
    width: 12rem;
    height: 12rem;
  }
}

@media (max-width: 640px) {
  svg {
    width: 10rem;
    height: 10rem;
  }

  .space-y-6 {
    gap: 1rem;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  circle {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  circle:hover {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .border {
    border-width: 2px;
  }

  .shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  circle,
  .transition-all,
  .transition-colors,
  .transition-transform {
    transition: none;
  }

  .animate-spin,
  .animate-pulse,
  .animate-ping {
    animation: none;
  }
}
</style>

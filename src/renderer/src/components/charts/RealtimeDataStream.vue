<template>
  <div class="w-full h-full flex flex-col space-y-3">
    <!-- 紧凑标题栏 -->
    <div class="flex items-center justify-between py-2">
      <div class="flex items-center space-x-2">
        <Badge variant="outline" class="px-2 py-0.5 text-xs">
          <div :class="['w-1.5 h-1.5 rounded-full mr-1.5', isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500']"></div>
          {{ isConnected ? '连接中' : '断开' }}
        </Badge>
        <span class="text-sm font-medium text-muted-foreground">实时监控</span>
      </div>

      <Button
        :variant="isConnected ? 'outline' : 'default'"
        size="sm"
        class="h-7 px-3 text-xs"
        @click="toggleConnection"
      >
        {{ isConnected ? '暂停' : '启动' }}
      </Button>
    </div>

    <!-- 精简指标条 -->
    <div class="grid grid-cols-4 gap-2">
      <!-- TPS 指标 -->
      <div class="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-blue-600 font-medium">TPS</div>
            <div class="text-sm font-bold text-blue-700">{{ formatNumber(currentMetrics.tps) }}</div>
          </div>
          <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <!-- 延迟指标 -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-lg p-2 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-green-600 font-medium">延迟</div>
            <div class="text-sm font-bold text-green-700">{{ currentMetrics.latency }}ms</div>
          </div>
          <div class="w-4 h-4 bg-green-500 rounded-full animate-bounce"></div>
        </div>
      </div>

      <!-- 错误率指标 -->
      <div class="bg-gradient-to-r from-orange-50 to-amber-100 border border-orange-200 rounded-lg p-2 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-orange-600 font-medium">错误率</div>
            <div class="text-sm font-bold text-orange-700">{{ currentMetrics.errorRate.toFixed(2) }}%</div>
          </div>
          <div class="w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
        </div>
      </div>

      <!-- 连接数指标 -->
      <div class="bg-gradient-to-r from-purple-50 to-violet-100 border border-purple-200 rounded-lg p-2 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-purple-600 font-medium">连接数</div>
            <div class="text-sm font-bold text-purple-700">{{ formatNumber(currentMetrics.connections) }}</div>
          </div>
          <div class="w-4 h-4 bg-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>

    <!-- 主要监控图表区域 -->
    <Card class="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 flex-1">
      <CardHeader class="py-1 px-4 bg-gradient-to-r from-slate-100/50 to-blue-100/50 border-b border-slate-200/50">
        <CardTitle class="flex items-center justify-between text-xs h-6">
          <span class="flex items-center font-medium">
            <div class="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse mr-2"></div>
            性能监控
          </span>
          <div class="flex items-center space-x-2 text-xs">
            <div class="flex items-center space-x-1">
              <div class="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span class="text-blue-600">TPS</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-1 h-1 bg-green-500 rounded-full"></div>
              <span class="text-green-600">延迟</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-1 h-1 bg-orange-500 rounded-full"></div>
              <span class="text-orange-600">错误率</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="p-3">
        <!-- 主要SVG图表 -->
        <div class="relative h-48 md:h-56 bg-gradient-to-br from-white/80 to-slate-50/80 rounded-xl border border-slate-200/50 overflow-hidden shadow-inner backdrop-blur-sm">
          <!-- 图表标题和图例 -->
          <div class="absolute top-3 left-4 right-4 z-10">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">实时性能监控</h4>
              <div class="flex items-center space-x-4 text-xs">
                <div class="flex items-center space-x-1">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-gray-600">TPS</span>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-gray-600">延迟</span>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span class="text-gray-600">错误率</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SVG 图表 -->
          <svg class="w-full h-full" viewBox="0 0 800 160">
            <!-- 现代化网格线 -->
            <defs>
              <pattern id="modernGrid" width="50" height="25" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" stroke-width="0.5" opacity="0.6"/>
              </pattern>
              <linearGradient id="tpsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.1" />
              </linearGradient>
              <linearGradient id="latencyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#modernGrid)" />

            <!-- TPS 数据线和填充 -->
            <path
              v-if="tpsDataPoints"
              :d="`M ${tpsDataPoints} L 790,150 L 10,150 Z`"
              fill="url(#tpsGradient)"
              opacity="0.3"
            />
            <polyline
              :points="tpsDataPoints"
              fill="none"
              stroke="#3b82f6"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-all duration-300 drop-shadow-sm"
            />

            <!-- 延迟数据线和填充 -->
            <path
              v-if="latencyDataPoints"
              :d="`M ${latencyDataPoints} L 790,150 L 10,150 Z`"
              fill="url(#latencyGradient)"
              opacity="0.2"
            />
            <polyline
              :points="latencyDataPoints"
              fill="none"
              stroke="#10b981"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-all duration-300 drop-shadow-sm"
            />

            <!-- 错误率数据线 -->
            <polyline
              :points="errorDataPoints"
              fill="none"
              stroke="#f59e0b"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="5,5"
              class="transition-all duration-300"
            />
          </svg>

          <!-- 现代化数据流动画效果 -->
          <div
            v-if="isConnected"
            class="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <div
              v-for="(particle, index) in dataParticles"
              :key="index"
              class="absolute rounded-full opacity-60"
              :class="[
                index % 3 === 0 ? 'w-1 h-1 bg-blue-400 animate-pulse' :
                index % 3 === 1 ? 'w-1.5 h-1.5 bg-green-400 animate-bounce' :
                'w-1 h-1 bg-orange-400 animate-ping'
              ]"
              :style="{
                left: particle.x + '%',
                top: particle.y + '%',
                animationDelay: particle.delay + 's',
                animationDuration: (1 + Math.random()) + 's'
              }"
            ></div>
          </div>

          <!-- 数据点高亮 -->
          <div
            v-if="isConnected && tpsData.length > 0"
            class="absolute top-1/2 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"
            style="transform: translateY(-50%)"
          ></div>
        </div>

      </CardContent>
    </Card>

    <!-- 事件日志 -->
    <Card class="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200">
      <CardHeader class="py-1 px-4 bg-gradient-to-r from-gray-100/50 to-slate-100/50 border-b border-gray-200/50">
        <CardTitle class="flex items-center justify-between text-xs h-6">
          <span class="flex items-center font-medium">
            <div class="w-1.5 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse mr-2"></div>
            事件日志
          </span>
          <Badge variant="outline" class="text-xs bg-white/50 border-gray-300 h-4 px-1.5">
            {{ recentEvents.length }}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <div class="h-32 overflow-y-auto bg-gradient-to-b from-white/50 to-gray-50/50">
          <div class="p-3 space-y-2">
            <div
              v-for="event in recentEvents"
              :key="event.id"
              class="group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/70 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200/50"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div :class="['w-2 h-2 rounded-full flex-shrink-0', getEventColor(event.type)]"></div>
                <span class="font-mono text-xs text-gray-500 flex-shrink-0">{{ event.timestamp }}</span>
                <span class="text-sm text-gray-700 truncate">{{ event.message }}</span>
              </div>
              <Badge
                :variant="getEventVariant(event.type)"
                class="text-xs ml-2 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
              >
                {{ event.type }}
              </Badge>
            </div>

            <!-- 空状态 -->
            <div v-if="recentEvents.length === 0" class="text-center py-6 text-gray-500">
              <p class="text-sm">暂无事件记录</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * 组件属性定义
 */
interface Props {
  title?: string
  subtitle?: string
  chartHeight?: string
  maxDataPoints?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '实时数据流监控',
  subtitle: '系统性能实时监控',
  chartHeight: '400px',
  maxDataPoints: 50
})

/**
 * 数据接口定义
 */
interface RealtimeEvent {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
}

interface DataPoint {
  timestamp: number
  value: number
}

/**
 * 响应式数据
 */
const isConnected = ref(true)

// 当前指标
const currentMetrics = ref({
  tps: 1247,
  latency: 23,
  errorRate: 0.8,
  connections: 156
})

// 历史数据点
const tpsData = ref<DataPoint[]>([])
const latencyData = ref<DataPoint[]>([])
const errorData = ref<DataPoint[]>([])

// 最近事件
const recentEvents = ref<RealtimeEvent[]>([])

// 数据粒子动画
const dataParticles = ref(
  Array.from({ length: 20 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2
  }))
)

/**
 * 计算属性 - 生成SVG路径点
 */
const tpsDataPoints = computed(() => {
  if (tpsData.value.length < 2) return ''
  
  return tpsData.value.map((point, index) => {
    const x = (index / (props.maxDataPoints - 1)) * 780 + 10
    const y = 150 - (point.value / 2000) * 130 // 假设最大TPS为2000
    return `${x},${y}`
  }).join(' ')
})

const latencyDataPoints = computed(() => {
  if (latencyData.value.length < 2) return ''
  
  return latencyData.value.map((point, index) => {
    const x = (index / (props.maxDataPoints - 1)) * 780 + 10
    const y = 150 - (point.value / 100) * 130 // 假设最大延迟为100ms
    return `${x},${y}`
  }).join(' ')
})

const errorDataPoints = computed(() => {
  if (errorData.value.length < 2) return ''
  
  return errorData.value.map((point, index) => {
    const x = (index / (props.maxDataPoints - 1)) * 780 + 10
    const y = 150 - (point.value / 10) * 130 // 假设最大错误率为10%
    return `${x},${y}`
  }).join(' ')
})

/**
 * 工具函数
 */
const getEventColor = (type: string) => {
  switch (type) {
    case 'error':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'success':
      return 'bg-green-500'
    default:
      return 'bg-blue-500'
  }
}

const getEventVariant = (type: string) => {
  switch (type) {
    case 'error':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'success':
      return 'default'
    default:
      return 'outline'
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatNumber = (value: number) => {
  return value.toLocaleString()
}

/**
 * 事件处理函数
 */
const toggleConnection = () => {
  isConnected.value = !isConnected.value
  console.log('数据流连接状态:', isConnected.value ? '已连接' : '已断开')
  
  if (isConnected.value) {
    addEvent('连接已建立', 'success')
  } else {
    addEvent('连接已断开', 'warning')
  }
}

const addEvent = (message: string, type: RealtimeEvent['type'] = 'info') => {
  const event: RealtimeEvent = {
    id: Date.now().toString(),
    timestamp: formatTime(Date.now()),
    message,
    type
  }
  
  recentEvents.value.unshift(event)
  
  // 保持最多20条事件
  if (recentEvents.value.length > 20) {
    recentEvents.value = recentEvents.value.slice(0, 20)
  }
}

const updateMetrics = () => {
  if (!isConnected.value) return

  // 使用 requestAnimationFrame 优化性能
  requestAnimationFrame(() => {
    const now = Date.now()

    // 批量更新当前指标，减少响应式触发
    const newMetrics = {
      tps: Math.floor(Math.random() * 500) + 800,
      latency: Math.floor(Math.random() * 50) + 10,
      errorRate: Math.random() * 3,
      connections: Math.floor(Math.random() * 100) + 100
    }

    // 一次性更新所有指标
    currentMetrics.value = newMetrics

    // 批量添加数据点
    const newTpsPoint = { timestamp: now, value: newMetrics.tps }
    const newLatencyPoint = { timestamp: now, value: newMetrics.latency }
    const newErrorPoint = { timestamp: now, value: newMetrics.errorRate }

    tpsData.value.push(newTpsPoint)
    latencyData.value.push(newLatencyPoint)
    errorData.value.push(newErrorPoint)

    // 保持数据点数量 - 批量删除
    if (tpsData.value.length > props.maxDataPoints) {
      const removeCount = tpsData.value.length - props.maxDataPoints
      tpsData.value.splice(0, removeCount)
      latencyData.value.splice(0, removeCount)
      errorData.value.splice(0, removeCount)
    }

    // 降低事件添加频率
    if (Math.random() < 0.15) {
      const events = [
        { message: '新用户连接', type: 'info' as const },
        { message: '交易处理完成', type: 'success' as const },
        { message: '系统负载较高', type: 'warning' as const },
        { message: '数据同步异常', type: 'error' as const }
      ]
      const randomEvent = events[Math.floor(Math.random() * events.length)]
      addEvent(randomEvent.message, randomEvent.type)
    }
  })
}

/**
 * 定时器
 */
let updateTimer: NodeJS.Timeout

/**
 * 生命周期钩子
 */
onMounted(() => {
  console.log('实时数据流组件已挂载')

  // 启动数据更新 - 进一步降低频率避免卡顿
  updateTimer = setInterval(updateMetrics, 6000) // 每6秒更新

  // 初始化数据
  addEvent('系统启动完成', 'success')
})

onUnmounted(() => {
  console.log('实时数据流组件已卸载')
  
  // 清理定时器
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
/* 现代化滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #cbd5e1, #94a3b8);
  border-radius: 3px;
  border: 1px solid #e2e8f0;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #94a3b8, #64748b);
}

/* SVG 路径增强样式 */
polyline {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 卡片悬停效果增强 */
.group:hover .animate-pulse {
  animation-duration: 0.5s;
}

.group:hover .animate-bounce {
  animation-duration: 0.8s;
}

.group:hover .animate-ping {
  animation-duration: 1.2s;
}

.group:hover .animate-spin {
  animation-duration: 2s;
}

/* 渐变背景动画 */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 数据粒子增强效果 */
.absolute.rounded-full {
  filter: blur(0.5px);
  box-shadow: 0 0 4px currentColor;
}

/* 响应式网格和布局 */
@media (max-width: 1024px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  /* 中等屏幕图表高度 */
  .h-48 {
    height: 10rem; /* 160px */
  }
}

@media (max-width: 640px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.25rem;
  }

  /* 小屏幕上的布局调整 */
  .space-y-3 > * + * {
    margin-top: 0.5rem;
  }

  /* 小屏幕图表高度 */
  .h-48 {
    height: 8rem; /* 128px */
  }

  .md\\:h-56 {
    height: 8rem; /* 128px */
  }
}

/* 轻微缩放效果 */
.hover\\:scale-102:hover {
  transform: scale(1.02);
}

/* 卡片阴影增强 */
.hover\\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 事件日志项轻微动画 */
.group:hover {
  transform: translateX(2px);
}

/* 背景模糊效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
</style>

<template>
  <div class="w-full h-full">
    <!-- 标题和状态 -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- 连接状态 -->
        <Badge :variant="isConnected ? 'default' : 'destructive'" class="animate-pulse">
          <div :class="['w-2 h-2 rounded-full mr-2', isConnected ? 'bg-green-500' : 'bg-red-500']"></div>
          {{ isConnected ? '已连接' : '已断开' }}
        </Badge>
        
        <!-- 控制按钮 -->
        <Button
          variant="ghost"
          size="sm"
          @click="toggleConnection"
        >
          {{ isConnected ? '断开' : '连接' }}
        </Button>
      </div>
    </div>

    <!-- 数据流容器 -->
    <div 
      class="w-full bg-gradient-to-br from-green-50/50 to-blue-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border"
      :style="{ height: chartHeight }"
    >
      <div class="h-full p-4">
        <!-- 实时指标 -->
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="text-center p-2 bg-white dark:bg-gray-800 rounded border">
            <div class="text-xs text-muted-foreground">TPS</div>
            <div class="text-lg font-bold text-blue-600">{{ currentMetrics.tps }}</div>
          </div>
          <div class="text-center p-2 bg-white dark:bg-gray-800 rounded border">
            <div class="text-xs text-muted-foreground">延迟</div>
            <div class="text-lg font-bold text-green-600">{{ currentMetrics.latency }}ms</div>
          </div>
          <div class="text-center p-2 bg-white dark:bg-gray-800 rounded border">
            <div class="text-xs text-muted-foreground">错误率</div>
            <div class="text-lg font-bold text-orange-600">{{ currentMetrics.errorRate }}%</div>
          </div>
          <div class="text-center p-2 bg-white dark:bg-gray-800 rounded border">
            <div class="text-xs text-muted-foreground">活跃连接</div>
            <div class="text-lg font-bold text-purple-600">{{ currentMetrics.connections }}</div>
          </div>
        </div>

        <!-- 实时数据流图表 -->
        <div class="relative h-40 bg-white dark:bg-gray-800 rounded border overflow-hidden">
          <svg class="w-full h-full" viewBox="0 0 800 160">
            <!-- 网格线 -->
            <defs>
              <pattern id="realtimeGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#realtimeGrid)" />
            
            <!-- TPS 数据线 -->
            <polyline
              :points="tpsDataPoints"
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              class="transition-all duration-100"
            />
            
            <!-- 延迟数据线 -->
            <polyline
              :points="latencyDataPoints"
              fill="none"
              stroke="#10b981"
              stroke-width="2"
              class="transition-all duration-100"
            />
            
            <!-- 错误率数据线 -->
            <polyline
              :points="errorDataPoints"
              fill="none"
              stroke="#f59e0b"
              stroke-width="2"
              class="transition-all duration-100"
            />
          </svg>
          
          <!-- 数据流动画效果 -->
          <div 
            v-if="isConnected"
            class="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <div 
              v-for="(particle, index) in dataParticles" 
              :key="index"
              class="absolute w-2 h-2 bg-blue-500 rounded-full opacity-70 animate-pulse"
              :style="{ 
                left: particle.x + '%', 
                top: particle.y + '%',
                animationDelay: particle.delay + 's'
              }"
            ></div>
          </div>
        </div>

        <!-- 实时事件日志 -->
        <div class="mt-4 h-24 bg-white dark:bg-gray-800 rounded border overflow-hidden">
          <div class="h-full overflow-y-auto p-2 space-y-1">
            <div
              v-for="event in recentEvents"
              :key="event.id"
              class="text-xs flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 transition-colors"
            >
              <div class="flex items-center space-x-2">
                <div :class="['w-2 h-2 rounded-full', getEventColor(event.type)]"></div>
                <span class="font-mono">{{ event.timestamp }}</span>
                <span>{{ event.message }}</span>
              </div>
              <Badge :variant="getEventVariant(event.type)" class="text-xs">
                {{ event.type }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
  Array.from({ length: 20 }, (_, i) => ({
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
/* 简化样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

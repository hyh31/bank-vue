<template>
  <div class="flex flex-col h-full bg-background">
    <!-- 银行告警系统顶部标题栏 -->
    <div class="border-b bg-card px-6 py-3 hover:bg-muted/30 transition-colors duration-300">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-foreground">银行告警监控系统</h1>
          <p class="text-xs text-muted-foreground mt-1">实时监控银行业务风险与异常告警</p>
        </div>
        <div class="flex items-center space-x-2">
          <!-- 系统状态指示器 -->
          <Badge
            :variant="
              systemStatus === 'normal'
                ? 'default'
                : systemStatus === 'warning'
                  ? 'secondary'
                  : 'destructive'
            "
            class="hover:scale-105 transition-transform cursor-pointer"
          >
            <Activity class="w-3 h-3 mr-1" />
            {{ systemStatusText }}
          </Badge>

          <!-- 刷新按钮 -->
          <Button
            variant="outline"
            size="sm"
            :disabled="isRefreshing"
            class="hover:scale-105 transition-all duration-300 hover:shadow-md"
            @click="refreshData"
          >
            <RefreshCw :class="['w-3 h-3 mr-1', isRefreshing ? 'animate-spin' : '']" />
            刷新
          </Button>

          <!-- 告警设置 -->
          <Button
            variant="outline"
            size="sm"
            class="hover:scale-105 transition-all duration-300 hover:shadow-md"
          >
            <Settings class="w-3 h-3 mr-1" />
            设置
          </Button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 p-4 space-y-4 overflow-hidden">
      <!-- 关键指标卡片 -->
      <KeyMetricsSection />

      <!-- 实时告警区域 -->
      <div class="grid grid-cols-3 gap-4">
        <!-- 告警列表 -->
        <AlertsSection />

        <!-- 告警统计和系统状态 -->
        <RegionStatsSection />

        <SystemStatusSection 
          :auto-refresh="true" 
          :refresh-interval="10000" 
        />
      </div>

      <!-- 监控数据表格 -->
      <TransactionSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  KeyMetricsSection,
  AlertsSection,
  RegionStatsSection,
  SystemStatusSection,
  TransactionSection
} from './dashboard'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Activity,
  RefreshCw,
  Settings
} from 'lucide-vue-next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const systemStatus = ref<'normal' | 'warning' | 'critical'>('normal')
const isRefreshing = ref(false)

/**
 * 告警自动滚动管理
 */
const currentAlertIndex = ref(0)
// const alertContainer = ref<HTMLElement | null>(null)
// let alertScrollInterval: NodeJS.Timeout | null = null

const systemStatusText = computed(() => {
  const statusMap = {
    normal: '系统正常',
    warning: '系统警告',
    critical: '系统异常'
  }
  return statusMap[systemStatus.value]
})

/**
 * 刷新系统状态数据
 */
const refreshData = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true
  try {
    // // 获取真实系统状态
    // await refreshSystemData()
    // console.log('数据刷新完成')
  } catch (error) {
    console.error('刷新失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

/**
 * 自动刷新数据
 */
let refreshInterval: NodeJS.Timeout | null = null

onMounted(async () => {
  // 监听窗口大小变化
  calcuateScale()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  console.log('🔄 Dashboard组件开始卸载，清理所有定时器...')

  // 清理系统状态刷新定时器
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
    console.log('✅ 系统状态刷新定时器已清理')
  }

  // 重置所有状态
  currentAlertIndex.value = 0
  isRefreshing.value = false

  console.log('✅ Dashboard组件卸载完成')
})

/**
 * 计算缩放比例
 */
// 缩放比例
const scale = ref(1)

// 计算
const calcuateScale = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  // 计算宽度和高度的缩放比例，取最小值保证完整显示
  scale.value = Math.min(width / 1920, height / 1080)
  console.log(`窗口尺寸: ${width}x${height}, 缩放比例: ${scale.value}`)
}

// 监听窗口大小变化
const handleResize = () => {
  calcuateScale()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/**
 * 银行告警监控系统样式
 * 使用 shadcn-vue 组件，最小化自定义样式
 */

/* 自定义动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 确保表格在小屏幕上可滚动 */
@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }
}
</style>

/**
 * 银行监控告警系统 - 性能监控 Composable
 *
 * @author Hyphen
 * @date 2024-06-16
 */
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 性能监控配置选项
 */
interface PerformanceMonitorOptions {
  autoStart?: boolean           // 是否自动开始监控
  collectInterval?: number      // 数据收集间隔 (ms)
  enableAlerts?: boolean       // 是否启用自动告警
}

/**
 * 性能监控 Composable
 *
 * @param options 配置选项
 * @returns 性能监控相关的响应式数据和方法
 */
export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
  // 默认配置
  const {
    autoStart = true,
    collectInterval = 10000,    // 10秒
    enableAlerts = true
  } = options


  // 响应式状态
  const isMonitoring = ref(false)                    // 是否正在监控
  const currentMemoryUsage = ref(0)                  // 当前内存使用量 (MB)

  // 定时器引用
  let collectTimer: NodeJS.Timeout | null = null

  /**
   * 开始性能监控
   */
  const startMonitoring = () => {
    if (isMonitoring.value) {
      console.warn('⚠️ 性能监控已在运行中')
      return
    }

    isMonitoring.value = true
    console.log('🚀 性能监控已启动')

    // 立即检查一次
    checkMemoryUsage()

    // 定期检查内存使用情况
    collectTimer = setInterval(() => {
      checkMemoryUsage()
    }, collectInterval)
  }

  /**
   * 停止性能监控
   */
  const stopMonitoring = () => {
    if (!isMonitoring.value) {
      console.warn('⚠️ 性能监控未在运行')
      return
    }

    isMonitoring.value = false
    console.log('⏹️ 性能监控已停止')

    // 清理定时器
    if (collectTimer) {
      clearInterval(collectTimer)
      collectTimer = null
    }
  }

  /**
   * 获取内存使用情况 (MB)
   */
  const getMemoryUsage = (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  /**
   * 检查内存使用情况
   */
  const checkMemoryUsage = async () => {
    if (!isMonitoring.value) return

    const memoryUsage = getMemoryUsage()
    currentMemoryUsage.value = memoryUsage

    console.log(`📊 当前内存使用: ${memoryUsage.toFixed(2)}MB`)
  }

  /**
   * 重置监控数据
   */
  const resetMetrics = () => {
    currentMemoryUsage.value = 0
    console.log('🔄 性能监控数据已重置')
  }

  // 生命周期管理
  onMounted(() => {
    if (autoStart) {
      startMonitoring()
    }
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  // 返回响应式数据和方法
  return {
    // 响应式状态
    isMonitoring,
    currentMemoryUsage,

    // 控制方法
    startMonitoring,
    stopMonitoring,

    // 数据获取
    checkMemoryUsage,
    resetMetrics
  }
}

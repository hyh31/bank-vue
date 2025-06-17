/**
 * 银行监控告警系统 - 性能监控工具
 * 
 * 提供性能监控、内存使用情况检测和优化建议
 * 
 * @author Hyphen
 * @date 2024-06-16
 */

/**
 * 性能指标接口
 */
interface PerformanceMetrics {
  timestamp: number
  memoryUsage: number
  renderTime: number
  updateCount: number
  activeTimers: number
}

/**
 * 性能监控类
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 100
  private updateCount = 0
  private renderStartTime = 0
  private isMonitoring = false

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🚀 性能监控已启动')
    
    // 定期收集性能指标
    setInterval(() => {
      this.collectMetrics()
    }, 10000) // 每10秒收集一次
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false
    console.log('⏹️ 性能监控已停止')
  }

  /**
   * 记录渲染开始时间
   */
  markRenderStart(): void {
    this.renderStartTime = performance.now()
  }

  /**
   * 记录渲染结束时间并计算渲染时间
   */
  markRenderEnd(): number {
    const renderTime = performance.now() - this.renderStartTime
    this.updateCount++
    return renderTime
  }

  /**
   * 收集性能指标
   */
  private collectMetrics(): void {
    if (!this.isMonitoring) return

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      memoryUsage: this.getMemoryUsage(),
      renderTime: this.getAverageRenderTime(),
      updateCount: this.updateCount,
      activeTimers: this.getActiveTimersCount()
    }

    this.metrics.push(metrics)

    // 保持指标数量限制
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // 检查性能问题
    this.checkPerformanceIssues(metrics)
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  /**
   * 获取平均渲染时间
   */
  private getAverageRenderTime(): number {
    const recentMetrics = this.metrics.slice(-10)
    if (recentMetrics.length === 0) return 0
    
    const totalRenderTime = recentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0)
    return totalRenderTime / recentMetrics.length
  }

  /**
   * 获取活跃定时器数量（估算）
   */
  private getActiveTimersCount(): number {
    // 这是一个估算值，实际项目中可以通过更精确的方式统计
    return document.querySelectorAll('[data-timer]').length
  }

  /**
   * 检查性能问题
   */
  private checkPerformanceIssues(metrics: PerformanceMetrics): void {
    const issues: string[] = []

    // 检查内存使用
    if (metrics.memoryUsage > 100) {
      issues.push(`内存使用过高: ${metrics.memoryUsage.toFixed(2)}MB`)
    }

    // 检查渲染时间
    if (metrics.renderTime > 16) {
      issues.push(`渲染时间过长: ${metrics.renderTime.toFixed(2)}ms`)
    }

    // 检查更新频率
    if (this.updateCount > 1000) {
      issues.push(`更新次数过多: ${this.updateCount}次`)
    }

    // 输出性能警告
    if (issues.length > 0) {
      console.warn('⚠️ 性能问题检测:', issues)
      this.suggestOptimizations(issues)
    }
  }

  /**
   * 提供优化建议
   */
  private suggestOptimizations(issues: string[]): void {
    const suggestions: string[] = []

    issues.forEach(issue => {
      if (issue.includes('内存使用')) {
        suggestions.push('建议: 减少数据缓存量，清理无用的响应式数据')
      }
      if (issue.includes('渲染时间')) {
        suggestions.push('建议: 使用 v-memo 或 shallowRef 优化渲染性能')
      }
      if (issue.includes('更新次数')) {
        suggestions.push('建议: 增加防抖延迟，减少定时器频率')
      }
    })

    if (suggestions.length > 0) {
      console.info('💡 优化建议:', suggestions)
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    averageMemoryUsage: number
    averageRenderTime: number
    totalUpdates: number
    recommendations: string[]
  } {
    if (this.metrics.length === 0) {
      return {
        averageMemoryUsage: 0,
        averageRenderTime: 0,
        totalUpdates: this.updateCount,
        recommendations: ['暂无足够数据生成报告']
      }
    }

    const avgMemory = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length
    const avgRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length

    const recommendations: string[] = []
    
    if (avgMemory > 50) {
      recommendations.push('内存使用偏高，建议优化数据结构')
    }
    if (avgRenderTime > 10) {
      recommendations.push('渲染性能可以优化，建议使用虚拟滚动或分页')
    }
    if (this.updateCount > 500) {
      recommendations.push('数据更新频率较高，建议增加防抖机制')
    }

    return {
      averageMemoryUsage: avgMemory,
      averageRenderTime: avgRenderTime,
      totalUpdates: this.updateCount,
      recommendations: recommendations.length > 0 ? recommendations : ['性能表现良好']
    }
  }

  /**
   * 重置监控数据
   */
  reset(): void {
    this.metrics = []
    this.updateCount = 0
    console.log('🔄 性能监控数据已重置')
  }

  /**
   * 清理监控器资源
   */
  cleanup(): void {
    this.stopMonitoring()
    this.reset()
    console.log('🧹 性能监控器已清理')
  }
}

/**
 * 防抖函数工厂
 */
export function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * 节流函数工厂
 */
export function createThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(null, args)
    }
  }
}

/**
 * 批量更新工具
 */
export function batchUpdate(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    updates.forEach(update => {
      try {
        update()
      } catch (error) {
        console.warn('批量更新中的某个操作失败:', error)
      }
    })
  })
}

// 导出单例性能监控器
export const performanceMonitor = new PerformanceMonitor()

// 开发环境下自动启动监控
if (import.meta.env.DEV) {
  performanceMonitor.startMonitoring()
}

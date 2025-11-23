import { onMounted, onUnmounted, ref, watch } from 'vue'
import { AlertCircle, Info, XCircle } from 'lucide-vue-next'

// 告警数据接口定义
interface AlertItem {
    id: string
    title: string
    description: string
    level: 'critical' | 'warning' | 'info'
    timestamp: string
}

/**
 * 配置选项接口
 */
interface AlertsOptions {
    autoScroll?: boolean
    scrollInterval?: number
    autoRefresh?: boolean
    refreshInterval?: number
}

export function useAlerts(options: AlertsOptions = {}) {
    const {
        autoScroll = true,         // 是否自动滚动
        scrollInterval = 3000,     // 滚动间隔时间
        autoRefresh = true,        // 是否自动刷新
        refreshInterval = 20000    // 刷新间隔时间
    } = options

    // 状态管理
    const alerts = ref<AlertItem[]>([])           // 告警数据
    const currentIndex = ref(0)                   // 当前显示的告警索引
    const isLoading = ref(false)                  // 加载状态
    const error = ref<string | null>(null)        // 错误信息
    const alertContainer = ref<HTMLElement | null>(null)

    let scrollTimer: NodeJS.Timeout | null = null
    let refreshTimer: NodeJS.Timeout | null = null

    // 启动自动滚动（逐条向上滚动）
    const startAutoScroll = () => {
        if (!autoScroll || alerts.value.length <= 1) return

        scrollTimer = setInterval(() => {
            currentIndex.value++
            // 不在这里重置，让 watch 在组件中处理无缝重置
        }, scrollInterval)
    }

    // 停止自动滚动
    const stopAutoScroll = () => {
        if (scrollTimer) {
            clearInterval(scrollTimer)
            scrollTimer = null
        }
    }

    // 启动自动刷新
    const startAutoRefresh = () => {
        if (!autoRefresh) return

        refreshTimer = setInterval(() => {
            fetchAlerts()
        }, refreshInterval)
    }

    // 停止自动刷新
    const stopAutoRefresh = () => {
        if (refreshTimer) {
            clearInterval(refreshTimer)
            refreshTimer = null
        }
    }

    onMounted(async () => {
        await fetchAlerts()
        startAutoScroll()
        startAutoRefresh()
    })

    onUnmounted(() => {
        // 清理定时器
        stopAutoScroll()
        stopAutoRefresh()
    })

    // 获取告警数据
    const fetchAlerts = async () => {
        try {
            isLoading.value = true
            error.value = null

            console.log('正在获取告警数据...')

            const result = await (window.api as any).fetchAlerts({ limit: 10 })
            console.log(result)
            if (result.success) {
                alerts.value = result.data.map((item: any) => ({
                    id: item.alertId || item.id,
                    level: item.level,
                    title: item.title || getDefaultTitle(item.alertType),
                    description: item.message,
                    timestamp: formatTime((item.createTime).replace(' ', 'T'))
                }))
                console.log('告警数据获取成功，共', alerts.value.length, '条告警')
            } else {
                throw new Error(result.message || '获取告警数据失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取告警数据失败'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * 创建性能告警
     */
    const createPerformanceAlert = async (level: string, message: string, metrics: any) => {
        try {
            console.log('创建性能告警:', { level, message, metrics })

            const result = await (window.api as any).createPerformanceAlert({
                level,
                message,
                clientId: 'client-001',
                metrics: JSON.stringify(metrics)
            })
            if (result.success) {
                console.log('性能告警创建成功')
                await fetchAlerts() // 刷新告警数据
                return result.data
            } else {
                throw new Error(result.message || '创建性能告警失败')
            }
        } catch (error) {
            console.error('创建性能告警失败:', error)
            throw error
        }
    }

    /**
     * 关闭告警
     */
    const closePerformanceAlert = async (alertId: string) => {
        try {
            console.log('关闭性能告警：', alertId)
            const result = await (window.api as any).closePerformanceAlert({ alertId })
            if (result.success) {
                console.log('性能告警关闭成功')
                await fetchAlerts() // 刷新告警数据
                return true
            } else {
                throw new Error(result.message || '关闭性能告警失败')
            }
        } catch (error) {
            console.error('关闭性能告警失败:', error)
            throw error
        }
    }

    /**
     * 根据告警类型获取默认标题
     */
    const getDefaultTitle = (alertType: string) => {
        switch (alertType) {
            case 'business':
                return '业务告警'
            case 'performance':
                return '性能告警'
            case 'system':
                return '系统告警'
            default:
                return '系统告警'
        }
    }

    /**
     * 获取告警图标
     */
    const getAlertIcon = (level: string) => {
        switch (level) {
            case 'critical':
            return XCircle
            case 'warning':
            return AlertCircle
            case 'info':
            return Info
            default:
            return AlertCircle
        }
    }

    /**
     * 获取告警图标颜色
     */
    const getAlertIconColor = (level: string) => {
        switch (level) {
            case 'critical':
            return 'text-red-500'
            case 'warning':
            return 'text-yellow-500'
            case 'info':
            return 'text-blue-500'
            default:
            return 'text-gray-500'
        }
    }

    /**
     * 获取告警变体样式
     */
    const getAlertVariant = (level: string) => {
        switch (level) {
            case 'critical':
            return 'destructive'
            case 'warning':
            return 'default'
            case 'info':
            return 'secondary'
            default:
            return 'secondary'
        }
    }

    /**
     * 格式化时间
     */
    const formatTime = (date: Date | string) => {
        const date1 = date instanceof Date ? date : new Date(date)
        const now = new Date()
        const diff = now.getTime() - date1.getTime()
        const minutes = Math.floor(diff / (1000 * 60))

        if (minutes < 1) return '刚刚'
        if (minutes < 60) return `${minutes}分钟前`

        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}小时前`

        const days = Math.floor(hours / 24)
        if (days < 30) return `${days}天前`

        return date1.toLocaleDateString('zh-CN')
    }

    /**
     * 告警中文的提示
     */
    const getAlertsLevelText = (level: string) => {
        switch(level) {
            case 'critical':
                return '严重'
            case 'warning':
                return '警告'
            case 'info':
                return '信息'
            default:
                return '未知'
        }
    }

    // 监听 currentIndex 变化，实现无缝重置
    watch(currentIndex, async (newIndex) => {
        if (newIndex >= alerts.value.length) {
            setTimeout(async () => {
                const container = alertContainer.value
                if (container) {
                    container.style.transition = 'none'
                    currentIndex.value = 0

                    // 强制重绘后恢复动画
                    setTimeout(() => {
                        container.style.transition = 'transform 1000ms ease-in-out'
                    }, 50)
                }
            }, 1000) // 1秒延迟，等待滚动动画完成
        }
    })

    return {
        alerts,
        currentIndex,
        isLoading,
        error,
        alertContainer,
        fetchAlerts,
        createPerformanceAlert,
        closePerformanceAlert,
        startAutoScroll,
        stopAutoScroll,
        startAutoRefresh,
        stopAutoRefresh,
        getAlertIcon,
        getAlertIconColor,
        getAlertVariant,
        formatTime,
        getAlertsLevelText
    }
}
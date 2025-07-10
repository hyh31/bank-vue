import { onMounted, onUnmounted, ref, watch } from 'vue'
import { AlertCircle, Info, XCircle } from 'lucide-vue-next'

// 告警数据接口定义
interface AlertItem {
    id: string
    title: string
    description: string
    level: 'critical' | 'warning' | 'info'
    timestamp: Date
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

            alerts.value = [
                {
                    id: 'alert-1',
                    title: '异常大额转账检测',
                    description: '账户 ****1234 发生单笔 500万 转账，超出日常交易阈值',
                    level: 'critical',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5分钟前
                },
                {
                    id: 'alert-2',
                    title: '可疑登录行为',
                    description: '用户 张三 在异地IP登录，存在账户安全风险',
                    level: 'warning',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15分钟前
                },
                {
                    id: 'alert-3',
                    title: '系统性能监控',
                    description: '核心交易系统CPU使用率达到85%，建议关注',
                    level: 'info',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
                }
            ]
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取告警数据失败'
        } finally {
            isLoading.value = false
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
    const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`

    return date.toLocaleDateString('zh-CN')
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
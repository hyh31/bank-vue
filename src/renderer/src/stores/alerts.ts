import { defineStore } from "pinia"
import { ref, watch } from 'vue'
import { formatTime, getDefaultTitle } from "@renderer/utils"

export interface AlertItem {
    alertId: string
    alertType: 'business' | 'system' | 'security' | 'compliance' | 'performance'
    title: string
    description: string
    message: string
    level: 'critical' | 'warning' | 'info'
    status: 'pending' | 'processing' | 'resolved' | 'ignored'
    source: string
    assigneeId?: string
    clientId?: string
    createTime: string
    updateTime: string
    resolvedTime?: string
    resolvedById?: string
    resolutionNote?: string
    // timestamp: string
}

// 告警滚动配置常量
const ALERT_CONFIG = {
    SCROLL_INTERVAL: 2000,           // 滚动间隔（毫秒）
    MIN_ALERTS_FOR_SCROLL: 2,        // 开始滚动的最小告警数量
    ALERT_ITEM_HEIGHT: 100           // 单个告警项高度（像素）
} as const

export const useAlertsStore = defineStore('alerts', () => {
    const isInitialized = ref(false)
    const alerts = ref<AlertItem[]>([])
    const isDatabaseConnected = ref(true)  // 数据库连接状态
    const isLoading = ref(false)
    const error = ref<string | null>(null)        // 错误信息

    // 滚动代码
    const currentIndex = ref(0)                   // 当前显示的告警索引
    const alertContainer = ref<HTMLElement | null>(null)
    let scrollTimer: NodeJS.Timeout | null = null
    let refreshTimer: NodeJS.Timeout | null = null

    // 启动自动滚动（逐条向上滚动）
    const startAutoScroll = () => {

        if (scrollTimer) return
        
        if (alerts.value.length <= ALERT_CONFIG.MIN_ALERTS_FOR_SCROLL) return

        scrollTimer = setInterval(() => {
            currentIndex.value++

        }, ALERT_CONFIG.SCROLL_INTERVAL)
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
        if (refreshTimer) return

        refreshTimer = setInterval(() => {
            if (isDatabaseConnected.value) {
                fetchAlerts(true)
            }
        }, 30000)
    }

    // 停止自动刷新
    const stopAutoRefresh = () => {
        if (refreshTimer) {
            clearInterval(refreshTimer)
            refreshTimer = null
        }
    }

    // 添加本地告警
    const showDatabaseError = () => {
        isDatabaseConnected.value = false
        alerts.value = [{
            alertId: `local-${Date.now()}`,
            alertType: 'system',
            level: 'critical',
            title: '本地告警',
            message: '数据库连接失败',
            description: '数据库连接失败',
            source: '本地告警',
            status: 'pending',
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            // timestamp: new Date().toISOString()
        }]
        currentIndex.value = 0
        stopAutoScroll()
    }

    // 增量的形式添加单个告警，避免刷新的抖动
    const addAlert = (newAlert: AlertItem) => {
        alerts.value.push(newAlert)
        if (alerts.value.length >= ALERT_CONFIG.MIN_ALERTS_FOR_SCROLL && !scrollTimer) {
            startAutoScroll()
        }
    }

    // 移除单个关闭的告警
    const removeAlert = (alertId: string) => {
        const index = alerts.value.findIndex(alert => alert.alertId === alertId)
        if (index !== -1) {
            const isCurrentAlert = index === currentIndex.value
            const isBeforeCurrent = index < currentIndex.value

            alerts.value.splice(index, 1)   // 数组删除

            if (isBeforeCurrent) {
                currentIndex.value = alerts.value.length - 1
            } else if (isCurrentAlert) {
                if (currentIndex.value >= alerts.value.length && alerts.value.length > 0) {
                    currentIndex.value = alerts.value.length - 1
                }
            }

            if (alerts.value.length < ALERT_CONFIG.MIN_ALERTS_FOR_SCROLL) {
                stopAutoScroll()
            }
        }
    }

    // 设置告警列表(api获取)
    const setNormalAlerts = (newAlerts: AlertItem[], nowPosition = true) => {
        isDatabaseConnected.value = true

        if (nowPosition && alerts.value.length > 0) {
            // 保持现在的位置滚动
            const oldCurrentIndex = currentIndex.value
            const currentAlert = alerts.value[oldCurrentIndex]

            alerts.value = newAlerts
            
            if (currentAlert && newAlerts.length > 0) {
                const newIndex = newAlerts.findIndex(alert => alert.alertId === currentAlert.alertId)
                if (newIndex !== -1) {
                    currentIndex.value = newIndex
                } else {
                    currentIndex.value = Math.min(oldCurrentIndex, newAlerts.length - 1)
                }
            } 
        } else {
            alerts.value = newAlerts
            currentIndex.value = 0
        }

        if (newAlerts.length > 1) {
            startAutoScroll()
        } else {
            stopAutoScroll()
        }
    }

    // 获取告警数据
    const fetchAlerts = async (nowPosition = true) => {
        if (!isDatabaseConnected.value) return

        try {
            isLoading.value = true
            error.value = null

            console.log('正在获取告警数据...')

            const result = await (window.api as any).fetchAlerts({ limit: 10 })
            console.log(result)
            if (result.success) {
                const apiAlerts = result.data.map((item: any) => ({
                    id: item.alertId || item.id,
                    level: item.level,
                    title: item.title || getDefaultTitle(item.alertType),
                    description: item.message,
                    createTime: formatTime((item.createTime).replace(' ', 'T'))
                }))

                setNormalAlerts(apiAlerts, nowPosition)
                console.log('告警数据获取成功，共', apiAlerts.length, '条告警')
            } else {
                throw new Error(result.message || '获取告警数据失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取告警数据失败'
            showDatabaseError()
        } finally {
            isLoading.value = false
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

    // 自动初始化
    const autoInitialize = async () => {
        if (isDatabaseConnected.value) {
            await fetchAlerts(false)
            isInitialized.value = true
        }
    }

    return {
        alerts,
        isDatabaseConnected,
        isLoading,
        error,
        currentIndex,
        alertContainer,
        fetchAlerts,
        showDatabaseError,
        setNormalAlerts,
        startAutoScroll,
        stopAutoScroll,
        startAutoRefresh,
        stopAutoRefresh,
        autoInitialize,
        addAlert,
        removeAlert
    }
})
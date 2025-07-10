import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 交易的接口
 */
interface TransactionItem {
    id: string
    amount: number
    type: string
    status: 'completed' | 'pending' | 'failed'
    riskLevel: 'high' | 'medium' | 'low'
    timestamp: Date
}

/**
 * 交易数据配置
 */
interface TransactionOptions {
    autoRefresh?: boolean
    refreshInterval?: number
}

export function useTransactions(options: TransactionOptions = {}) {
    const {
        autoRefresh = true,
        refreshInterval = 30000
    } = options

    // 状态管理
    const transactionData = ref<TransactionItem[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    
    let refreshTimer: NodeJS.Timeout | null = null

    // 获取交易的数据
    const fetchTransactions = async () => {
        try {
            isLoading.value = false
            error.value = null
            transactionData.value = [
                {
                    id: 'TXN001234567',
                    amount: 5000000,
                    type: '转账',
                    status: 'pending',
                    riskLevel: 'high',
                    timestamp: new Date(Date.now() - 2 * 60 * 1000)
                },
                {
                    id: 'TXN001234568',
                    amount: 150000,
                    type: '取现',
                    status: 'completed',
                    riskLevel: 'medium',
                    timestamp: new Date(Date.now() - 10 * 60 * 1000)
                },
                {
                    id: 'TXN001234569',
                    amount: 25000,
                    type: '存款',
                    status: 'completed',
                    riskLevel: 'low',
                    timestamp: new Date(Date.now() - 25 * 60 * 1000)
                },
                {
                    id: 'TXN001234570',
                    amount: 800000,
                    type: '转账',
                    status: 'failed',
                    riskLevel: 'high',
                    timestamp: new Date(Date.now() - 45 * 60 * 1000)
                }
            ]
        } catch (err) {
            error.value = '数据获取失败'
        } finally {
            isLoading.value = false
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
     * 格式化货币
     */
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(amount)
    }

    /**
     * 格式化状态样式
     */
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default'
            case 'pending':
                return 'secondary'
            case 'failed':
                return 'destructive'
            default:
                return 'outline'
        }
    }

    /**
     * 获取风险等级的样式
     */
    const getRiskVariant = (riskLevel: string) => {
        switch (riskLevel) {
            case 'high':
                return 'destructive'
            case 'medium':
                return 'secondary'
            case 'low':
                return 'default'
            default:
                return 'outline'
        }
    }

    /**
     * 自动刷新
     */
    const startAutoRefresh = () => {
        if (!autoRefresh) return
        refreshTimer = setInterval(() => {
            fetchTransactions()
        }, refreshInterval)
    }

    /**
     * 停止自动刷新
    */
    const stopAutoRefresh = () => {
        if (refreshTimer) {
            clearInterval(refreshTimer)
            refreshTimer = null
        }
    }

    /**
     * 生命周期
     */
    onMounted(async () => {
        await fetchTransactions()
        startAutoRefresh()
    })

    onUnmounted(() => {
        stopAutoRefresh()
    })

    return {
        transactionData,
        isLoading,
        error,
        fetchTransactions,
        formatCurrency,
        getStatusVariant,
        getRiskVariant,
        formatTime,
        startAutoRefresh,
        stopAutoRefresh
    }
}
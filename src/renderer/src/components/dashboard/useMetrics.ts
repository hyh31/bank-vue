import { ref, computed } from 'vue'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Activity,
    AlertTriangle,
    Shield,
    Users,
} from 'lucide-vue-next'

/**
 * 通用指标管理器
 * 提供指标创建、更新、格式化等功能
 */
export function useMetrics() {
    const metrics = ref<any[]>([])
    const iconMap = {
        'AlertTriangle': AlertTriangle,
        'Shield': Shield,
        'Users': Users,
        'Activity': Activity,
        'TrendingUp': TrendingUp,
        'TrendingDown': TrendingDown,
        'Minus': Minus
    }

    /**
     * 创建指标
     */
    const createMetric = (config: {
        id: string
        title: string
        icon: any
        iconColor: string
        trend?: string
        initialValue?: any
        compareType?: string
    }) => {
        return {
            id: config.id,
            title: config.title,
            value: config.initialValue || '计算中...',
            change: '+0.0%',
            trend: config.trend || 'neutral',
            icon: config.icon,
            iconColor: config.iconColor,
            compareType: config.compareType || 'yesterday'
        }
    }

    /**
     * 更新指标
     */
    const updateMetric = (id: string, updates: {
        value?: any
        change?: string
        trend?: string
    }) => {
        const metric = metrics.value.find(m => m.id === id)
        if (metric) {
            Object.assign(metric, updates)   // Object.assign就是把现在的属性值复制到原来的对象上
        }
    }

    /**
     * 批量初始化指标
     */
    const initializeMetrics = (config: any[]) => {
        metrics.value = config.map(createMetric)
    }

    // 判断趋势图标
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return 'TrendingUp'
            case 'down': return 'TrendingDown'
            default: return 'Minus'
        }
    }

    /**
     * 获取趋势颜色样式
     */
    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'up':
            return 'text-green-600'
            case 'down':
            return 'text-red-600'
            default:
            return 'text-gray-600'
        }
    }

    const getCompareText = (compareType: string) => {
        switch (compareType) {
            case 'yesterday': return '昨日'
            default: return '上次'
        }
    }

    const getIconComponent = (iconName: string) => {
        return iconMap[iconName] || Activity
    }

    /**
     * 默认配置
     */
    const getDefaultMetrics = () => [
        {
            id: 'total-alerts',
            title: '今日告警总数',
            initialValue: '127',
            change: '+23%',
            trend: 'up',
            icon: 'AlertTriangle',
            iconColor: 'text-destructive',
            compareType: 'yesterday'
        },
        {
            id: 'high-risk-transactions',
            title: '高风险交易',
            initialValue: '8',
            change: '-12%',
            trend: 'down',
            icon: 'Shield',
            iconColor: 'text-orange-500',
            compareType: 'yesterday'
        },
        {
            id: 'monitored-accounts',
            title: '监控交易数',
            initialValue: '2,780',
            change: '+5%',
            trend: 'up',
            icon: 'Users',
            iconColor: 'text-blue-500',
            compareType: 'yesterday'
        },
        {
            id: 'system-health',
            title: '系统健康度',
            initialValue: '',
            change: '',
            trend: 'up',
            icon: 'Activity',
            iconColor: 'text-green-500',
            compareType: 'last'
        }
    ]

    return {
        metrics,
        createMetric,
        updateMetric,
        initializeMetrics,
        getTrendIcon,
        getTrendColor,
        getCompareText,
        getDefaultMetrics,
        getIconComponent
    }
}
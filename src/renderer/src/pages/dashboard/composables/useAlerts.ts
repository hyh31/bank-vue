import { AlertCircle, Info, XCircle } from 'lucide-vue-next'

export function useAlerts() {

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

    return {
        getAlertIcon,
        getAlertIconColor,
        getAlertVariant,
        getAlertsLevelText,
    }
}
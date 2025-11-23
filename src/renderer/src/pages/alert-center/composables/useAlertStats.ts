// 数据统计管理与计算
import { ref, computed } from 'vue'
import type { AlertCenterItem, AlertStats } from '../types/alert-center'

/**
 * 告警统计数据管理
 * 统计数据管理 计算 数据分析
 */
export function useAlertStats() {
    // 统计数据状态
    const stats = ref<AlertStats>({
        total: 0,
        pending: 0,
        processing: 0,
        resolved: 0,
        critical: 0,
        warning: 0,
        info: 0,
        byType: {
            business: 0,
            system: 0,
            security: 0,
            compliance: 0,
            performance: 0
        },
        byAssignee: []
    })

    // 计算统计数据（根据告警列表）
    const calculateStats = (alerts: AlertCenterItem[]) => {
        const newStats: AlertStats = {
            total: alerts.length,
            pending: 0,
            processing: 0,
            resolved: 0,
            critical: 0,
            warning: 0,
            info: 0,
            byType: {
                business: 0,
                system: 0,
                security: 0,
                compliance: 0,
                performance: 0
            },
            byAssignee: []
        }

        // 遍历告警列表，统计各个状态以及级别的告警数量
        alerts.forEach(alert => {
            // 统计状态
            switch (alert.status) {
                case 'pending':
                    newStats.pending++
                    break
                case 'processing':
                    newStats.processing++
                    break
                case 'resolved':
                    newStats.resolved++
                    break
            }
            // 统计等级
            switch (alert.level) {
                case 'critical':
                    newStats.critical++
                    break
                case 'warning':
                    newStats.warning++
                    break
                case 'info':
                    newStats.info++
                    break
            }
        })
        stats.value = newStats
    }

    return {
        stats,
        calculateStats
    }
}
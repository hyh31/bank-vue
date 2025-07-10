import { ref, computed } from 'vue'
import type { SystemStatus } from '@shared/types'
import { system } from 'systeminformation'

/**
 * 健康度计算器
 */
export function useHealthCalculator() {
    const lastHealth = ref<number | null>(null)

    // 可配置的评分规则
    const scoreRules = {
        normal: 100,
        warning: 70,
        critical: 30,
        unknown: 0
    }

    /**
     * 计算健康度
     */
    const calculateHealth = (systemStatus: SystemStatus | null): number => {
        if (!systemStatus) return 0

        const components = [
            systemStatus.cpu,
            systemStatus.memory,
            systemStatus.network,
            systemStatus.database
        ]

        const scores = components.map(components => {
            return scoreRules[components.status] || scoreRules.unknown
        })

        return Math.round(scores.reduce((a: number, b) => a + b, 0) / scores.length)
    }

    /**
     * 计算健康度变化趋势
     */
    const calculateTrend = (currentHealth: number) => {
        if (lastHealth.value === null) {
            lastHealth.value = currentHealth
            return { trend: 'neutral', change: '+0.0%' }
        }

        const diff = currentHealth - lastHealth.value
        const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
        const change = (diff > 0 ? '+' : diff < 0 ? '' : '+') + diff.toFixed(1) + '%'
        lastHealth.value = currentHealth
        return { trend, change }
    }

    return {
        calculateHealth,
        calculateTrend,
        scoreRules
    }
}
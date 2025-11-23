import { SystemInfo, SystemStatus } from '@renderer/types/system'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAlertsStore } from './alerts'

export const useSystemStore = defineStore('system', () => {

    // 状态
    const status = ref<SystemStatus | null>(null)
    const info = ref<SystemInfo | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 获取系统状态
    const fetchSystemStatus = async () => {
        try {
            isLoading.value = true
            error.value = null
            const response = await window.api.getSystemStatus()
            status.value = response
            await checkSystemAlerts(response)
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取系统状态失败'
        } finally {
            isLoading.value = false
        }
    }

    // 获取系统信息
    const fetchSystemInfo = async () => {
        try {
            isLoading.value = true
            error.value = null
            const response = await window.api.getSystemInfo()
            info.value = response
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取系统信息失败'
        } finally {
            isLoading.value = false
        }
    }

    // 检查系统告警
    const checkSystemAlerts = async (systemStatus: any) => {
        const alertsStore = useAlertsStore()
        try {
            // 检查数据库连接
            if (systemStatus.database.status === 'critical') {
                alertsStore.showDatabaseError()
            } else {
                if (!alertsStore.isDatabaseConnected) {
                    alertsStore.isDatabaseConnected = true
                    await alertsStore.fetchAlerts()
                }
            }
        } catch (error) {
            console.error('检查系统告警失败:', error)
        }
    }

    // 清除错误
    const clearError = () => {
        error.value = null
    }

    return {
        // 状态
        status,
        info, 
        isLoading,
        error,
        // 方法
        fetchSystemStatus,
        fetchSystemInfo,
        clearError
    }
})
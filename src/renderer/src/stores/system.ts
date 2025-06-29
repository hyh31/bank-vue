import { SystemInfo, SystemStatus } from '@renderer/types/system'
import { defineStore } from 'pinia'
import { ref } from 'vue'

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
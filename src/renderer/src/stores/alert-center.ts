import { AlertApiResponse, AlertCenterItem, AlertQueryParams } from "@renderer/pages/alert-center/types/alert-center"
import { defineStore } from "pinia"
import { ref } from 'vue'


export const useAlertCenterStore = defineStore('alert-center', () => {
    // 状态
    const alerts = ref<AlertCenterItem[]>([])
    const selectedAlert = ref<AlertCenterItem | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 分页状态管理
    const pagination = ref({
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 0
    })

    // 统计好数据
    const statistics = ref(null)

    // 获取告警列表
    const fetchAlerts = async(params?: AlertQueryParams) => {
        try {
            isLoading.value = true
            error.value = null

            const result = await (window.api as any).fetchAlertsPage(params) as AlertApiResponse

            if (result.success && result.data) {
                // 后端做数据处理逻辑，前端直接展示！！！！
                alerts.value = result.data.alerts || []
                pagination.value = result.data.pagination || pagination.value
                if (result.data.statistics) {
                    statistics.value = result.data.statistics
                }
            } else {
                throw new Error(result.message || '获取告警数据失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取告警数据失败'
        } finally {
            isLoading.value = false
        }
    }


    // 获取告警详情
    const fetchAlertDetail = async (alertId: string) => {
        try {
            const result = await (window.api as any).fetchAlertDetail(alertId) as AlertApiResponse

            if (result.success && result.data) {
                selectedAlert.value = result.data
            } else {
                throw new Error(result.message || '获取告警详情失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取告警详情失败'
        }
    }


    // 获取统计的数据
    const fetchStatistics = async() => {
        try {
            const result = await (window.api as any).fetchAlertStatistics() as AlertApiResponse

            if (result.success && result.data) {
                statistics.value = result.data
            } else {
                throw new Error(result.message || '获取告警统计数据失败')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取告警统计数据失败'
        }
    }

    // 清除
    const clearError = () => {
        error.value = null
    }

    const clearSelectedAlert = () => {
        selectedAlert.value = null
    }

    return {
        alerts,
        selectedAlert,
        isLoading,
        error,
        pagination,
        statistics,
        fetchAlerts,
        fetchAlertDetail,
        fetchStatistics,
        clearError,
        clearSelectedAlert
    }
})
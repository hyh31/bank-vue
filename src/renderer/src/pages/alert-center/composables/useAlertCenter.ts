import { ref, reactive } from 'vue'
import type { 
  AlertCenterItem, 
  AlertFilters, 
  AlertStats, 
  Pagination,
  AlertStatus,
  AlertApiResponse,
} from '../types/alert-center'

/**
 * 告警中心主要逻辑
 */
export function useAlertCenter() {
  // 状态管理
  const alerts = ref<AlertCenterItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 统计数据
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

  // 筛选条件
  const filters = reactive<AlertFilters>({
    levels: [],
    types: [],
    statuses: [],
    assigneeIds: [],
    timeRange: {
      start: '',
      end: ''
    },
    keyword: '',
    tags: []
  })

  // 分页信息
  const pagination = reactive<Pagination>({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0
  })

  /**
   * 获取告警列表
   */
  const fetchAlerts = async () => {
    try {
      loading.value = true
      error.value = null

      console.log('filters:', filters)
      console.log('filter.levels:', filters.levels)
      console.log('filter.types:', filters.types)
      console.log('filter.statuses:', filters.statuses)

      // 构建查询参数
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        levels: filters.levels.length > 0 ? [...filters.levels] : undefined,
        alertTypes: filters.types.length > 0 ? [...filters.types] : undefined,
        statuses: filters.statuses.length > 0 ? [...filters.statuses] : undefined,
        startTime: filters.timeRange.start || undefined,
        endTime: filters.timeRange.end || undefined,
        keyword: filters.keyword || undefined
      }

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      )

      console.log('准备发送的参数:', cleanParams)

      console.log('正在调用 window.api.fetchAlertsPage...')

      const result = await (window.api as any).fetchAlertsPage(cleanParams) as AlertApiResponse
      console.log('API调用结果:', result)
      
      if (result.success && result.data) {
        alerts.value = result.data.alerts || []
        if (result.data.pagination) {
          pagination.page = result.data.pagination.page
          pagination.pageSize = result.data.pagination.pageSize
          pagination.total = result.data.pagination.total
          pagination.totalPages = result.data.pagination.totalPages
        }
        if (result.data.statistics) {
          stats.value = result.data.statistics
        }
      } else {
        alerts.value = []
        pagination.total = 0
      }

      console.log('告警中心数据获取成功:', result.data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取告警数据失败'
      console.error('获取告警数据失败:', err)
      alerts.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新告警状态
   */
  const updateAlertStatus = async (alertId: string, status: AlertStatus) => {
    try {
      console.log('更新告警状态:', alertId, status)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 更新本地数据
      const alert = alerts.value.find(a => a.id === alertId)
      if (alert) {
        alert.status = status
        alert.updateTime = new Date().toISOString()
      }

      console.log('告警状态更新成功')
    } catch (err) {
      console.error('更新告警状态失败:', err)
      throw err
    }
  }

  /**
   * 批量操作告警
   */
  const batchUpdateAlerts = async (alertIds: string[], status: AlertStatus) => {
    try {
      console.log('批量更新告警状态:', alertIds, status)
      
      for (const id of alertIds) {
        await updateAlertStatus(id, status)
      }

      console.log('批量更新完成')
    } catch (err) {
      console.error('批量更新失败:', err)
      throw err
    }
  }

  return {
    // 状态
    alerts,
    loading,
    error,
    stats,
    filters,
    pagination,

    // 方法
    fetchAlerts,
    updateAlertStatus,
    batchUpdateAlerts
  }
}

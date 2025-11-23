import { reactive } from "vue"
import type { AlertFilters, AlertLevel, AlertStatus, AlertType } from "../types/alert-center"

/**
 * 告警筛选逻辑
 * 筛选条件管理 筛选操作 条件重置
 */
export function useAlertFilters() {
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

  // 切换告警级别筛选
  const toggleLevel = (level: AlertLevel) => {
    const index = filters.levels.indexOf(level)
    if (index > -1) {
        filters.levels.splice(index, 1)
    } else {
        filters.levels.push(level)
    }
  }

  // 切换告警状态筛选
  const toggleStatus = (status: AlertStatus) => {
    const index = filters.statuses.indexOf(status)
    if (index > -1) {
        filters.statuses.splice(index, 1)
    } else {
        filters.statuses.push(status)
    }
  }

  // 切换告警类型筛选
  const toggleType = (type: AlertType) => {
    const index = filters.types.indexOf(type)
    if (index > -1) {
        filters.types.splice(index, 1)
    } else {
        filters.types.push(type)
    }
  }

  // 设置时间范围
  const setTimeRange = (start: string, end: string) => {
    filters.timeRange.start = start
    filters.timeRange.end = end
  }

  // 设置搜索关键词
  const setKeyword = (keyword: string) => {
    filters.keyword = keyword
  }

  // 清空所有的筛选条件
  const clearFilters = () => {
    filters.levels = []
    filters.types = []
    filters.statuses = []
    filters.timeRange = {
      start: '',
      end: ''
    }
    filters.keyword = ''
  }

  return {
    filters,
    toggleLevel,
    toggleStatus,
    toggleType,
    setTimeRange,
    setKeyword,
    clearFilters
  }
}
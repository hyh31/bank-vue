<template>
  <div class="h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
    <!-- 头部 -->
    <AlertCenterHeader
      :stats="stats"
      :loading="loading"
      @refresh="handleRefresh"
      @search="handleSearch"
    />

    <!-- 主内容区域 - 双栏布局 -->
    <div class="flex h-[calc(100%-80px)]">
      <!-- 左侧筛选栏 -->
      <div class="w-72 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200/60 dark:border-slate-700/60">
        <AlertFilters
          :filters="filters"
          :stats="stats"
          @filter-change="handleFilterChange"
          @update:filters="handleFiltersUpdate"
        />
      </div>

      <!-- 右侧告警列表 -->
      <div class="flex-1 min-w-0">
        <AlertList
          :alerts="alerts"
          :loading="loading"
          :pagination="pagination"
          @view-detail="handleViewDetail"
          @update-status="handleUpdateStatus"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 告警详情抽屉 -->
    <AlertDetailDrawer
      v-model:open="detailDrawerOpen"
      :alert="selectedAlert"
      @update-status="handleUpdateStatus"
      @close="handleCloseDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AlertFilters from './components/AlertFilters.vue'
import AlertList from './components/AlertList.vue'
import AlertDetailDrawer from './components/AlertDetailDrawer.vue'
import { useAlertCenter } from './composables/useAlertCenter'
import type { AlertCenterItem } from './types/alert-center'
import AlertCenterHeader from './components/AlertCenterHeader.vue'

// 使用告警中心逻辑
const {
  alerts,
  stats,
  filters,
  pagination,
  loading,
  fetchAlerts,
  updateAlertStatus
} = useAlertCenter()

// 详情抽屉状态
const detailDrawerOpen = ref(false)
const selectedAlert = ref<AlertCenterItem | null>(null)

// 搜索关键词
const searchKeyword = ref('')

/**
 * 处理筛选变化
 */
const handleFilterChange = () => {
  pagination.page = 1
  fetchAlerts()
}

/**
 * 处理刷新
 */
const handleRefresh = () => {
  fetchAlerts()
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  filters.keyword = searchKeyword.value
  pagination.page = 1
  fetchAlerts()
}

/**
 * 快速筛选切换
 */
const toggleQuickFilter = (type: string) => {
  if (type === 'critical') {
    const index = filters.levels.indexOf('critical')
    if (index > -1) {
      filters.levels.splice(index, 1)
    } else {
      filters.levels.push('critical')
    }
  } else if (type === 'pending') {
    const index = filters.statuses.indexOf('pending')
    if (index > -1) {
      filters.statuses.splice(index, 1)
    } else {
      filters.statuses.push('pending')
    }
  }
  pagination.page = 1
  fetchAlerts()
}

/**
 * 处理查看详情
 */
const handleViewDetail = (alert: AlertCenterItem) => {
  selectedAlert.value = alert
  detailDrawerOpen.value = true
}

/**
 * 处理状态更新
 */
const handleUpdateStatus = async (alertId: string, status: string) => {
  try {
    await updateAlertStatus(alertId, status as any)
    await fetchAlerts()
    
    // 如果当前详情抽屉显示的是这个告警，更新详情
    if (selectedAlert.value?.id === alertId) {
      const updatedAlert = alerts.value.find(a => a.id === alertId)
      if (updatedAlert) {
        selectedAlert.value = updatedAlert
      }
    }
  } catch (error) {
    console.error('更新告警状态失败:', error)
  }
}

const handleFiltersUpdate = (newFilters: any) => {
  Object.assign(filters, newFilters)
}

/**
 * 处理分页变化
 */
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchAlerts()
}

/**
 * 处理关闭详情
 */
const handleCloseDetail = () => {
  detailDrawerOpen.value = false
  selectedAlert.value = null
}

// 初始化
onMounted(() => {
  fetchAlerts()
})
</script>

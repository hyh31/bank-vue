<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Dashboard from '@/components/Dashboard.vue'
import DataVisualizationDashboard from '@/components/DataVisualizationDashboard.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

/**
 * 当前活动视图类型
 */
type ViewType = 'dashboard' | 'data-visualization'

/**
 * 当前活动视图
 */
const currentView = ref<ViewType>('dashboard')

/**
 * 组件引用
 */
const dashboardRef = ref<InstanceType<typeof Dashboard> | null>(null)
const dataVisualizationRef = ref<InstanceType<typeof DataVisualizationDashboard> | null>(null)

/**
 * ECharts实例安全操作函数
 */
const safeEChartsOperation = (callback: () => void) => {
  try {
    callback()
  } catch (error) {
    console.warn('ECharts操作失败:', error)
  }
}

/**
 * 清理当前视图中的ECharts实例
 */
const cleanupCurrentViewCharts = () => {
  safeEChartsOperation(() => {
    // 清理仪表盘中的图表
    if (dashboardRef.value && (dashboardRef.value as any).cleanup) {
      (dashboardRef.value as any).cleanup()
    }

    // 清理数据可视化中的图表
    if (dataVisualizationRef.value && (dataVisualizationRef.value as any).cleanup) {
      (dataVisualizationRef.value as any).cleanup()
    }
  })
}

// 切换视图
const switchView = async (view: string) => {

  // 类型检查
  if (view !== 'dashboard' && view !== 'data-visualization') {
    console.error('无效的视图类型:', view)
    return
  }

  cleanupCurrentViewCharts()

  await nextTick()

  // 切换视图
  currentView.value = view as ViewType
  console.log('视图已切换到:', view)
}

// 组件卸载前清理ECharts实例
onBeforeUnmount(() => {
  // 清理所有视图的ECharts实例
  cleanupCurrentViewCharts()
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar :current-view="currentView" @view-change="switchView" />
    <SidebarInset>
      <!-- 银行监控告警系统主仪表盘 -->
      <Dashboard v-if="currentView === 'dashboard'" ref="dashboardRef" />

      <!-- 数据可视化页面 -->
      <DataVisualizationDashboard v-else-if="currentView === 'data-visualization'" ref="dataVisualizationRef" />
    </SidebarInset>
  </SidebarProvider>
</template>

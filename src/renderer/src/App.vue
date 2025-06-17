<script setup lang="ts">
import { ref } from 'vue'
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
 * 切换视图 - 简化版本
 * @param view 目标视图类型
 */
const switchView = (view: string) => {
  console.log('🔄 切换视图:', view)

  // 类型检查
  if (view !== 'dashboard' && view !== 'data-visualization') {
    console.error('❌ 无效的视图类型:', view)
    return
  }

  // 直接切换，不使用复杂的异步逻辑
  currentView.value = view as ViewType
  console.log('✅ 视图已切换到:', view)
}
</script>

<template>
  <SidebarProvider>
    <AppSidebar @view-change="switchView" :current-view="currentView" />
    <SidebarInset>
      <!-- 银行监控告警系统主仪表盘 -->
      <Dashboard v-if="currentView === 'dashboard'" />

      <!-- 数据可视化页面 -->
      <DataVisualizationDashboard v-else-if="currentView === 'data-visualization'" />
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import Dashboard from '@/components/Dashboard.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <!-- 银行监控告警系统主仪表盘 -->
      <Dashboard />
    </SidebarInset>
  </SidebarProvider>
</template>

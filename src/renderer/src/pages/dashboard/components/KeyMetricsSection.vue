<template>
    <!-- 关键指标卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <Card
        v-for="metric in metrics"
        :key="metric.id"
        class="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 group hover:bg-primary/5"
        style="height: 145px"
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
          <CardTitle class="text-sm font-medium group-hover:text-primary transition-colors">
            {{ metric.title }}
          </CardTitle>
          <component
            :is="getIconComponent(metric.icon)"
            :class="[
              'h-4 w-4',
              metric.iconColor
            ]"
          />
        </CardHeader>
        <CardContent class="pb-3">
          <div class="text-xl font-bold group-hover:text-primary transition-colors mb-1">
            {{ metric.value }}
          </div>
          <div class="flex items-center text-xs text-muted-foreground">
            <component
              :is="getTrendIconComponent(getTrendIcon(metric.trend))"
              :class="['h-3 w-3 mr-1', getTrendIconComponent(getTrendIcon(metric.trend))]"
            />
            <span :class="getTrendColor(metric.trend)">{{ metric.change }}</span>
            <span class="ml-1">较{{ getCompareText(metric.compareType) }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMetrics } from '../composables/useMetrics'
import { useHealthCalculator } from '../composables/useHealthCalculator'
import { useSystemStore } from '@renderer/stores/system'
import { storeToRefs } from 'pinia'

// 使用组合式函数管理状态
const { metrics, initializeMetrics, updateMetric, getTrendIcon, getTrendColor, getCompareText, getDefaultMetrics, getIconComponent, getTrendIconComponent } = useMetrics()
const { calculateHealth, calculateTrend } = useHealthCalculator()
const systemStore = useSystemStore()
const { status } = storeToRefs(systemStore)

/**
 * 挂载
 */
onMounted(async () => {

  initializeMetrics(getDefaultMetrics())

  watch(status, (newStatus) => {
    if (newStatus) {
      const health = calculateHealth(newStatus)
      const { trend, change } = calculateTrend(health)
      updateMetric('system-health', {
        value: health + '%',
        change: change,
        trend: trend
      })
    }
  }, { immediate: true })
})

</script>
<template>
    <!-- 昨日地域分布统计 -->
    <Card class="hover:shadow-md transition-shadow duration-300" style="height: 290px">
      <CardHeader class="pb-2">
        <CardTitle class="flex items-center">
          <BarChart3 class="w-4 h-4 mr-2" />
          昨日地域分布
        </CardTitle>
      </CardHeader>
      <CardContent class="h-full overflow-hidden relative">
        <div v-if="isLoading" class="text-center py-8">
          <div class="text-sm text-muted-foreground">加载地域数据中...</div>
        </div>
        <div
          v-else-if="regionStats.length > 0"
          ref="regionContainer"
          class="space-y-3"
          :style="{
            transform: `translateY(-${regionScrollOffset}px)`,
            transition: isRegionScrolling ? 'none' : 'transform 0.1s ease-out'
          }"
        >
          <!-- 原始地域列表 -->
          <div
            v-for="region in regionStats"
            :key="region.name"
            class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            style="height: 48px"
          >
            <div class="flex items-center">
              <div :class="['w-3 h-3 rounded-full mr-3', region.color]"></div>
              <span class="text-sm font-medium">{{ region.name }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-muted-foreground">{{ region.percentage }}%</span>
              <Badge :variant="region.variant" class="hover:scale-105 transition-transform">
                {{ region.count }}笔
              </Badge>
            </div>
          </div>
          
          <!-- 复制的地域列表，用于无缝循环 -->
          <div
            v-for="region in regionStats"
            :key="`copy-${region.name}`"
            class="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            style="height: 48px"
          >
            <div class="flex items-center">
              <div :class="['w-3 h-3 rounded-full mr-3', region.color]"></div>
              <span class="text-sm font-medium">{{ region.name }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-muted-foreground">{{ region.percentage }}%</span>
              <Badge :variant="region.variant" class="hover:scale-105 transition-transform">
                {{ region.count }}笔
              </Badge>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <div class="text-sm text-muted-foreground">暂无地域数据</div>
        </div>
      </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRegionStats } from './useRegionStats'

const { regionStats, regionScrollOffset, isRegionScrolling, isLoading } = useRegionStats()
</script>

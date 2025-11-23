<template>
    <!-- 告警列表 -->
    <div class="col-span-1">
      <Card
        class="hover:shadow-md transition-all duration-300 hover:border-primary/30"
        style="height: 290px"
      >
        <CardHeader class="pb-2">
          <CardTitle class="flex items-center">
            <AlertTriangle class="w-5 h-5 mr-2 text-destructive animate-pulse" />
            实时告警
            <Badge variant="destructive" class="ml-2 text-xs">
                {{ alerts.length }}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="h-full overflow-hidden relative">
            <!-- 加载状态显示 -->
            <div v-if="isLoading" class="text-center py-8">
                <div class="text-sm text-muted-foreground">加载告警数据中...</div>
            </div>
            <div v-else-if="alerts.length > 0"
                 class="transition-transform duration-1000 ease-in-out"
                 :style="{ transform: `translateY(-${currentIndex * 100}px)` }"
                 ref="alertContainer">
                <!-- 告警列表 -->
                <div
                v-for="alert in alerts"
                :key="alert.alertId"
                class="p-3 rounded-lg border hover:bg-muted/50 transition-all duration-300 cursor-pointer mb-3"
                style="height: 88px;"
                >
                    <div class="flex items-start space-x-3 flex-1 min-w-0">
                        <!-- 添加图标 -->
                        <component
                            :is="getAlertIcon(alert.level)"
                            :class="['h-4 w-4 mt-0.5 flex-shrink-0', getAlertIconColor(alert.level)]"
                        />
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium truncate">
                                {{ alert.title }}
                            </div>
                            <div class="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {{ alert.description }}
                            </div>
                            <div class="text-xs text-muted-foreground mt-1">
                                {{ formatTime(alert.createTime) }}
                            </div>
                        </div>
                        <Badge :variant="getAlertVariant(alert.level)" class="text-xs">
                            {{ getAlertsLevelText(alert.level) }}
                        </Badge>
                    </div>
                </div>
                <div
                v-if="alerts.length > 2"
                v-for="alert in alerts"
                :key="`copy-${alert.alertId}`"
                class="p-3 rounded-lg border hover:bg-muted/50 transition-all duration-300 cursor-pointer mb-3"
                style="height: 88px;"
                >
                    <div class="flex items-start space-x-3 flex-1 min-w-0">
                        <!-- 添加图标 -->
                        <component
                            :is="getAlertIcon(alert.level)"
                            :class="['h-4 w-4 mt-0.5 flex-shrink-0', getAlertIconColor(alert.level)]"
                        />
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium truncate">
                                {{ alert.title }}
                            </div>
                            <div class="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {{ alert.description }}
                            </div>
                            <div class="text-xs text-muted-foreground mt-1">
                                {{ formatTime(alert.createTime) }}
                            </div>
                        </div>
                        <Badge :variant="getAlertVariant(alert.level)" class="text-xs">
                            {{ getAlertsLevelText(alert.level) }}
                        </Badge>
                    </div>
                </div>
            </div>
            <!-- 无告警状态 -->
            <div v-else class="text-center py-8">
                <div class="text-sm text-muted-foreground">暂无告警信息</div>
            </div>
        </CardContent>
      </Card>
    </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAlerts } from '../composables/useAlerts'
import { useAlertsLifecycle } from '../composables/useAlertsLifecycle'
import { formatTime } from '@renderer/utils'

// 使用逐条向上滚动（每2秒向上滚动一条告警）
const { getAlertIcon, getAlertIconColor, getAlertVariant, getAlertsLevelText } = useAlerts()
const { alerts, currentIndex, isLoading, alertContainer } = useAlertsLifecycle()
</script>
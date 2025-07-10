<template>
    <div class="space-y-4">
        <!-- 系统状态监控 -->
         <Card class="hover:shadow-md transition-shadow duration-300" style="height: 290px;">
            <CardHeader>
                <CardTitle class="flex items-center">
                    <Activity class="w-4 h-4 mr-2" />
                        系统状态
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div class="space-y-5">
                    <!-- 加载状态显示 -->
                     <div v-if="isLoading && systemStatusList.length === 0" class="text-center py-8">
                        <div v-for="(item, index) in Array(4)" :key="index" class="space-y-2">
                            <div class="flex items-center justify-between">
                                <div class="h-4 bg-muted rounded animate-pulse w-20"></div>
                                <div class="h-6 bg-muted rounded animate-pulse w-16"></div>
                            </div>
                            <div class="w-full bg-muted rounded-full h-2">
                                <div class="h-2 bg-muted rounded-full animate-pulse w-1/3"></div>
                            </div>
                        </div>
                     </div>
                    <!-- 显示处理后的系统状态数据 -->
                    <div v-for="statusItem in systemStatusList" :key="statusItem.name" class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ statusItem.name }}</span>
                            <Badge :variant="statusItem.status === 'normal' ? 'default' : 'secondary'">
                                {{ statusItem.value }}
                            </Badge>
                        </div>
                        <div class="w-full bg-muted rounded-full h-2">
                            <div
                                :class="['h-2 rounded-full transition-all duration-500', statusItem.color]"
                                :style="{ width: `${statusItem.percentage}%` }"
                            ></div>
                        </div>
                    </div>
                </div>
            </CardContent>
         </Card>
    </div>
</template>

<script setup lang="ts">
import { Activity } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { useSystemMonitor } from './useSystemMonitor'
import Badge from '../ui/badge/Badge.vue'

// 使用系统状态
const { systemStatusList, isLoading } = useSystemMonitor()

</script>
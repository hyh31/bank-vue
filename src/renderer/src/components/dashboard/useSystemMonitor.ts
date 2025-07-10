import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSystemStore } from '@renderer/stores/system'
import { storeToRefs } from 'pinia'

/**
 * 定义类型接口
 * @param options 
 * @returns 
 */
interface SystemMonitorOptions {
    autoRefresh?: boolean
    refreshInterval?: number
    immediate?: boolean
}

//系统监控的刷新通用逻辑
export function useSystemMonitor(options: SystemMonitorOptions = {}) {
    const {
        autoRefresh = true,
        refreshInterval = 10000,
        immediate = true
    } = options

    const systemStore = useSystemStore()
    const { status, info, isLoading, error } = storeToRefs(systemStore)

    // 显示系统状态

    const systemStatusList = ref([
        {
            name: 'CPU使用率',
            value: '获取中...',
            percentage: 0,
            status: 'normal',
            color: 'bg-gray-500'
        },
        {
            name: '内存使用率',
            value: '获取中...',
            percentage: 0,
            status: 'normal',
            color: 'bg-gray-500'
        },
        {
            name: '网络延迟',
            value: '获取中...',
            percentage: 0,
            status: 'normal',
            color: 'bg-gray-500'
        },
        {
            name: '数据库连接',
            value: '获取中...',
            percentage: 0,
            status: 'normal',
            color: 'bg-gray-500'
        }
    ])

    let refreshIntervalId: NodeJS.Timeout | null = null

    // 启动自动刷新
    const startAutoRefresh = () => {
        if (autoRefresh && !refreshIntervalId) {
            refreshIntervalId = setInterval(() => {
                systemStore.fetchSystemStatus()
            }, refreshInterval)
        }
    }

    // 停止自动刷新
    const stopAutoRefresh = () => {
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId)
            refreshIntervalId = null
        }
    }

    // 获取系统状态
    const fetchData = async () => {
        try {
            await systemStore.fetchSystemStatus()
        } catch (err) {
            console.error('获取系统状态失败:', err)
        }
    }

    // 根据状态获取颜色
    const getStatusColor = (status: string): string => {
    switch (status) {
        case 'normal': return 'bg-green-500'
        case 'warning': return 'bg-yellow-500'
        case 'critical': return 'bg-red-500'
        default: return 'bg-gray-500'
        }
    }

    watch(status, (newStatus) => {
        if (newStatus) {
          systemStatusList.value = [
            {
              ...newStatus.cpu,
              color: getStatusColor(newStatus.cpu.status)
            },
            {
              ...newStatus.memory,
              color: getStatusColor(newStatus.memory.status)
            },
            {
              ...newStatus.network,
              color: getStatusColor(newStatus.network.status)
            },
            {
              ...newStatus.database,
              color: getStatusColor(newStatus.database.status)
            }
          ]
        }
    }, { immediate: true})

    // 生命周期管理
    onMounted(async () => {
        if (immediate) {
            await fetchData()
        }
        startAutoRefresh()
    })

    onUnmounted(() => {
        stopAutoRefresh()
    })

    return {
        status,
        isLoading,
        error,
        systemStatusList,
        startAutoRefresh,
        stopAutoRefresh,
        getStatusColor,
        fetchData
    }
}
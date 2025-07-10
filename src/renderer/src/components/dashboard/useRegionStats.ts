import { ref, onMounted, onUnmounted } from 'vue'


/**
 * 地域统计数据接口
 */
interface RegionStatusItem {
    name: string    // 地域名称
    count: number    // 交易笔数
    percentage: number    // 交易笔数占比
    color: string    // 颜色
    variant: 'default' | 'secondary' | 'destructive' | 'outline'   // 样式背景变体
}

/**
 * 地域统计配置选项
 */
interface  RegionStatsOptions {
    autoRefresh?: boolean
    refreshInterval?: number
    autoScroll?: boolean
    scrollInterval?: number
}

/**
 * 地域统计
 */
export function useRegionStats(options: RegionStatsOptions = {}) {
    const {
        autoRefresh = true,        // 是否自动滚动
        refreshInterval = 30000,   // 滚动间隔时间
    } = options

    // 状态管理
    const regionStats = ref<RegionStatusItem[]>([])   // 存储地域统计数据的数组
    const regionScrollOffset = ref(0)     // 滚动偏移量
    const isRegionScrolling = ref(false)   // 是否正在滚动
    const isLoading = ref(false)    // 数据加载状态
    const error = ref<string | null>(null)   // 错误信息

    // 定时器管理
    let refreshTimer: NodeJS.Timeout | null = null   // 自动刷新定时器

    // 颜色配置
    const tailwindColors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-orange-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
        'bg-red-500',
        'bg-cyan-500',
        'bg-lime-500',
        'bg-amber-500'
    ]

    const regionColorMap: Record<string, string> = {}
    let colorIndex = 0
    const getColorByRegin = (name: string): string => {
        if(!regionColorMap[name]) {
            regionColorMap[name] = tailwindColors[colorIndex % tailwindColors.length]
            colorIndex++
        }
        return regionColorMap[name]
    }

    /**
     * 获取数据
     */
    const fetchRegionStats = async () => {
        try{
            isLoading.value = true
            error.value = null
            console.log('正在获取昨日地域分布统计数据')
            const res = await (window.api as any).fetchData()
            console.log(res)   // 打印数据
            
            // 提取数据部分
            const data = res.data
            let list: any[] = []
            if (Array.isArray(data)) {
                // 如果data直接是数组
                list = data
            } else if (Array.isArray(data?.list)) {
                // 如果data是对象，且包含list属性
                list = data.list
            }

            // 计算交易笔数
            const total = list.reduce((sum, item) => sum + (item.transcationTimes || 0), 0)
            regionStats.value = list.map((item: any) => ({
                ...item,
                name: item.province,
                count: item.transcationTimes,
                percentage: ((item.transcationTimes / total) * 100).toFixed(2),
                color: getColorByRegin(item.province),
                variant: 'default' as const
            }))
        } catch (err) {
            error.value = '获取数据失败'
        } finally {
            // 无论成功还是失败，都要结束加载状态
            isLoading.value = false
        }
    }

    /**
     * 启动地域分布
     */
    const startRegionAutoScroll = () => {
        // 数量小于4个就不需要滚动了
        if (regionStats.value.length <= 4) return

        isRegionScrolling.value = true
        const itemHeight = 60
        const totalHeight = regionStats.value.length * itemHeight

        const scroll = () => {
            if (!isRegionScrolling.value) return

            regionScrollOffset.value += 0.5

            if (regionScrollOffset.value >= totalHeight) {
                regionScrollOffset.value = 0
            }

            requestAnimationFrame(scroll)
        }
        requestAnimationFrame(scroll)
    }

    const stopRegionAutoScroll = () => {
        isRegionScrolling.value = false
    }

    /**
     * 启动自动刷新
     */
    const startAutoRefresh = () => {
        if (!autoRefresh) return

        refreshTimer = setInterval(() => {
            fetchRegionStats()
        }, refreshInterval)
    }

    /**
     * 停止自动刷新
     */
    const stopAutoRefresh = () => {
        if (refreshTimer) {
            clearInterval(refreshTimer)
            refreshTimer = null
        }
    }

    // 生命周期
    onMounted(async () => {
        // 获取数据
        await fetchRegionStats()
        // 启动滚动
        if (regionStats.value.length > 4) {
            startRegionAutoScroll()
        }
        // 启动刷新
        startAutoRefresh()
    })

    onUnmounted(() => {
        stopRegionAutoScroll()
        stopAutoRefresh()
    })

    return {
        regionStats,       // 地域统计数据数组
        regionScrollOffset,     // 滚动偏移量
        isRegionScrolling,      // 是否正在滚动
        isLoading,         // 加载状态
        error,          // 错误信息
        fetchRegionStats,    // 获取数据的方法
        startRegionAutoScroll, // 启动滚动的方法
        stopRegionAutoScroll,  // 停止滚动的方法
        startAutoRefresh,      // 启动自动刷新的方法
        stopAutoRefresh       // 停止自动刷新的方法
    }
}
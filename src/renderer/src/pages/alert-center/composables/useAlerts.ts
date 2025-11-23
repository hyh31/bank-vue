// 告警数据管理
import { ref, reactive } from 'vue'
import type { AlertCenterItem, AlertStats, AlertStatus } from '../types/alert-center'

/**
 * 告警数据管理
 * 数据获取  状态更新  错误处理
 */
export function useAlerts() {
    // 状态管理
    const alerts = ref<AlertCenterItem[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 获取告警列表
    const fetchAlerts = async (params?: any) => {
        try {
            loading.value = true
            error.value = null

            console.log('获取告警数据', params)

            // 模拟API调用 - 后续替换为真实API
            const mockData = await getMockAlertData(params)
            alerts.value = mockData.alerts

            console.log('告警数据获取成功', mockData.alerts.length, '条')
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取告警数据失败'
            console.error('获取告警数据失败', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * 更新告警状态
     */
    const updateAlertStatus = async (alertId: string, status: AlertStatus) => {
        try {
            console.log('更新告警状态：', alertId, status)

            const alert = alerts.value.find(a => a.id === alertId)
            if (alert) {
                alert.status = status
                alert.updateTime = new Date().toISOString()
            }

            await new Promise(resolve => setTimeout(resolve, 500))

            console.log('告警状态更新成功')
        } catch (err) {
            console.error('更新告警状态失败', err)
            throw err
        }
    }

    /**
     * 刷新数据
     */
    const refreshAlerts = (params?: any) => {
        fetchAlerts(params)
    }

    /**
     * 模拟告警数据 - 后续替换为真实API
     */
    async function getMockAlertData(params: any) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800))
    
      const mockAlerts: AlertCenterItem[] = [
        {
          id: 'alert-001',
          title: '大额交易异常告警',
          description: '检测到账户6222***1234发生大额转账，金额150万元，超过日常交易阈值',
          level: 'critical',
          type: 'business',
          status: 'pending',
          source: '风控系统',
          createTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updateTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          assignee: '张三',
          tags: ['大额交易', '风险监控'],
          metadata: {
            amount: 1500000,
            account: '6222***1234',
            targetAccount: '6228***5678'
          }
        },
        {
          id: 'alert-002',
          title: '异地登录安全告警',
          description: '用户在北京和上海同时登录，存在账户安全风险',
          level: 'warning',
          type: 'security',
          status: 'processing',
          source: '安全系统',
          createTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          updateTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          assignee: '李四',
          tags: ['异地登录', '安全风险'],
          metadata: {
            userId: 'user-123',
            locations: ['北京', '上海']
          }
        },
        {
          id: 'alert-003',
          title: '异地登录安全告警',
          description: '用户在北京和上海同时登录，存在账户安全风险',
          level: 'info',
          type: 'security',
          status: 'processing',
          source: '安全系统',
          createTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          updateTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          assignee: '李四',
          tags: ['异地登录', '安全风险'],
          metadata: {
            userId: 'user-123',
            locations: ['北京', '上海']
          }
        }
      ]
    
      // 应用筛选
      let filteredAlerts = mockAlerts
    
      if (params.keyword) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.title.includes(params.keyword) || 
          alert.description.includes(params.keyword)
        )
      }
    
      if (params.levels.length > 0) {
        filteredAlerts = filteredAlerts.filter(alert => 
          params.levels.includes(alert.level)
        )
      }
    
      if (params.statuses.length > 0) {
        filteredAlerts = filteredAlerts.filter(alert => 
          params.statuses.includes(alert.status)
        )
      }
    
      // 计算统计数据
      const stats: AlertStats = {
        total: filteredAlerts.length,
        pending: filteredAlerts.filter(a => a.status === 'pending').length,
        processing: filteredAlerts.filter(a => a.status === 'processing').length,
        resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
        critical: filteredAlerts.filter(a => a.level === 'critical').length,
        warning: filteredAlerts.filter(a => a.level === 'warning').length,
        info: filteredAlerts.filter(a => a.level === 'info').length
      }
    
      return {
        alerts: filteredAlerts,
        total: filteredAlerts.length,
        stats
      }
    }

    return {
        alerts,
        loading,
        error,
        fetchAlerts,
        updateAlertStatus,
        refreshAlerts
    }
}
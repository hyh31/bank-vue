import axios from 'axios'
import { API_BASE_URL } from '../constants'

/**
 * 获取告警列表
 */
export async function fetchAlertsHandler(_, params) {
    const { limit = 10 } = params || {}
    try {
        console.log('获取告警列表：', { limit })
        const response = await axios.get(`${API_BASE_URL}/Bank/alerts?limit=${limit}`)
        
        return {
            success: true,
            data: response.data.data || [],
            message: '告警列表获取成功',
            timestamp: new Date().toISOString()
        }
    } catch (error: any) {
        console.error('获取告警列表失败：', error)
        return {
            success: false,
            data: [],
            message: error.message || '告警列表获取失败',
            error: error.response?.data || error.message
        }
    }
}

/**
 * 创建性能告警
 */
export async function createPerformanceAlertHandler(_, params) {
    const { level, message, clientId, metrics } = params || {}
    try {
        console.log('创建性能告警：', { level, message, clientId })
        const response = await axios.post(`${API_BASE_URL}/Bank/alerts/performance`, {
            level,
            message,
            clientId,
            metrics
        })
        
        return {
            success: true,
            data: response.data.data || {},
            message: '性能告警创建成功',
            timestamp: new Date().toISOString()
        }
    } catch(error: any) {
        console.error('创建性能告警失败：', error)
        return {
            success: false,
            data: null,
            message: error.message || '性能告警创建失败',
            error: error.response?.data || error.message
        }
    }
}

/**
 * 关闭性能告警
 */
export async function closePerformanceAlertHandler(_, params) {
    const { alertId } = params || {}
    try {
        console.log('关闭性能告警：', { alertId })

        const response = await axios.put(`${API_BASE_URL}/Bank/alerts/performance/${alertId}/close`)
        
        return {
            success: true,
            data: response.data.data || {},
            message: '性能告警关闭成功',
            timestamp: new Date().toISOString()
        }
    } catch (error: any) {
        console.error('关闭性能告警失败：', error)
        return {
            success: false,
            data: null,
            message: error.message || '性能告警关闭失败',
            error: error.response?.data || error.message
        }
    }
}
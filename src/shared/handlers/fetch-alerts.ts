import axios from 'axios'
import { API_BASE_URL } from '../constants'

/**
 * 获取告警列表
 */
export async function fetchAlertsHandler(_, params) {
    const { limit = 10, status = 'pending,processing' } = params || {}
    try {
        console.log('获取告警列表：', { limit })
        const response = await axios.get(`${API_BASE_URL}/Bank/alerts?limit=${limit}&status=${status}`)
        
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
 * 获取告警分页列表
 * (告警中心)
 */
export async function fetchAlertsPageHandler(_, params) {
    try {
        // 构建查询字符串，处理数组参数
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // 数组参数：levels=critical&levels=warning
                value.forEach(item => queryParams.append(key, item))
            } else if (value !== undefined && value !== null && value !== '') {
                // 普通参数
                queryParams.append(key, String(value))
            }
        })

        const queryString = queryParams.toString()
        const url = `${API_BASE_URL}/Bank/alerts/page${queryString ? '?' + queryString : ''}`

        console.log('请求URL:', url)
        console.log('原始参数:', params)

        const resp = await axios.get(url)
        return {
            success: true,
            data: resp.data.data || resp.data,
            message: '告警分页列表获取成功',
            timestamp: new Date().toISOString()
        }
    } catch (error: any) {
        console.log('获取告警分页列表失败：', error)
        return {
            success: false,
            data: null,
            message: error.message || '告警分页列表获取失败',
            error: error.response?.data || error.message
        }
    }
}

/**
 * 获取告警详情
 */
export async function fetchAlertDetailHandler(_, alertId) {
    try {
        console.log('获取告警详情：', alertId)

        const resp = await axios.get(`${API_BASE_URL}/Bank/alerts/${alertId}`)
        return {
            success: true,
            data: resp.data.data || resp.data,
            message: '告警详情获取成功',
            timestamp: new Date().toISOString()
        }
    } catch (error: any) {
        console.log('获取告警详情失败：', error)
        return {
            success: false,
            data: null,
            message: error.message || '告警详情获取失败',
            error: error.response?.data || error.message
        }
    }
}

/**
 * 获取告警统计数据
 */
export async function fetchAlertStatisticsHandler(_) {
    try {
        console.log('获取告警统计数据')

        const resp = await axios.get(`${API_BASE_URL}/Bank/alerts/statistics`)
        return {
            success: true,
            data: resp.data.data || resp.data,
            message: '告警统计数据获取成功',
            timestamp: new Date().toISOString()
        }
    } catch(error: any) {
        console.log('获取告警统计数据失败：', error)
        return {
            success: false,
            data: null,
            message: error.message || '告警统计数据获取失败',
            error: error.response?.data || error.message
        }
    }
}

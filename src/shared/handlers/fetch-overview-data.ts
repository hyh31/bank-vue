import axios from "axios"
import { API_BASE_URL } from "../constants"

export async function fetchOverviewDataHandler(_, params) {
    const { businessType = 'all', timeRange = 'week' } = params || {}
    try {
      console.log('获取总览数据:', { businessType, timeRange })

      // 根据业务类型选择不同的API端点
      const result: any = {}

      const endpoints = {
        atm: '/Bank/atm/overview/yesterday',
        fx: '/Bank/fx/overview/yesterday',
        all: '/Bank/overview/dashboard'
      }

      // 获取ATM总览数据
      if (businessType === 'atm' || businessType === 'all') {
        try {
          const response = await axios.get(`${API_BASE_URL}${endpoints.atm}`)
          result.atm = response.data.data || response.data
        } catch(error) {
          console.warn('获取ATM总览数据失败:', error)
          result.atm = {}
        }
      }
      
      // 获取Fx总览数据
      if (businessType === 'fx' || businessType === 'all') {
        try {
          const response = await axios.get(`${API_BASE_URL}${endpoints.fx}`)
          result.fx = response.data.data || response.data
        } catch(error) {
          console.warn('获取FX总览数据失败:', error)
          result.fx = {}
        }
      }
      return {
        success: true,
        data: result,
        message: '总览数据获取成功',
        timestamp: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('获取总览数据失败:', error)
      return {
        success: false,
        data: {},
        message: error.message || '总览数据获取失败',
        error: error.response?.data || error.message
      }
    }
}
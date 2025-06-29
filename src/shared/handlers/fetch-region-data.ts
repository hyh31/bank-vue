import axios from "axios"
import { API_BASE_URL } from "../constants"

export async function fetchRegionDataHandler(_, params) {
    const { dataType = 'transaction' } = params || {}
    try {
      // 根据数据类型选择不同的API端点
      let endpoint = ''
      switch (dataType) {
        // 地域分布--交易数量
        case 'transaction':
        // 地域分布--交易金额
        case 'amount':
          endpoint = '/Bank/atm_fx/province/p_c_m/yesterday'
          break
        // 地域分布--风险指数
        case 'risk':
          endpoint = '/Bank/atm/province/risk/yesterday'
          break
        default:
          endpoint = '/Bank/atm/province/yesterday'
      }
      const response = await axios.get(`${API_BASE_URL}${endpoint}`)
      return {
        success: true,
        data: response.data.data || response.data,
        message: '数据获取成功',
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || '数据获取失败',
        error: error.response?.data || error.message
      }
    }    
}
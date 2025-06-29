import axios from 'axios'
import { API_BASE_URL } from '../constants'

export async function fetchBusinessDataHandler(_, params) {
    const { businessType = 'all' , analysisType = 'overview' } = params || {}
    try {
      console.log('获取业务类型数据:', { businessType, analysisType })

      // 根据业务类型和分析类型选择不同的API端点
      const endpoints = {
        // ATM相关接口
        atm: {
          overview: '/Bank/atm/overview/yesterday',
          province: '/Bank/atm/province/yesterday',
          amount: '/Bank/atm/amount/distribution/yesterday',
          kpi: '/Bank/atm/kpi/yesterday'
        },
        // FX相关接口
        fx: {
          overview: '/Bank/fx/overview/yesterday',
          province: '/Bank/fx/province/yesterday',
          purpose: '/Bank/fx/purpose/yesterday',
          kind: '/Bank/fx/kind/yesterday',
          age: '/Bank/fx/age/yesterday',
          kpi: '/Bank/fx/kpi/yesterday'
        }
      }

      const results: any = {}

      // 获取ATM数据
      if (businessType === 'all' || businessType === 'atm') {
        try {
          // 使用endpoints对象获取ATM数据
          // 使用并发请求
          const[
            atmOverviewResponse,
            atmProvinceResponse,
            atmAmountResponse,
            // atmKpiResponse
          ] = await Promise.allSettled([
            axios.get(`${API_BASE_URL}${endpoints.atm.overview}`),
            axios.get(`${API_BASE_URL}${endpoints.atm.province}`),
            axios.get(`${API_BASE_URL}${endpoints.atm.amount}`),
            // axios.get(`${API_BASE_URL}${endpoints.atm.kpi}`)
          ])
          
          results.atm = {
            overview: atmOverviewResponse.status ==='fulfilled' ? atmOverviewResponse.value.data.data: [],
            province: atmProvinceResponse.status ==='fulfilled' ? atmProvinceResponse.value.data.data: [],
            amount: atmAmountResponse.status ==='fulfilled' ? atmAmountResponse.value.data.data: [],
            // kpi: atmKpiResponse.data.data || atmKpiResponse.data
          }
        } catch (error) {
          console.warn('获取ATM数据失败:', error)
          results.atm = { overview: [], province: [], amount: [], kpi: [] }
        }
      }

      // 获取FX数据
      if (businessType === 'all' || businessType === 'fx') {
        try {
          // 使用并发请求
          // 使用endpoints对象获取FX数据
          // 并发请求，部分失败不影响其他
          const fxresults = await Promise.allSettled([
            axios.get(`${API_BASE_URL}${endpoints.fx.province}`),
            axios.get(`${API_BASE_URL}${endpoints.fx.purpose}`),
            axios.get(`${API_BASE_URL}${endpoints.fx.kind}`),
            axios.get(`${API_BASE_URL}${endpoints.fx.age}`)
          ])

          // 安全地提取数据
          const [provinceResult, purposeResult, kindResult, ageResult] = fxresults
          results.fx = {
            province: provinceResult.status === 'fulfilled' ? provinceResult.value.data.data : [],
            purpose: purposeResult.status === 'fulfilled' ? purposeResult.value.data.data : [],
            kind: kindResult.status === 'fulfilled' ? kindResult.value.data.data : [],
            age: ageResult.status === 'fulfilled' ? ageResult.value.data.data : []
          }
        } catch (error) {
          console.warn('获取FX数据失败:', error)
          results.fx = { province: [], purpose: [], kind: [], age: [] }
        }
      }

      return {
        success: true,
        data: results,
        message: '业务数据获取成功',
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('获取业务数据失败:', error)
      return {
        success: false,
        data: {},
        message: error.message || '业务数据获取失败',
        error: error.response?.data || error.message
      }
    }
}
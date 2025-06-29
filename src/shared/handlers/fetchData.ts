import axios from 'axios'
import { API_BASE_URL } from '../constants'

export async function fetchDataHandler() {
    try {
      const response = await axios.get(`${API_BASE_URL}/Bank/atm/province/yesterday`)
      return response.data
    } catch (error) {
      console.error('Error fetching data:', error)
      throw new Error('无法获取数据')
    }
}

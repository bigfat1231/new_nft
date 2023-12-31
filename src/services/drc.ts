import axios from './request'
import { PageResult } from '@/types'

/**
 * 获取drc列表
 */
export const queryDrcList = (params: PageResult) => {
  return axios.get('/api/v1/tick/list', {
    params,
  })
}

/**
 * 获取drc列表
 */
export const queryDrcHolders = (params: { tick: string } & PageResult) => {
  return axios.get('/api/v1/tick/holders', {
    params,
  })
}

/**
 * 查询某个地址所有的 tick 余额api
 */
export const queryDrcHolderTickAmount = (params: { address: string } & Partial<PageResult>) => {
  return axios.get('/api/v1/tick/balance', {
    params,
  })
}

/**
 * 查询 tick 信息
 */
export const queryTickInfo = (params: { tick: string }) => {
  return axios.get('/api/v1/tick', {
    params,
  })
}

/**
 * 获取菜单权限
 */
export const getMenuAuth = () => {
  return axios.get('/api/config')
}

/**
 * 查询unlist drc
 */
export const queryUnlist = (params: { len: number } & Partial<PageResult>) => {
  return axios.get('/api/v1/tick/unlist', {
    params,
  })
}

/**
 *  获取unlist drc项
 */
export const getUnlistItem = (params: { tick: string }) => {
  return axios.get('/api/v1/tick/unlist/tickname', {
    params,
  })
}

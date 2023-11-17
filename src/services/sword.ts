import { PageResult } from './../types.d'
// import { CollInfo, RequestPageParams } from '@/types'
import axios from 'axios'
import { ResultToken, TokenState } from './types'

/**
 * 获取代币池
 */
export const queryPools = () => {
  return axios.get('https://raw.githubusercontent.com/dpalwallet/conf/main/swardpool.json')
}

/**
 * 获取代币最新金额
 */
export const queryPoolState = (poolid: string) => {
  return axios.get<ResultToken<TokenState>>('https://t26o6gfqyj.execute-api.ap-northeast-1.amazonaws.com/pool-beta/api?method=pool_state', {
    params: { poolid },
  })
}

/**
 * 获取代币交易记录
 */
export const queryTransaction = (params: { blockno: number; hash: string }) => {
  return axios.get('/api/sword/queryTransaction', {
    params,
  })
}

/**
 * 查询某个交易池子的所有交易数据
 */
export const queryPoolTransactionList = (params: { pair: string } & PageResult) => {
  return axios.get('/api/sword/queryTransaction', {
    params,
  })
}

/**
 * 查询池子交易记录
 */
export const queryPoolTransfers = (params: { address?: string } & PageResult) => {
  return axios.get('https://t26o6gfqyj.execute-api.ap-northeast-1.amazonaws.com/pool-beta/api?method=pool_txs', {
    params,
  })
}

/**
 * 查询可转移的 dogim 交易api
 * @param address
 * @returns
 */
export const getTransferList = (address: string) => {
  return axios.get('https://t26o6gfqyj.execute-api.ap-northeast-1.amazonaws.com/pool-beta/api?method=get_transfer_list', {
    params: { address },
  })
}

/**
 * 查询交易状态
 * @param hash
 * @returns
 */
export const queryTransferStatus = (hash: string) => {
  return axios.get('https://t26o6gfqyj.execute-api.ap-northeast-1.amazonaws.com/pool-beta/api?method=pool_transaction', {
    params: { hash },
  })
}
/**
 * 查询地址交易状态
 * @param hash
 * @returns
 */
export const getBalanceByPoolAddress = (address: string, options = {}) => {
  return axios.get('https://py7xjcgpe9.execute-api.ap-east-1.amazonaws.com/beta/api/balance', {
    params: { address },
    ...options,
  })
}

/**
 * 查询top500
 * @returns
 */
export const queryTop500 = () => {
  return axios.get('https://t26o6gfqyj.execute-api.ap-northeast-1.amazonaws.com/pool-beta/api?method=top500')
}

/**
 * 获取代币信息
 * @returns
 */
export const getTokenInfo = () => {
  return axios.get('https://py7xjcgpe9.execute-api.ap-east-1.amazonaws.com/beta/api/drcinfo')
}

/**
 * 获取成交量
 * @returns
 */
export const getTokenTransferData = () => {
  return axios.get('https://t26o6gfqyj.execute-api.ap-northeast-1.amazonaws.com/pool-beta/api?method=tvl')
}

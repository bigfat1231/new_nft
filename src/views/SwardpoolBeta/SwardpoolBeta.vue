<script setup lang="ts">
import { getBalanceByPoolAddress, getTokenInfo, queryPools, queryPoolState, getTokenTransferData } from '@/services/sword'
import TransferTable from './components/TransferTable'
import np from 'number-precision'
import { useAppStore } from '@/store'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, Clock, Refresh } from '@element-plus/icons-vue'
import SwapDialog from './components/SwapDialog.vue'
import icons from '@/config/payIcons'
import SwapTransferList from './components/SwapTransferList.vue'
import TransferTop500 from './components/TransferTop500'
import { SwordPool, TokenState } from '@/services/types'
import VChart from 'vue-echarts'
import ECharts from 'vue-echarts'
import { TokenMarketInfo } from '@/types'
import { numberFormat } from '@/utils'

defineOptions({
  name: 'swap',
})

const appStore = useAppStore()
const { connectDpal } = appStore
const address = computed(() => appStore.address)
const transferLoadingCount = computed(() => appStore.transferLoadingCount)
const showSwapDialog = ref(false)
const pools = ref<any[]>([])
const poolid = ref('')
const currentPool = ref<Partial<SwordPool>>({})
const currentPoolState = ref<TokenState>()
const tokenInfo = ref({})
const noticeMessage = ref('')
const loading = ref(false)
const listLoading = ref(false)
const balance = ref(0)
const tabValue = ref('0')
const showTransferDialog = ref(false)
const showCtrlPoolDialog = ref(false)
const isBalanceLoading = ref(false)
const transferSelectList = [
  { label: 'Pool Transactions', value: 0 },
  { label: 'Holder', value: 1 },
]
const transferSelect = reactive({
  value: transferSelectList[0].value,
  label: transferSelectList[0].label,
})

const currentPrice = computed(() => {
  const { balanceA = 0, balanceB = 0 } = currentPoolState.value || {}
  const price = np.divide(balanceA, balanceB) || 0
  return {
    oldPrice: price,
    price: np.round(price, 6),
  }
})

const queryPoolStatusTimer = ref<number | undefined>(0)

async function queryPoolStatus(poolid: string, timer = false) {
  try {
    loading.value = true
    const res = await queryPoolState(poolid)
    const { status, data } = res.data
    if (status == 'success') {
      currentPoolState.value = data
      if (!isShowTip.value) {
        showPriceVal.value = currentPrice.value.price
        showUpdownVal.value = chartsData[chartsData.length - 1]?.custom.upordown
      }
    }
  } finally {
    loading.value = false
    if (timer) {
      queryPoolStatusTimer.value = window.setTimeout(() => {
        queryPoolStatus(poolid, true)
      }, 3000)
    }
  }
}

function connect() {
  ElMessageBox.confirm('Is it connected to the DpalWallet?', 'Connect DpalWallet', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    customClass: 'messageBox-dialog',
  }).then(async () => {
    await connectDpal()
    getBalance(address.value)
  })
}

function changePool(poolid: string) {
  if (poolid === currentPool.value.poolid) {
    return
  }
  const pool = pools.value.find((p: any) => p.poolid === poolid)
  queryPoolStatus(poolid)
  if (pool) {
    currentPool.value = pool
  }
}

function getBalance(pooladdress: string) {
  isBalanceLoading.value = true
  queryPoolStatus(poolid.value)
  getBalanceByPoolAddress(pooladdress)
    .then(async (res: any) => {
      if (res.data[0]) {
        balance.value = res.data[0].balance
      }
    })
    .finally(() => (isBalanceLoading.value = false))
}

function paySuccess() {
  getBalance(address.value)
}

const vchart = ref(ECharts)
const showUpdownVal = ref(0)
const showPriceVal = ref(0)
const isShowTip = ref(false)
const newData = new Map()
const tdCountMap = new Map()

function init() {
  queryPools().then((res) => {
    pools.value = res.data.pools
    poolid.value = pools.value[0].poolid
    currentPool.value = pools.value[0]
    noticeMessage.value = res.data.notice_message
    // 第二个参数开启实时金额
    queryPoolStatus(poolid.value, false)
  })
  if (address.value) {
    getBalance(address.value)
  }
}

getTokenInfoHandle.isLoaded = false
function getTokenInfoHandle() {
  if (getTokenInfoHandle.isLoaded) {
    transferSelect.value = 2
    return
  }
  listLoading.value = true
  getTokenInfo()
    .then((res) => {
      tokenInfo.value = res.data[0]
      getTokenInfoHandle.isLoaded = true
      transferSelect.value = 2
    })
    .finally(() => {
      listLoading.value = false
    })
}

const TransferTop500Ref = ref()
getHolderData.loaded = false
async function getHolderData() {
  if (getHolderData.loaded) {
    transferSelect.value = 1
    return
  }
  if (TransferTop500Ref.value) {
    listLoading.value = true
    TransferTop500Ref.value
      .load()
      .then((result: any) => {
        if (result.status == 'success') {
          transferSelect.value = 1
          getHolderData.loaded = true
        }
      })
      .finally(() => {
        listLoading.value = false
      })
  }
}

onActivated(() => {
  init()
})

function hideHideTipOrPointerEvent(e: Event) {
  if ((e.target as HTMLElement).tagName != 'CANVAS') {
    vchart.value.dispatchAction({
      type: 'hideTip',
    })
    vchart.value.dispatchAction({
      type: 'updateAxisPointer',
      currTrigger: 'leave',
    })
  }
}

onMounted(() => {
  document.documentElement.addEventListener('touchstart', hideHideTipOrPointerEvent)

  getTokenTransferData().then((res) => {
    const result = res.data
    if (result.status == 'success') {
      const data = result.data
      const marketData = data.market_data
      loadTransferData(marketData)
    }
  })
})

onUnmounted(() => {
  document.documentElement.removeEventListener('touchstart', hideHideTipOrPointerEvent)
})

let xLabel = []
let chartsData: any = []

function loadTransferData(marketData: TokenMarketInfo[]) {
  marketData.forEach((td) => {
    const data = tdCountMap.get(td.block_no)
    if (!tdCountMap.has(td.block_no)) {
      tdCountMap.set(td.block_no, 1)
      newData.set(`${td.block_no}_1`, td)
    } else {
      tdCountMap.set(td.block_no, data + 1)
      newData.set(`${td.block_no}_${data + 1}`, td)
    }
  })

  xLabel = Array.from(newData.keys()).reverse()
  chartsData = Array.from(newData.entries())
    .map(([block_no, d]) => {
      return {
        custom: d,
        value: [block_no, d.price],
      }
    })
    .reverse()

  showUpdownVal.value = chartsData[chartsData.length - 1].custom.upordown

  vchart.value.setOption(
    {
      title: {
        show: false,
      },
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      // dataZoom: [
      //   {
      //     id: 'dataZoomX',
      //     type: 'inside',
      //     xAxisIndex: [0],
      //     minSpan: 5,
      //     start: 90,
      //     end: 100,
      //   },
      // ],
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const opts = params[0]
          const data = opts.data.custom
          const [, price] = opts.value
          isShowTip.value = true
          showPriceVal.value = price
          showUpdownVal.value = data.upordown
          return `Ð ${price}`
        },
      },
      xAxis: {
        show: false,
        data: xLabel,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        show: false,
        type: 'value',
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          name: 'price',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: 'rgb(238,181,15)',
          },
          data: chartsData,
        },
      ],
    },
    true
  )
}

function hideTipHandle() {
  isShowTip.value = false
  showPriceVal.value = currentPrice.value.price
  if (chartsData.length > 0) {
    showUpdownVal.value = chartsData[chartsData.length - 1].custom.upordown
  }
}
</script>

<template>
  <el-row :gutter="12">
    <el-col :span="24" class="mb-3">
      <dog-card>
        <div class="flex justify-between">
          <h4 class="mt-0" style="font-size: 18px">Swordpool</h4>
          <div class="text-center">
            <el-link href="https://github.com/dpalwallet/swordpool" style="font-size: 14px; font-weight: bold" target="_blank">
              <img class="token-icon" src="/logo.png" alt="" />
              Swordpool Rule
            </el-link>
          </div>
        </div>
        <el-alert v-if="noticeMessage" title="Notice" :description="noticeMessage" type="warning" effect="dark" show-icon class="mb-3" />
        <el-row style="margin-top: 12px">
          <el-col :span="24" :md="12">
            <el-row>
              <el-col>
                <div class="selectToken">
                  <div class="flex items-center">
                    <el-dropdown class="inline-block mr-2" trigger="click" @command="changePool">
                      <el-button>
                        <img class="token-icon" v-if="currentPool.tokenA && icons[currentPool.tokenA]" :src="icons[currentPool.tokenA]" alt="" />{{ currentPool?.tokenA
                        }}<span class="split-word">/</span> <img class="token-icon" v-if="currentPool.tokenB && icons[currentPool.tokenB]" :src="icons[currentPool.tokenB]" alt="" /><span
                          v-if="address"
                          >{{ numberFormat(balance) }}&nbsp;</span
                        >{{ currentPool?.tokenB }}
                        <el-icon class="mx-2"><ArrowDown /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item v-for="item in pools" :key="item.poolid" :command="item.poolid" :disabled="!!noticeMessage || item.status != 0">
                            <img class="token-icon" v-if="icons[item.tokenA]" :src="icons[item.tokenA]" alt="" />{{ item?.tokenA }}<span class="split-word">/</span>
                            <img class="token-icon" v-if="icons[item.tokenB]" :src="icons[item.tokenB]" alt="" />{{ item?.tokenB }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <el-badge style="font-size: 0" class="mr-2" :value="transferLoadingCount" :hidden="!transferLoadingCount" v-if="address">
                      <el-icon style="color: #666; font-size: 24px; cursor: pointer" @click="showTransferDialog = true"><Clock /></el-icon>
                    </el-badge>
                  </div>
                  <template v-if="address && currentPool.pooladdress">
                    <div class="selectToken_bar">
                      <el-button :loading="isBalanceLoading" :icon="Refresh" circle @click="getBalance(address)" />
                      <!-- 生成环境需增加禁用属性 :disabled="!!noticeMessage" -->
                      <el-button type="primary" :disabled="!!noticeMessage" @click="showSwapDialog = true">Swap</el-button>
                      <el-button type="warning" :disabled="!!noticeMessage" @click="showCtrlPoolDialog = true">+ Add liquidity</el-button>
                    </div>
                  </template>
                  <div class="inline-block" style="font-size: 14px" v-else-if="currentPool.pooladdress && !address">
                    <div class="swap-pair_buy swap-pair_buy--connect size" @click="connect">Connect DpalWallet</div>
                  </div>
                </div>
              </el-col>
            </el-row>
            <!-- <el-row class="mt-2">
              <div>
                <el-badge :value="transferLoadingCount" :hidden="!transferLoadingCount" v-if="address">
                  <DogTableMenuItem class="mr-3" style="line-height: 30px; padding: 0 10px" label="History" value="1" @click="showTransferDialog = true" />
                </el-badge>
              </div>
            </el-row> -->
            <el-row class="mt-5" v-if="currentPoolState">
              <el-col :span="12" class="mb-2">
                <h4 style="font-size: 26px; margin: 0"><span style="margin-right: 6px; font-size: 30px">Ð</span>{{ np.round(showPriceVal, 6) }}</h4>
                <p class="m-0 mt-2" style="font-size: 16px; color: #777; vertical-align: middle">
                  <span style="margin-right: 4px">{{ Math.abs(np.round(showUpdownVal * 100, 2)) }}%</span>
                  <svg v-show="showUpdownVal >= 0" style="vertical-align: middle" width="18" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M573.056 272l308.8 404.608A76.8 76.8 0 0 1 820.736 800H203.232a76.8 76.8 0 0 1-61.056-123.392L450.976 272a76.8 76.8 0 0 1 122.08 0z" fill="rgb(64, 180, 105)" />
                  </svg>
                  <svg v-show="showUpdownVal < 0" style="vertical-align: middle" width="18" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M573.056 752l308.8-404.608A76.8 76.8 0 0 0 820.736 224H203.232a76.8 76.8 0 0 0-61.056 123.392l308.8 404.608a76.8 76.8 0 0 0 122.08 0z" fill="rgb(255, 90, 80)" />
                  </svg>
                </p>
              </el-col>
              <el-col :span="12" class="flex items-end mb-2">
                <el-statistic title="Processed Blocks" :value="currentPoolState?.blockno" />
              </el-col>
              <el-col :span="12" class="mb-2">
                <el-statistic :title="`Current ${currentPool?.tokenA} Balance`" :precision="5" :value="currentPoolState?.balanceA" />
              </el-col>
              <el-col :span="12" class="mb-2">
                <el-statistic :title="`Current ${currentPool?.tokenB} Balance`" :precision="5" :value="currentPoolState?.balanceB" />
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="24" :md="12">
            <v-chart ref="vchart" class="chart" autoresize @hideTip="hideTipHandle" />
          </el-col>
        </el-row>
      </dog-card>
    </el-col>
    <el-col :span="24">
      <dog-card v-loading="listLoading">
        <div style="position: absolute; z-index: 2000">
          <DogTableMenuItem label="Pool Transactions" :value="0" @click="transferSelect.value = 0" :selected="transferSelect.value == 0" />
          <!-- <DogTableMenuItem label="Query" :value="3" @click="transferSelect.value = 3" :selected="transferSelect.value == 3" /> -->
          <DogTableMenuItem label="Holder" :value="1" @click="getHolderData" :selected="transferSelect.value == 1" />
          <DogTableMenuItem label="Info" :value="2" @click="getTokenInfoHandle" :selected="transferSelect.value == 2" />
        </div>
        <div>
          <TransferTable v-show="transferSelect.value == 0" :current-pool="currentPool as SwordPool"></TransferTable>
          <TransferTop500 ref="TransferTop500Ref" v-show="transferSelect.value == 1" :current-pool="currentPool as SwordPool"></TransferTop500>
          <Info style="margin-top: 45px" v-show="transferSelect.value == 2" :token-info="tokenInfo"></Info>
          <!-- <QueryAddress v-show="transferSelect.value == 3" :current-pool="currentPool as SwordPool"></QueryAddress> -->
        </div>
      </dog-card>
    </el-col>
  </el-row>
  <SwapDialog
    v-model:visible="showSwapDialog"
    :current-pool="currentPool as SwordPool"
    :current-pool-state="currentPoolState"
    @change-pool="changePool"
    :pools="pools"
    :loading="loading"
    @pay-success="paySuccess"
  />
  <SwapTransferList v-model:visible="showTransferDialog" :current-pool="currentPool" @close="tabValue = '0'"></SwapTransferList>
  <SwapCtrlPoolDialog v-model:visible="showCtrlPoolDialog" :current-pool="currentPool"></SwapCtrlPoolDialog>
</template>
<style lang="scss" scoped>
:deep(.el-statistic__number) {
  font-size: 18px;
}

:deep(.doglink .doglink_link) {
  color: rgb(238, 181, 15);
}

.chart {
  height: 200px;
}
.selectToken {
  display: flex;
  align-items: center;
  @media screen and (max-width: 490px) {
    flex-wrap: wrap;
    & .swap-pair_buy--connect,
    & &_bar {
      margin-top: 12px;
    }
  }
}
.swordpool-info {
  margin-top: 12px;
  :deep(.dog-tabmenu) {
    margin-bottom: 12px;
  }
  :deep(.dog-card) {
    padding: 0;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}
.token-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 6px;
}
.split-word {
  padding: 0 5px;
}
section {
  line-height: 2;
  color: orange;
  span {
    color: #333;
  }
}
.swap-pair_buy {
  display: inline-block;
  text-align: center;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  border: 2px solid #fff;
  background-color: #1e90ff;
  color: #fff;
  box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.1);
  font-size: 13px;
  line-height: 1.5;
  margin-left: 6px;
  &--connect {
    background-color: rgb(238, 181, 15);
    color: #333;
    border: 1px solid #333;
  }
}
.dog-tabmenu {
  margin-bottom: 20px;
  &_item {
    display: inline-block;
    padding: 4px 10px 5px 8px;
    border-radius: 8px;
    box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.1);
    border: solid 1px #000;
    background-color: #fafafa;
    font-size: 14px;
    margin-right: 12px;
    cursor: pointer;
    &:hover {
      @extend .dog-tabmenu_item--active;
    }
    &--active {
      background-color: #ddc2f9;
    }
    &:last-child {
      margin-right: 0;
    }
    @media screen and (max-width: 430px) {
      & {
        font-size: 12px;
      }
    }
  }
}
</style>

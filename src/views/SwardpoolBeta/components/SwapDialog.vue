<script setup lang="ts">
import { ElNotification } from 'element-plus'
import { getTransferList } from '@/services/sword'
import NP from 'number-precision'
import { useAppStore } from '@/store'
import icons from '@/config/payIcons'
import { SwordPool, TokenState, TokenInfo, TokenInputName } from '@/services/types'
import { calculateOutA, calculateOutB } from '../computePrice'

type S_AB = 'SWAP_A_B'
type S_BA = 'SWAP_B_A'
type SwapType = S_AB | S_BA

const SwapTypeEnum: { [k in 'AB' | 'BA']: SwapType } = {
  AB: 'SWAP_A_B',
  BA: 'SWAP_B_A',
}

NP.enableBoundaryChecking(false)

//初始化函数
function resetPayToken(): TokenInfo {
  return {
    amount: 0,
    loading: false,
    pools: [],
    swapType: SwapTypeEnum.AB,
    price: 4,
    txid: '',
  }
}

function resetRevToken(): TokenInfo {
  return {
    amount: 0,
    loading: false,
    pools: [],
    price: 0,
    swapType: SwapTypeEnum.BA,
  }
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    currentPool: SwordPool
    currentPoolState?: TokenState
    pools: any[]
    loading: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  (event: 'update:visible', isVisible: boolean): void
  (event: 'changePool', poolid: string): void
  (event: 'paySuccess'): void
}>()

const visible = computed({
  get() {
    return props.visible
  },
  set(isVisible) {
    emit('update:visible', isVisible)
  },
})

const maxDialogWidth = 1000
const maxInputDialogWidth = 500

const appStore = useAppStore()
const { payPool, transferD20 } = useDoge()

const currentSwapType = ref<SwapType>(SwapTypeEnum.AB)
const dialogWidth = ref(maxDialogWidth)
const inputDialogWidth = ref(maxInputDialogWidth)
const showRecordDialog = ref(false)
const payToken = ref<TokenInfo>(resetPayToken())
const revToken = ref<TokenInfo>(resetRevToken())
const focusName = ref<TokenInputName>('')
const isWatchStop = ref(false)
const paying = ref(false)
const payData = ref<any>({})
const showSelectTokenDialog = ref(false)
const transferList = ref<{ amt: number; txid: string }[]>([])
const transferListLoading = ref(false)

const address = computed(() => appStore.address)
const currentBalance = computed(() => {
  const { balanceA = 1, balanceB = 1 } = props.currentPoolState || {}
  return {
    balanceA,
    balanceB,
  }
})
const isLimitAmount = computed(() => payToken.value.swapType == SwapTypeEnum.AB && +payToken.value.amount < 10)
const isSelectLimit = computed(() => !payToken.value.txid && payToken.value.swapType == SwapTypeEnum.BA)
const isDisabledPay = computed(() => isLimitAmount.value || payToken.value.amount == 0 || isSelectLimit.value)
// const transNotifier = ref<NotificationHandle>()

watch(visible, (isVisible) => {
  if (isVisible) {
    inputDialogWidth.value = Math.min(maxInputDialogWidth, window.screen.width - 20)
    revToken.value.pools = props.pools
    // transNotifier.value = ElNotification({
    //   title: 'Transaction Reminder',
    //   message: `There may be differences in the current transaction amount.`,
    //   type: 'warning',
    //   duration: 0,
    //   customClass: 'trans-notifier',
    // })
  } else {
    payToken.value = resetPayToken()
    revToken.value = resetRevToken()
    if (props.pools) {
      revToken.value.pools = props.pools
    }
    resetPoolState()
    // transNotifier.value?.close()
  }
})

watch(
  () => props.currentPoolState,
  () => {
    resetPoolState()
  }
)

watch(
  () => payToken.value.amount,
  (amount) => {
    if (isWatchStop.value) {
      return
    }

    if (currentSwapType.value == SwapTypeEnum.AB && focusName.value == 'pay') {
      calAmountB(+amount)
    }
  }
)

watch(
  () => revToken.value.amount,
  (amount) => {
    if (isWatchStop.value) {
      return
    }

    if (currentSwapType.value == SwapTypeEnum.AB && focusName.value == 'rev') {
      calAmountA(+amount)
    }
  }
)

watch(showSelectTokenDialog, async (isVisible) => {
  if (isVisible) {
    dialogWidth.value = Math.min(maxDialogWidth, window.screen.width - 20)
    try {
      transferListLoading.value = true
      const res = await getTransferList(address.value)
      const resData = res.data
      if (resData.status == 'success') {
        transferList.value = resData.data.transfer_list
      }
    } finally {
      transferListLoading.value = false
    }
  }
})

function calAmountA(amountB: number) {
  const { balanceA, balanceB } = currentBalance.value

  if (currentSwapType.value == SwapTypeEnum.AB) {
    payToken.value.amount = calculateOutA(+amountB, balanceA, balanceB, payToken.value.price)
  } else {
    revToken.value.amount = calculateOutA(+amountB, balanceA, balanceB, revToken.value.price)
  }
}

function calAmountB(amountA: number) {
  const { balanceA, balanceB } = currentBalance.value

  if (currentSwapType.value == SwapTypeEnum.AB) {
    revToken.value.amount = calculateOutB(+amountA, balanceA, balanceB, revToken.value.price)
  } else {
    payToken.value.amount = calculateOutB(+amountA, balanceA, balanceB, payToken.value.price)
  }
}

function resetPoolState() {
  isWatchStop.value = true

  if (currentSwapType.value == SwapTypeEnum.AB) {
    calAmountB(+payToken.value.amount)
  } else {
    calAmountA(+payToken.value.amount)
  }

  nextTick(() => {
    isWatchStop.value = false
  })
}

function changePool(poolid: string) {
  emit('changePool', poolid)
}

async function pay() {
  if (isLimitAmount.value) {
    return
  }

  if (!payToken.value.txid && payToken.value.swapType == SwapTypeEnum.BA) {
    return
  }

  const { swapType, amount } = payToken.value
  let txid

  try {
    if (amount) {
      paying.value = true
      if (swapType == SwapTypeEnum.AB) {
        txid = await payPool(amount, props.currentPool.pooladdress)
        payData.value = {
          txid,
          status: '0',
          swapType,
          inTokenA: payToken.value.amount,
          inTokenB: 0,
          outTokenA: 0,
          outTokenB: revToken.value.amount,
          date: dateFormat(new Date()),
        }
      } else {
        txid = await transferD20(payToken.value.txid as string, props.currentPool.pooladdress, amount, props.currentPool.tokenB)
        payData.value = {
          txid,
          status: '0',
          swapType,
          inTokenA: 0,
          inTokenB: payToken.value.amount,
          outTokenA: revToken.value.amount,
          outTokenB: 0,
          date: dateFormat(new Date()),
        }
      }
      visible.value = false
      showRecordDialog.value = true
      emit('paySuccess')
    }
  } catch {
    if (!txid && swapType == SwapTypeEnum.BA) {
      await ElNotification({
        title: 'Error',
        message: `Please select transferable utxo.`,
        type: 'error',
      })
    } else {
      await ElNotification({
        title: 'Error',
        message: 'Payment failed!',
        type: 'error',
      })
    }
  } finally {
    paying.value = false
  }
}

function change() {
  isWatchStop.value = true

  const temp = payToken.value
  payToken.value = revToken.value
  revToken.value = temp
  currentSwapType.value = currentSwapType.value == SwapTypeEnum.AB ? SwapTypeEnum.BA : SwapTypeEnum.AB

  if (currentSwapType.value == SwapTypeEnum.BA) {
    payToken.value.txid = ''
    payToken.value.amount = 0
  }

  if (revToken.value.amount == '' || payToken.value.amount == '') {
    revToken.value.amount = payToken.value.amount = 0
  }

  nextTick(() => {
    isWatchStop.value = false
  })
}

function close() {
  currentSwapType.value = SwapTypeEnum.AB
  payToken.value.amount = revToken.value.amount = 0
  payToken.value.txid = ''
}

function selectToken() {
  if (payToken.value.swapType == SwapTypeEnum.BA) {
    showSelectTokenDialog.value = true
  }
}

function setSelectToken(t: { txid: string; amt: number }) {
  focusName.value = 'pay'
  payToken.value.amount = t.amt
  payToken.value.txid = t.txid
  calAmountA(t.amt)
  showSelectTokenDialog.value = false
}
</script>

<template>
  <el-dialog class="custom-dialog" v-model="visible" :width="inputDialogWidth" @close="close" append-to-body>
    <div class="swap-container" v-loading="paying">
      <div class="swap-pair">
        <div class="swap-pair_title">
          <span class="swap-pair_tab">Swap</span>
        </div>
        <SwapInput
          name="pay"
          v-model="payToken.amount"
          :price="payToken.price"
          title="You pay"
          @focus="focusName = 'pay'"
          :currentPool="props.currentPool"
          :pools="payToken.pools"
          @change-pool="changePool"
          :min="payToken.min"
          :disabled="payToken.swapType == SwapTypeEnum.BA"
          :swap-type="payToken.swapType"
          @select-token="selectToken"
        ></SwapInput>
        <div class="swap-pair_changewrap">
          <div class="swap-pair_change" @click="change">
            <span class="nft">&#xe64f;</span>
          </div>
        </div>
        <SwapInput
          name="rev"
          v-model="revToken.amount"
          title="You expect to receive"
          @focus="focusName = 'rev'"
          :currentPool="props.currentPool"
          :pools="revToken.pools"
          :price="revToken.price"
          @change-pool="changePool"
          :min="revToken.min"
          :disabled="payToken.swapType == SwapTypeEnum.BA"
          :swap-type="revToken.swapType"
        ></SwapInput>
        <div style="color: red; margin-top: 10px; text-align: center" v-if="isLimitAmount && payToken.amount != ''">The minimum doge currency is 10.</div>
        <div style="color: red; margin-top: 10px; text-align: center" v-if="isSelectLimit">Please select transferable utxo.</div>
        <div class="swap-sub-btn" :class="{ 'swap-sub-btn--disabled': isDisabledPay }" @click="pay">Swap</div>
        <div class="flex justify-center mt-2">
          <el-link href="https://github.com/dpalwallet/swordpool" style="font-size: 12px" target="_blank">
            <img class="token-icon" src="@/assets/img/logo32.png" alt="" style="width: 16px; height: 16px; margin-top: -2px; margin-right: 5px" />
            Swordpool Rule
          </el-link>
        </div>
      </div>
    </div>
  </el-dialog>
  <SwapSelectTokenDialog v-model:visible="showSelectTokenDialog" :list="transferList" @select="setSelectToken" :loading="transferListLoading" :icon="icons.dogim"></SwapSelectTokenDialog>
  <SwapRecordsDialog v-model:visible="showRecordDialog" :currentPool="currentPool" :payData="payData"></SwapRecordsDialog>
</template>
<style lang="scss">
.trans-notifier {
  background-color: rgb(222, 99, 111);
  border: none;
  .el-notification__icon {
    display: none;
  }
  .el-notification__closeBtn {
    color: #fff;
  }
  .el-notification__title,
  .el-notification__content {
    color: #fff;
  }
}
</style>
<style lang="scss" scoped>
.swap-container {
  max-width: 500px;
  background-color: #fff;
  border-radius: 20px;
  overflow: hidden;
  padding: 50px 20px 20px;
}
.swap-pair {
  padding: 10px;
  background-color: #dadada;
  border-radius: 20px;
  &_title {
    margin: 12px 5px;
    color: #2c2c2c;
    font-weight: 600;
  }
  &_changewrap {
    display: flex;
    justify-content: center;
  }
  &_change {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    margin: 5px 0;
    border-radius: 12px;
    color: #fff;
    border: 1px solid #fff;
    background-color: #ffa21e;
    cursor: pointer;
    &--disabled {
      background-color: #aaa;
      cursor: not-allowed;
    }
  }
}
</style>

<script setup lang="ts">
import SwapInput from '@/views/Swap/components/SwapInput.vue'
import icons from '@/config/payIcons'
import { Back } from '@element-plus/icons-vue'
import { omitCenterString } from '@/utils'
import { consumeToken } from './TransferTable'

const props = withDefaults(
  defineProps<{
    visible: boolean
    currentPool: any
  }>(),
  {}
)

const emit = defineEmits<{
  (event: 'update:visible', isVisible: boolean): void
  (event: 'close'): void
}>()

const visible = computed({
  get() {
    return props.visible
  },
  set(isVisible) {
    emit('update:visible', isVisible)
  },
})

const currentPool = computed(() => props.currentPool)
const maxInputDialogWidth = 1000
const inputDialogWidth = ref(maxInputDialogWidth)
const isDoing = ref(false)
const showSelectTokenDialog = ref(false)
const token = reactive({
  amountA: 0,
  amountB: 0,
})
const transferList = ref([
  {
    swapType: 'SWAP_A_B',
    txid: 'asdsadsadasdsads',
    status: '1',
  },
])
const pageSize = 10
const page = ref(1)
const curTransferList = computed(() => transferList.value.slice((page.value - 1) * pageSize, pageSize + pageSize * (page.value - 1)))

watch(visible, async (isVisible) => {
  if (isVisible) {
    inputDialogWidth.value = Math.min(maxInputDialogWidth, window.screen.width - 20)
  } else {
    isDoing.value = false
  }
})

watch(isDoing, (isDoing) => {
  if (!isDoing) {
    Object.assign(token, {
      amountA: 0,
      amountB: 0,
    })
  }
})

async function next(num: number) {
  page.value = num
}
</script>

<template>
  <el-dialog class="custom-dialog" v-model="visible" :width="inputDialogWidth" @close="emit('close')">
    <div class="swap-pool-dialog p-5" v-if="!isDoing">
      <h2 class="m-0 pt-2">Pools</h2>
      <div class="flex justify-end">
        <DogTableMenuItem style="margin-right: 0; line-height: 30px; padding: 0 10px" label="+ New position" value="1" @click="isDoing = true" />
      </div>
      <div class="border border-solid border-gray-400 rounded-xl p-5 mt-5" style="min-height: 300px">
        <el-table :data="curTransferList">
          <el-table-column label="Swap" width="100px">
            <template #default="s">
              <SwapIconExchange :icon-a="currentPool.tokenA" :icon-b="currentPool.tokenB" v-if="s.row.swapType == 'SWAP_A_B'"></SwapIconExchange>
              <SwapIconExchange :icon-a="currentPool.tokenB" :icon-b="currentPool.tokenA" v-else-if="s.row.swapType == 'SWAP_B_A'"></SwapIconExchange>
              <span v-else-if="s.row.swapType == 'ROLLBACK_A' || s.row.swapType == 'ROLLBACK_B'">ROLLBACK</span>
              <span v-else>{{ s.row.swapType }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" align="center" label="Status">
            <template #default="s">
              <SwapStatusIcon :status="s.row.status"></SwapStatusIcon>
            </template>
          </el-table-column>
          <el-table-column prop="txid" label="Txid" width="200px">
            <template #default="s">
              <DogLink v-if="s.row.txid" is-copy :to="`https://chain.so/tx/DOGE/${s.row.txid}`" :label="omitCenterString(s.row.txid, 12)" :value="s.row.txid"></DogLink>
            </template>
          </el-table-column>
          <el-table-column label="In" width="150px">
            <template #default="s">
              {{ consumeToken(s.row.inTokenA, s.row.inTokenB, props.currentPool?.tokenA, props.currentPool?.tokenB) }}
            </template>
          </el-table-column>
          <el-table-column label="out" width="200px">
            <template #default="s">
              {{ consumeToken(s.row.outTokenA, s.row.outTokenB, props.currentPool?.tokenA, props.currentPool?.tokenB) }}
            </template>
          </el-table-column>
          <el-table-column label="Date" prop="date" width="190px"></el-table-column>
          <el-table-column label="handle" width="100px" fixed="right">
            <template #default>
              <DogTableMenuItem style="line-height: 30px; padding: 0 10px" label="undo" selected value="1" />
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 12px; display: flex; justify-content: center">
          <el-pagination :page-size="pageSize" layout="prev, pager, next" :total="transferList.length" @current-change="next" />
        </div>
      </div>
    </div>
    <div class="swap-pool-dialog p-5" v-else>
      <div class="flex items-center pt-2">
        <el-icon class="cursor-pointer p-2" @click="isDoing = false"><Back /></el-icon>
        <h2 class="m-0 ml-2">Add liquidity</h2>
      </div>
      <div class="flex justify-center">
        <div class="mt-5" style="width: 100%; max-width: 650px; padding: 10% 0">
          <SwapInput v-model="token.amountA" title="Add doge" name="pay" :price="0" swap-type="SWAP_A_B">
            <template #right>
              <div class="flex items-center py-2 px-4 rounded-3xl overflow-hidden bg-white border border-gray-400 border-solid">
                <img class="w-6 mr-2" style="border-radius: 50%" :src="icons.doge" alt="" />
                doge
              </div>
            </template>
          </SwapInput>
          <SwapInput class="mt-4" disabled v-model="token.amountB" title="Add dogim" name="pay" :price="0" swap-type="SWAP_B_A" @selectToken="showSelectTokenDialog = true">
            <template #right>
              <div class="flex items-center py-2 px-4 rounded-3xl overflow-hidden bg-white border border-gray-400 border-solid">
                <img class="w-6 mr-2" style="border-radius: 50%" :src="icons.dogim" alt="" />
                dogim
              </div>
            </template>
          </SwapInput>
          <div class="swap-sub-btn swap-sub-btn--disabled">Add</div>
        </div>
      </div>
    </div>
  </el-dialog>
  <SwapSelectTokenDialog v-model:visible="showSelectTokenDialog" :list="[]" :icon="icons.dogim"></SwapSelectTokenDialog>
</template>

<style lang="scss" scoped>
.swap-pool-dialog {
  background-color: #fff;
}
</style>

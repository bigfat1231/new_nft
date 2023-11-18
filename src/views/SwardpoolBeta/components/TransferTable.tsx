import DogTable, { ColumnProps } from '@/components/DogTable/DogTable'
import DogLink from '@/components/DogLink.vue'
import SwapIconExchange from '@/components/SwapIconExchange.vue'
import SwapStatusIcon from '@/components/SwapStatusIcon.vue'
import DogSearch from '@/components/DogSearch.vue'
import { getBalanceByPoolAddress, queryPoolTransfers } from '@/services/sword'
import { PropType } from 'vue'
import { numberFormat } from '@/utils'
import { SwordPool } from '@/services/types'
import icon from '@/config/payIcons'
import NP from 'number-precision'

export const StatusType = {
  0: 'pending',
  1: 'success',
  2: 'fail',
}

export function getSwapType(swapType: string, tokenA?: string, tokenB?: string) {
  if (swapType == 'SWAP_B_A') {
    return `Swap ${tokenB} for ${tokenA}`
  } else if (swapType == 'SWAP_A_B') {
    return `Swap ${tokenA} for ${tokenB}`
  } else if (swapType == 'ROLLBACK_A' || swapType == 'ROLLBACK_B') {
    return 'ROLLBACK'
  } else {
    return swapType
  }
}

export function consumeToken(tokenANum: number, tokenBNum: number, tokenA?: string, tokenB?: string) {
  return tokenANum > 0 ? `${numberFormat(tokenANum)} ${tokenA}` : `${numberFormat(tokenBNum)} ${tokenB}`
}

export default defineComponent({
  props: {
    currentPool: {
      type: Object as PropType<SwordPool>,
    },
  },
  setup(props) {
    const { loading, dataSource, total, page, query, disabledSlide } = useTable({
      first: false,
      api: getData,
      pageSize: 20,
    })

    const params = reactive({
      address: '',
    })

    function SwapStatusItem(text: '0' | '1' | '2') {
      return <SwapStatusIcon status={text}></SwapStatusIcon>
    }

    function SwapType(swapType: string, tokenA: string, tokenB: string) {
      if (swapType == 'SWAP_B_A') {
        return <SwapIconExchange iconA={tokenB} iconB={tokenA} />
      } else if (swapType == 'SWAP_A_B') {
        return <SwapIconExchange iconA={tokenA} iconB={tokenB} />
      } else if (swapType == 'ROLLBACK_A' || swapType == 'ROLLBACK_B') {
        return 'ROLLBACK'
      } else {
        return swapType
      }
    }

    const originColumns: ColumnProps[] = [
      {
        title: 'Block No',
        dataIndex: 'blockno',
      },
      {
        title: 'Swap',
        render(_text: any, r: any) {
          return SwapType(r.swapType, props.currentPool!.tokenA, props.currentPool!.tokenB)
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(text: '0' | '1' | '2') {
          return SwapStatusItem(text) || '-'
        },
      },
      {
        title: 'Address',
        dataIndex: 'address',
        render(text: string) {
          return <DogLink is-copy label={omitCenterString(text, 12)} value={text}></DogLink>
        },
      },
      {
        title: 'In',
        render(_text: any, r: any) {
          return consumeToken(r.inTokenA, r.inTokenB, props.currentPool?.tokenA, props.currentPool?.tokenB)
        },
      },
      {
        title: 'Out',
        render(_text: any, r: any) {
          return consumeToken(r.outTokenA, r.outTokenB, props.currentPool?.tokenA, props.currentPool?.tokenB)
        },
      },
      {
        title: 'Price',
        render(_text: any, r: any) {
          return 'Ð ' + NP.round(NP.divide(r.balanceA, r.balanceB), 4)
        },
      },
      {
        title: 'Txid',
        dataIndex: 'txid',
        render(text: string) {
          return <>{text && <DogLink is-copy to={`https://chain.so/tx/DOGE/${text}`} label={omitCenterString(text, 12)} value={text}></DogLink>}</>
        },
      },
      {
        title: 'Processed Txid',
        dataIndex: 'processedTxid',
        render(text: string) {
          return <>{text ? <DogLink is-copy to={`https://chain.so/tx/DOGE/${text}`} label={omitCenterString(text, 12)} value={text}></DogLink> : '-'}</>
        },
      },
      {
        title: 'Balance',
        dataIndex: 'balanceA',
        render(balanceA: number) {
          return `${numberFormat(balanceA)} ${props.currentPool?.tokenA}`
        },
      },
      {
        title: 'Balance',
        dataIndex: 'balanceB',
        render(balanceA: number) {
          return `${numberFormat(balanceA)} ${props.currentPool?.tokenB}`
        },
      },
      {
        title: 'Gas',
        dataIndex: 'gas',
      },
    ]

    const columns = ref(originColumns)

    watch(
      () => props.currentPool?.pooladdress,
      () => {
        query(1)
      }
    )

    async function getData(page: number, pageSize: number) {
      const res = await queryPoolTransfers({ pageSize, page, address: params.address })
      const { status, data } = res.data
      return status == 'success'
        ? {
            total: data.total,
            data: data.list,
          }
        : {
            total: 0,
            data: [],
          }
    }

    const balance = ref(0)

    const controller = ref()
    async function getBanlance() {
      controller.value?.abort()
      controller.value = new AbortController()
      const res = await getBalanceByPoolAddress(params.address, {
        signal: controller.value.signal,
      })
      const data = res.data
      if (data.length) {
        balance.value = data[0]?.balance || 0
      } else {
        balance.value = 0
      }
    }

    return () => (
      <div class="relative mt-12">
        <div class="flex absolute w-full box-border pr-10">
          <DogSearch
            class="flex-1"
            style="max-width: 300px"
            v-model={params.address}
            loading={loading.value}
            onSearch={() => {
              query(1, true)
              getBanlance()
            }}
            onClear={() => {
              params.address = ''
              balance.value = 0
              controller.value?.abort()
              query(1, true)
            }}
          ></DogSearch>
          {balance.value > 0 && (
            <div class="flex items-center ml-3 text-xs">
              <img class="mr-2" style={{ borderRadius: '50%', width: '16px' }} src={icon.dogim} alt="" />
              {numberFormat(balance.value)}
            </div>
          )}
        </div>
        <DogTable
          defaultPageSize={20}
          rowkey="id"
          loading={loading.value}
          dataSource={dataSource.value}
          columns={columns.value}
          total={total.value}
          currentPage={page.value}
          onCurrent-change={query}
          onRefresh={() => query(page.value)}
          disabledSlide={disabledSlide.value}
        />
      </div>
    )
  },
})

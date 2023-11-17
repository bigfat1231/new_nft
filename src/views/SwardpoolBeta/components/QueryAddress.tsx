import DogTable, { ColumnProps } from '@/components/DogTable/DogTable'
import DogLink from '@/components/DogLink.vue'
import DogSearch from '@/components/DogSearch.vue'
import { getBalanceByPoolAddress } from '@/services/sword'
import { PropType } from 'vue'
import { numberFormat } from '@/utils'
import { SwordPool } from '@/services/types'
import icon from '@/config/payIcons'

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

    const originColumns: ColumnProps[] = [
      {
        title: 'Address',
        dataIndex: 'address',
        render(text: string) {
          return <DogLink is-copy label={text} value={text}></DogLink>
        },
      },
      {
        title: 'Balance',
        dataIndex: 'balance',
        render(balance: number) {
          return (
            <div class="flex items-center">
              {numberFormat(balance)}
              <img class="ml-2" style={{ borderRadius: '50%', width: '24px' }} src={icon.dogim} alt="" />
            </div>
          )
        },
      },
    ]

    const columns = ref(originColumns)

    watch(
      () => props.currentPool?.pooladdress,
      () => {
        query(1)
      }
    )

    async function getData() {
      const res = await getBalanceByPoolAddress(params.address)
      const data = res.data

      if (data.length && !+data[0].balance) {
        data.shift()
      }

      return data.length
        ? {
            total: 1,
            data,
          }
        : {
            total: 0,
            data: [],
          }
    }

    return () => (
      <div class="relative mt-12">
        <DogSearch
          class="absolute"
          v-model={params.address}
          loading={loading.value}
          onSearch={() => {
            query(1, true)
          }}
          onClear={() => {
            params.address = ''
            query(1, true)
          }}
        ></DogSearch>
        <DogTable
          defaultPageSize={20}
          rowkey="id"
          loading={loading.value}
          disabledSlide={disabledSlide.value}
          dataSource={dataSource.value}
          columns={columns.value}
          total={total.value}
          currentPage={page.value}
          onCurrent-change={query}
          onRefresh={() => query(page.value)}
        />
      </div>
    )
  },
})

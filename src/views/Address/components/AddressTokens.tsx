import DogLink from '@/components/DogLink.vue'
import DogTable from '@/components/DogTable/DogTable'
import { getBalanceByPoolAddress } from '@/services/sword'
import icon from '@/config/payIcons'

export default defineComponent({
  props: {
    address: {
      type: String,
      required: true,
    },
    tabVal: {
      type: String,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    error: Function as PropType<(e: Error) => void>,
  },
  emits: ['update:isLoading'],
  setup(props, { expose, emit }) {
    const { dataSource, page, total, loading, query } = useTable({
      api: getData,
    })

    watch(loading, (isLoading) => {
      emit('update:isLoading', isLoading)
    })

    const columns = [
      {
        title: 'Address',
        dataIndex: 'address',
        render(text: string) {
          return <>{text && <DogLink route is-copy label={text} value={text}></DogLink>}</>
        },
      },
      {
        title: 'Balance',
        dataIndex: 'balance',
        render(amt: number) {
          return (
            <div class="flex items-center">
              {numberFormat(amt)}
              <img class="ml-2" style={{ borderRadius: '50%', width: '24px' }} src={icon.dogim} alt="" />
            </div>
          )
        },
      },
    ]

    async function getData() {
      try {
        const res = await getBalanceByPoolAddress(props.address)
        const data = res.data

        if (data.length && !+data[0].balance) {
          data.shift()
        }

        return {
          total: 1,
          data,
        }
      } catch (e: unknown) {
        props.error?.(e as Error)
        throw e
      }
    }

    expose({
      reload: (page.value = 1),
    })

    return () => (
      <DogTable loading={loading.value} dataSource={dataSource.value} columns={columns} currentPage={page.value} total={total.value} onCurrent-change={query} onRefresh={() => query(page.value)} />
    )
  },
})

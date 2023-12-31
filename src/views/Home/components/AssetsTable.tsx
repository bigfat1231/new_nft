import DogLink from '@/components/DogLink.vue'
import DogTable from '@/components/DogTable/DogTable'
import { ElImage } from 'element-plus'
import { queryAssetsByTxid } from '@/services/nft'

export default defineComponent({
  props: {
    txid: {
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
    const { loading, dataSource, total, page, query } = useTable({
      api: getData,
      pageSize: 15,
      first: false,
    })

    watch(loading, (isLoading) => {
      emit('update:isLoading', isLoading)
    })

    const originColumns = [
      {
        title: 'Item',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_text: unknown, r: any) => {
          return (
            <>
              {r.txid && (
                <ElImage
                  v-slots={{ error: () => <div class="el-image__error">#{r.tokenid}</div> }}
                  style="width: 40px; height: 40px; border-radius: 5px"
                  src={`${r.baseuri}/${r.txid}/${r.tokenid}.png`}
                  fit="cover"
                ></ElImage>
              )}
            </>
          )
        },
      },
      {
        title: 'Token Id',
        dataIndex: 'tokenid',
        render(text: string) {
          return text && `#${text}`
        },
      },
      {
        title: 'Address',
        dataIndex: 'address',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(text: string, r: any) {
          return <DogLink route to={`/tokens/${text}/${r.txid}`} is-copy label={text} value={text}></DogLink>
        },
      },
    ]

    const columns = ref(originColumns)
    const isLoaded = ref(false)

    async function getData(page: number, pageSize: number) {
      try {
        const res = await queryAssetsByTxid({
          txid: props.txid,
          pageSize,
          page,
        })

        const collInfo = setCollectionLogo({ txid: props.txid })

        if (!collInfo.baseuri) {
          columns.value = originColumns.filter((item) => item.title != 'Item')
        } else {
          columns.value = originColumns
        }

        return {
          total: res.data.total,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: setCollectionLogo(res.data.data.map((d: any) => Object.assign(d, { txid: props.txid }))),
        }
      } catch (e: unknown) {
        props.error?.(e as Error)
        throw e
      }
    }

    expose({
      reload: () => {
        if (page.value == 1 && !isLoaded.value) {
          query(1)
          isLoaded.value = true
        } else {
          page.value = 1
        }
      },
      setLoad(isLoad: boolean) {
        isLoaded.value = isLoad
      },
    })

    return () => (
      <DogTable
        loading={loading.value}
        dataSource={dataSource.value}
        columns={columns.value}
        currentPage={page.value}
        total={total.value}
        onCurrent-change={query}
        onRefresh={() => query(page.value)}
      />
    )
  },
})

import './DogTable.scss'

interface ColumnProps {
  dataIndex?: string
  align?: 'left' | 'right' | 'center'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (text: any, record: any, index: number) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  title?: any
  width?: string
}

export default defineComponent({
  props: {
    columns: {
      type: Array as PropType<Array<ColumnProps>>,
      required: true,
    },
    dataSource: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: Array as PropType<Array<any>>,
      default: () => [],
    },
    rowkey: {
      type: String,
      default: 'id',
    },
    layout: {
      type: String,
      default: 'prev, pager, next',
    },
    defaultPageSize: {
      type: Number,
      default: 15,
    },
    total: {
      type: Number,
      default: 15,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['current-change'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>()

    watch(
      () => props.loading,
      (loading) => {
        if (!loading) {
          resetPositionTop()
        }
      }
    )

    function resetPositionTop() {
      const resetPosition: ScrollToOptions = {
        top: 0,
        left: 0,
        behavior: 'smooth',
      }
      containerRef.value?.scrollTo(resetPosition)
      window.scrollTo(resetPosition)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function renderTbodyTd(record: any, i: number) {
      return props.columns
        .map((c) => c.dataIndex)
        .map((dataIndex, columnsIndex) => {
          const text = record[dataIndex!]
          const render = props.columns[columnsIndex].render
          return (
            <td class="dog-table-td" key={dataIndex}>
              {render ? render(text, record, i) : text}
            </td>
          )
        })
    }

    return () => {
      return (
        <div class="table-wrapper" v-loading={props.loading}>
          <div class="table-container" ref="containerRef">
            <table class="dog-table">
              <thead class="dog-table-th">
                <tr class="dog-table-tr">
                  {props.columns.map((c) => {
                    return (
                      <td class="dog-table-td" style={[{ textAlign: c.align || 'left' }, c.width! && { width: c.width }]} key={c.dataIndex}>
                        {c.title}
                      </td>
                    )
                  })}
                </tr>
              </thead>
              <tbody class="dog-table-tb">
                {props.dataSource.map((record, i) => {
                  return (
                    <tr class="dog-table-tr" key={record[props.rowkey]}>
                      {renderTbodyTd(record, i)}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <el-pagination
            currentPage={props.currentPage}
            layout={props.layout}
            defaultPageSize={props.defaultPageSize}
            total={props.total}
            onCurrentChange={($event: Event) => emit('current-change', $event)}
          />
        </div>
      )
    }
  },
})

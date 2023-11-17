import DogPagination from '../DogPagination.vue'
import { ElButton } from 'element-plus'
import s from './DogTable.module.scss'
import { Refresh } from '@element-plus/icons-vue'

export interface ColumnProps {
  dataIndex?: string
  align?: 'left' | 'right' | 'center'
  render?: (text: any, record: any, index: number) => HTMLElement | number | string | JSX.Element
  title?: any
  width?: string
}

enum ActionType {
  Refresh,
  Pagination,
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
    defaultPageSize: {
      type: Number,
      default: 15,
    },
    total: {
      type: Number,
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
    totalText: String,
    rowClick: {
      type: Boolean,
      default: false,
    },
    showPagination: {
      type: Boolean,
      default: true,
    },
    refresh: {
      type: Boolean,
      default: true,
    },
    disabledSlide: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['current-change', 'row-click', 'refresh'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>()
    const currentPage = ref(1)
    const pages = computed(() => Math.ceil(props.total / props.defaultPageSize))
    const actionType = ref(ActionType.Pagination)

    watch(
      () => props.loading,
      (loading) => {
        if (!loading && actionType.value == ActionType.Pagination && !props.disabledSlide) {
          resetPositionTop()
        }
      }
    )

    watch(
      () => props.currentPage,
      (p) => {
        currentPage.value = p
      }
    )

    watch(currentPage, (page: number) => {
      actionType.value = ActionType.Pagination
      emit('current-change', page)
    })

    function refresh() {
      actionType.value = ActionType.Refresh
      emit('refresh')
    }

    function pageChange(p: number) {
      currentPage.value = p
    }

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
            <td class={s['dog-table-td']} style={{ textAlign: props.columns[columnsIndex].align || 'left' }} key={dataIndex}>
              {render ? render(text, record, i) : text}
            </td>
          )
        })
    }

    return () => {
      return (
        <div class={s['table-wrapper']} v-loading={props.loading}>
          {props.refresh && (
            <div style="width: 100%;display: flex;justify-content: flex-end;margin-bottom:12px">
              <ElButton icon={Refresh} circle onClick={refresh}></ElButton>
            </div>
          )}
          {props.showPagination && pages.value > 1 && (
            <DogPagination style="margin-bottom: 20px" totalText={props.totalText} currentPage={currentPage.value} pages={pages.value} total={props.total} onChange={pageChange} />
          )}
          <div class={s['table-container']} ref={containerRef}>
            <table class={s['dog-table']}>
              <thead class={s['dog-table-th']}>
                <tr class={s['dog-table-tr']}>
                  {props.columns.map((c) => {
                    return (
                      <td class={s['dog-table-td']} style={[{ textAlign: c.align || 'left' }, c.width! && { width: c.width }]} key={c.dataIndex}>
                        {c.title}
                      </td>
                    )
                  })}
                </tr>
              </thead>
              <tbody class={s['dog-table-tb']}>
                {props.dataSource.map((record, i) => {
                  return (
                    <>
                      {props.rowClick ? (
                        <tr class={[s['dog-table-tr'], s['dog-table-tr_hover']]} onClick={() => emit('row-click', record)} key={record[props.rowkey]}>
                          {renderTbodyTd(record, i)}
                        </tr>
                      ) : (
                        <tr class={s['dog-table-tr']} key={record[props.rowkey]}>
                          {renderTbodyTd(record, i)}
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
            {!props.dataSource.length && <el-empty></el-empty>}
          </div>
          {props.showPagination && pages.value > 1 && (
            <DogPagination totalText={' '} style="margin-top: 20px" currentPage={currentPage.value} pages={pages.value} total={props.total} onChange={pageChange} />
          )}
        </div>
      )
    }
  },
})

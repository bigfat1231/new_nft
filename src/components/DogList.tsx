import DogPagination from './DogPagination.vue'
import s from './index.module.scss'

export default defineComponent({
  props: {
    loading: Boolean,
    dataSource: {
      type: Array,
      default: () => [],
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
    totalText: String,
  },
  setup(props, { slots, emit }) {
    const currentPage = ref(props.currentPage)
    const jumpPage = ref('')
    let prevPage = -1

    function changePage(page: number) {
      if (page == prevPage) return
      prevPage = page
      emit('current-change', page)
    }
    return () => (
      <div class={s['dog-list']} v-loading={props.loading}>
        {!!props.dataSource.length && (
          <DogPagination
            style="margin-bottom: 20px"
            totalText={props.totalText}
            v-model:currentPage={currentPage.value}
            v-model:jumpPage={jumpPage.value}
            defaultPageSize={props.defaultPageSize}
            total={props.total}
            onCurrent-change={changePage}
          />
        )}

        {slots.default?.(props.dataSource)}
        {!props.dataSource.length && <el-empty></el-empty>}
        {!!props.dataSource.length && (
          <DogPagination
            style="margin-top: 20px"
            totalText=" "
            v-model:currentPage={currentPage.value}
            v-model:jumpPage={jumpPage.value}
            defaultPageSize={props.defaultPageSize}
            total={props.total}
            onCurrent-change={changePage}
          />
        )}
      </div>
    )
  },
})

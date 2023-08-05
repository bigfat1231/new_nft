<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentPage?: number
    defaultPageSize?: number
    total?: number
    totalText?: string
  }>(),
  {
    defaultPageSize: 15,
    currentPage: 1,
    total: 0,
  }
)
const emit = defineEmits(['current-change', 'update:currentPage'])
const currentPage = computed({
  get() {
    return props.currentPage
  },
  set(page) {
    emit('update:currentPage', page)
    emit('current-change', page)
  },
})

const jumpPage = ref('')
const pages = computed(() => Math.ceil(props.total / props.defaultPageSize))

function handlerJumpPage() {
  if (!/^-?\d+$/.test(String(jumpPage.value))) {
    return
  }

  let jumpNumber = +jumpPage.value

  if (jumpNumber <= 0) {
    jumpNumber = 1
  }

  if (jumpNumber > pages.value) {
    jumpNumber = pages.value
  }

  currentPage.value = jumpNumber
  jumpPage.value = String(jumpNumber)
  nextTick(() => {
    jumpPage.value = ''
  })
}
</script>

<template>
  <div class="dog-page">
    <div class="dog-page_total">{{ props.totalText || `A total of ${props.total} data found` }}</div>
    <div class="dog-page_control">
      <div class="dog-page_control_item dog-page_control_first" @click="currentPage > 1 && (currentPage = 1)" :class="[currentPage == 1 && 'dog-page_control_item--disabled']">First</div>
      <div class="dog-page_control_item dog-page_control_prev" @click="currentPage > 1 && currentPage--" :class="[currentPage == 1 && 'dog-page_control_item--disabled']">
        <i class="dog-icon dog-icon_jiantou-left"></i>
      </div>
      <div class="dog-page_control_item dog-page_control_input-item dog-page_control_page" style="cursor: none; padding: 0 8px">
        <input v-model="jumpPage" class="dog-page_control_input" :placeholder="`Page 1 of ${pages}`" type="text" @keydown.enter="handlerJumpPage" />
      </div>
      <div class="dog-page_control_item dog-page_control_item--disabled" style="font-size: 12px">{{ currentPage }}/{{ pages }}</div>
      <div class="dog-page_control_item dog-page_control_next" @click="currentPage < pages && currentPage++" :class="[currentPage == pages && 'dog-page_control_item--disabled']">
        <i class="dog-icon dog-icon_jiantou-right"></i>
      </div>
      <div class="dog-page_control_item dog-page_control_last" @click="currentPage < pages && (currentPage = pages)" :class="[currentPage == pages && 'dog-page_control_item--disabled']">Last</div>
    </div>
  </div>
</template>

<style lang="scss">
.dog-page {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  &_total {
    font-size: 14px;
    font-weight: 500;
    line-height: 2;
  }
}
.dog-page_control {
  display: flex;
  &_input {
    width: 100%;
    line-height: 28px;
    font-size: 12px;
    border: none;
    outline: 0;
    background-color: transparent;
    padding: 0;
    &::placeholder {
      color: #a5a5a5;
    }
  }
  &_item {
    line-height: 28px;
    margin-left: 7px;
    padding: 0 8px;
    border-radius: 8px;
    box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.1);
    border: solid 1px #000;
    background-color: #fafafa;
    font-size: 14px;
    cursor: pointer;
    &:first-child {
      margin-left: 0;
    }
    &--disabled {
      box-shadow: none;
      border: solid 1px #ccc;
      background-color: #f5f5f5;
      cursor: no-drop;
    }
  }
  &_input-item {
    max-width: 120px;
    box-shadow: none;
    border: solid 1px #ccc;
    background-color: #f5f5f5;
  }
}
</style>
<script setup lang="ts">
import { getUnlistItem, queryTickInfo } from '@/services/drc'
import { CollInfoType } from '@/types'
const tables = reactive<any>({})
const isNotFount = ref(false)
const curTabValue = ref<CollInfoType>('overview')
const route = useRoute()
const loading = ref(false)
const tabs = ref([
  {
    label: 'Overview',
    value: 'overview',
  },
  {
    label: 'Holders',
    value: 'holders',
  },
  // {
  //   label: 'Transfers',
  //   value: 'transfers',
  // },
])

watch(
  () => route.params.tick,
  () => {
    updateTick()
  }
)

async function changeTab(tabVal: CollInfoType) {
  if (loading.value) return
  curTabValue.value = tabVal
  nextTick(reload)
}

function reload() {
  tables[curTabValue.value]?.reload?.()
}

const tickInfo = ref()

async function updateTick() {
  loading.value = true
  const tick = route.params.tick as string
  let res: any

  curTabValue.value = 'overview'
  tabs.value = [
    {
      label: 'Overview',
      value: 'overview',
    },
    {
      label: 'Holders',
      value: 'holders',
    },
  ]

  res = await queryTickInfo({
    tick,
  })

  if (!res.data.data.tick) {
    res = await getUnlistItem({
      tick,
    })
    tabs.value = [
      {
        label: 'Overview',
        value: 'overview',
      },
    ]
  }

  tickInfo.value = res.data.data
  loading.value = false
  isNotFount.value = !tickInfo.value.tick
  curTabValue.value = 'overview'
}

onMounted(updateTick)
</script>
<template>
  <div class="coll-wrapper" v-loading="loading">
    <DogPageHeader isBack title="DRC-20"></DogPageHeader>
    <DogTabs v-if="!isNotFount" keep-dom v-model="curTabValue" :tabs="tabs" @change="changeTab">
      <DogTabsItem value="overview">
        <DrcOverview :ref="(ref) => (tables['overview'] = ref)" :tickInfo="tickInfo"></DrcOverview>
      </DogTabsItem>
      <DogTabsItem value="holders">
        <DrcHolder :ref="(ref) => (tables['holders'] = ref)" :tickInfo="tickInfo"></DrcHolder>
      </DogTabsItem>
    </DogTabs>
    <el-empty v-else></el-empty>
  </div>
</template>

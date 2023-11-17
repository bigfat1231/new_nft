<script setup lang="ts">
import router from '@/router'

type AssetsType = 'nft' | 'token'
const route = useRoute()
const { address } = route.params as { address: string }
const { type = 'token' } = route.query as { type: AssetsType }
const curTabValue = ref<AssetsType>(type)
const loading = ref(false)
const tabs = [
  {
    label: 'X20',
    value: 'token',
  },
  {
    label: 'Nfts',
    value: 'nft',
  },
]
function changeTab(val: AssetsType) {
  if (loading.value) return
  curTabValue.value = val
  router.replace({ name: 'address', query: { type: val } })
}
</script>
<template>
  <DogPageHeader isBack :title="address"></DogPageHeader>
  <DogTabs v-model="curTabValue" :tabs="tabs" @change="changeTab">
    <DogTabsItem value="nft" key="nft">
      <AddressNfts :address="address" v-model:isLoading="loading"></AddressNfts>
    </DogTabsItem>
    <DogTabsItem value="token" key="nft">
      <AddressTokens :address="address"></AddressTokens>
    </DogTabsItem>
  </DogTabs>
</template>

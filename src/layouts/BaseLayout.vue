<script setup lang="ts">
import { collMap } from '@/services/nft'
import { useAppStore } from '@/store'

type ViewNames = 'home' | 'drc20' | 'swordpool'

const isShow = ref(false)
const route = useRoute()
const { getSwordPools } = useAppStore()

function loadCollMap() {
  return new Promise((resolve) => {
    let timer = 0
    async function req() {
      try {
        const res = await collMap()
        localStorage.setItem('nfts', JSON.stringify(res.data))
        clearTimeout(timer)
        resolve(undefined)
      } catch {
        timer = window.setTimeout(req, 1000)
      }
    }
    req()
  })
}

const viewReqStateList = {
  home: loadCollMap,
  drc20: getSwordPools,
  swordpool: getSwordPools,
}

const viewLoadedSet = new Set<ViewNames>()

async function requestState() {
  const viewName = route.name as ViewNames

  if (!viewReqStateList[viewName] || viewLoadedSet.has(viewName)) {
    isShow.value = true
    return
  }

  isShow.value = false
  await viewReqStateList[viewName]()
  isShow.value = true
  viewLoadedSet.add(viewName)
}

watch(() => route.name, requestState, {
  immediate: true,
})
</script>
<template>
  <DogNav></DogNav>
  <main class="content" v-loading="!isShow">
    <router-view v-slot="{ Component }" v-if="isShow">
      <keep-alive :include="['home', 'swap', 'drc20']">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
  <footer id="footer">
    <ul class="link-list">
      <li class="link-list_item">
        <a href="https://twitter.com/dogexprotocal" target="_blank" class="nft link-list_item_a">&#xe652;</a>
      </li>
      <li class="link-list_item">
        <a href="https://github.com/dogexme" target="_blank" class="nft link-list_item_a">&#xe691;</a>
      </li>
      <!-- <li class="link-list_item">
          <a href="https://discord.com/dpalwallet" target="_blank" class="nft link-list_item_a">&#xebf8;</a>
        </li> -->
      <li class="link-list_item">
        <a href="https://t.me/dpalwallet" target="_blank" class="nft link-list_item_a">&#xec25;</a>
      </li>
    </ul>
    <span class="text-xs mt-2">Copyright©2023 dogex.me</span>
  </footer>
</template>
<style lang="scss">
.content {
  width: 100%;
  max-width: 1280px;
  min-height: 72.5vh;
  box-sizing: border-box;
  padding: 12px 12px 0;
  margin: 0 auto;
  overflow: hidden;
}
#footer {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 80px;
  border-top: 1px solid #dedede;
  justify-content: center;
  align-items: center;
  margin-top: 5.55vmin;
}
.link-list {
  &_item {
    display: inline-block;
    margin: 0 12px;
    &_a {
      font-size: 14px !important;
      color: #333 !important;
    }
  }
}
</style>

<script setup lang="ts">
import { omitCenterString } from '@/utils'
import { EpPropMergeType } from 'element-plus/lib/utils/index.js'
import { useAppStore } from '@/store'
import { ElMenuItem, ElMessageBox, ElSubMenu } from 'element-plus'

type DrawerDirection = EpPropMergeType<StringConstructor, 'ltr' | 'rtl' | 'ttb' | 'btt', unknown>

const appStore = useAppStore()
const router = useRouter()
const isShowDrawer = ref(false)
const activePath = computed(() => appStore.activeRoutePath)
const navlist = computed(() => appStore.menus)
const drawerDirection = ref<DrawerDirection>('ltr')
const { connectDpal } = appStore
const address = computed(() => appStore.address)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function selectItem() {
  isShowDrawer.value = false
}

function connect() {
  ElMessageBox.confirm('Is it connected to the DpalWallet?', 'Connect DpalWallet', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    customClass: 'messageBox-dialog',
  }).then(() => {
    connectDpal()
      .then((userAddress) => {
        if (userAddress) {
          router.push(`/address/${userAddress}`)
        }
      })
      .finally(() => {
        isShowDrawer.value = false
      })
  })
}

function triggerDrawer(direction: DrawerDirection) {
  isShowDrawer.value = !isShowDrawer.value
  drawerDirection.value = direction
}
</script>

<template>
  <div class="nav-place">
    <nav class="nav">
      <div class="nav-wrap">
        <div class="logo-wrap">
          <a class="nav-more" href="javascript:void(0)" @click="triggerDrawer('ltr')">&#xe66c;</a>
          <span class="nav-logo" @click="router.replace('/')"></span>
          <!-- <a href="/" class="nav-title">dogex.me</a> -->
        </div>
        <el-menu class="nav-menu" @select="selectItem" router :default-active="activePath" mode="horizontal" background-color="#fff" text-color="#333" active-text-color="#333">
          <component v-for="n in navlist" :is="n.children ? ElSubMenu : ElMenuItem" :index="n.path" :key="n.title">
            <template v-if="n.children" #title>{{ n.title }}</template>
            <template v-if="n.children">
              <ElMenuItem v-for="c in n.children" :index="c.path" :key="c.title">{{ c.title }}</ElMenuItem>
            </template>
            <template v-else>
              {{ n.title }}
            </template>
          </component>
        </el-menu>
        <ul class="nav-active">
          <li class="nav-active-item nav-active-item--weblink" v-if="!address">
            <a href="javascript:void(0)" @click="connect">Connect DpalWallet</a>
          </li>
          <li style="margin-left: 12px" v-else>
            <el-tooltip popper-class="nav-popper" :hide-after="0" effect="dark" content="Click to assets" placement="bottom">
              <router-link :to="`/address/${address}?type=token`" style="display: flex; align-items: center"
                >{{ omitCenterString(address) }} <el-avatar style="margin-left: 12px" :size="24" :src="require('@/assets/img/dogim_logo.png')" /></router-link
              >''
            </el-tooltip>
          </li>
        </ul>
        <a class="nav-active-more" @click="triggerDrawer('rtl')" href="javascript:void(0)">&#xeb10;</a>
      </div>
    </nav>
    <el-drawer append-to-body :show-close="false" :with-header="false" size="70%" v-model="isShowDrawer" :direction="drawerDirection" modal-class="nav-drawer">
      <el-menu v-if="drawerDirection == 'ltr'" route @select="selectItem" router :default-active="activePath" background-color="#fff" text-color="#333" active-text-color="#333" mode="vertical">
        <component v-for="n in navlist" :is="n.children ? ElSubMenu : ElMenuItem" :index="n.path" :key="n.title">
          <template v-if="n.children" #title>{{ n.title }}</template>
          <template v-if="n.children">
            <ElMenuItem v-for="c in n.children" :index="c.path" :key="c.title">{{ c.title }}</ElMenuItem>
          </template>
          <template v-else>
            {{ n.title }}
          </template>
        </component>
      </el-menu>
      <el-menu v-else router :default-active="activePath" background-color="#fff" text-color="#333" active-text-color="#333" mode="vertical" @select="selectItem">
        <el-menu-item v-if="address" index="/address" :route="{ name: 'address', params: { address }, query: { type: 'token' } }">
          {{ omitCenterString(address) }} <el-avatar style="margin-left: 12px" :size="24" :src="require('@/assets/img/dogim_logo.png')" />
        </el-menu-item>
        <el-menu-item v-else @click="connect"> Connect DpalWallet </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<style>
.nav-drawer {
  z-index: 2010 !important;
}
</style>

<style lang="scss" scoped>
.nav-menu {
  --activeColor: rgb(255, 194, 0);
  :deep(.el-menu-item) {
    font-size: 13px;
    font-family: SistemnyjC;
    &:hover {
      background-color: transparent;
    }
    &:focus {
      background-color: transparent;
    }
  }
  :deep(.is-active) {
    color: var(--activeColor) !important;
    border-color: var(--activeColor) !important;
    transition: none;
  }
}

.el-menu--horizontal {
  --el-menu-item-height: 31px;
  margin-left: 15px;
  border: none;
  flex: 1;
  height: auto;
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2007;
  width: 100vw;
  background-color: #fff;
  box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.1);
}
.nav-logo {
  display: inline-block;
  background: url('@/assets/img/navfont.png') no-repeat;
  background-size: 100%;
  width: 120px;
  height: 24px;
  cursor: pointer;
}
#show-search-bar {
  display: none;
}
.nav-place {
  height: 58px;
}
.nav-more {
  font-family: nft;
  font-size: 28px;
  display: none;
  @media screen and (max-width: 876px) {
    display: block;
  }
}
.nav-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px;
}
.nav-search {
  width: 500px;
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  order: 1;
  .nav-search-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14px;
  }
}
.nav-search-icon {
  display: none;
}
.nav-active {
  display: flex;
  align-items: center;
  order: 2;
}
.nav-active-item {
  position: relative;
  display: inline-block;
  border-radius: 20px;
  border: 1px solid #333;
  margin: 0 3px;
  overflow: hidden;
  box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.1);
  a {
    display: block;
    padding: 4px 12px;
  }
  &--weblink {
    background-color: currentColor;
    color: rgb(255, 194, 0);
    :hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}

.nav-active-more {
  font-family: nft;
  display: none;
  font-size: 26px;
}
.logo-wrap {
  display: flex;
  align-items: center;
  order: 0;
}

.nav-title {
  font-family: SistemnyjC;
  margin-left: 12px;
  font-weight: bold;
  font-size: 18px;
}

@media screen and (max-width: 876px) {
  .nav-menu {
    display: none;
  }
  .nav-active {
    display: none;
  }
  .nav-active + .nav-active-more {
    display: block;
  }
  .nav-logo {
    margin-left: 12px;
  }
}

@media screen and (max-width: 1280px) {
  .nav-wrap {
    flex-wrap: wrap;
    overflow: hidden;
  }
  #show-search-bar:checked ~ .nav-search-wrap {
    height: 35px;
  }
  .nav-search {
    width: unset;
  }
  .nav-search-wrap {
    order: 3;
    flex-basis: 100%;
    height: 0;
    transition: height 0.2s;
    overflow: hidden;
  }
  .nav-search-icon {
    display: block;
    order: 1;
    margin-left: auto;
  }
}
</style>

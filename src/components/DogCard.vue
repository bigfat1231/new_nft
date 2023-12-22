<script setup lang="ts">
const props = defineProps<{
  title?: string
  isBack?: boolean
}>()
</script>
<template>
  <div class="dog-card">
    <DogPageHeader v-if="props.title" :isBack="props.isBack" :title="props.title"></DogPageHeader>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.dog-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: inset 0 -5px 0 0 rgba(0, 0, 0, 0.1);
  border: 1px solid $layout-border-color;
  background-color: #fff;
  @media screen and (max-width: 786px) {
    & {
      padding: 12px;
    }
  }
}
</style>

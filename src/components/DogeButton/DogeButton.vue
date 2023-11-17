<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'default' | 'wran' | 'primary' | 'success' | 'info'
    disabled?: boolean
  }>(),
  {
    type: 'default',
  }
)

const emit = defineEmits<{
  (event: 'click'): void
}>()
</script>

<template>
  <div class="doge-button" :class="[`doge-button--${props.type}`]" @click="emit('click')">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.doge-button {
  display: inline-block;
  padding: 4px 10px 5px 8px;
  border-radius: 8px;
  box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.1);
  border: solid 1px #000;
  background-color: #fafafa;
  font-size: 14px;
  margin-left: 12px;
  cursor: pointer;
  transition: all 0.1s;
  &--default:hover {
    background-color: #ddc2f9;
  }
  &--wran {
    background-color: orange;
    color: #fff;
    &:hover {
      background-color: rgb(255, 181, 44);
    }
  }
}
</style>

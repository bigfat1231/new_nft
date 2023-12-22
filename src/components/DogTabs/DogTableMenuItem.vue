<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    selected?: boolean
  }>(),
  {
    selected: false,
  }
)

const emit = defineEmits<{
  (event: 'click'): void
}>()
</script>

<template>
  <div :class="['dog-tabmenu_item', props.selected && 'dog-tabmenu_item--active']" @click="emit('click')">
    {{ props.label }}
  </div>
</template>

<style lang="scss">
.dog-tabmenu {
  margin-bottom: 20px;
  &_item {
    display: inline-block;
    padding: 4px 10px 5px 8px;
    border-radius: 8px;
    box-shadow: inset 0 -4px 0 0 rgba(0, 0, 0, 0.1);
    border: solid 1px $btn-border-color;
    background-color: #fafafa;
    font-size: 14px;
    margin-right: 12px;
    cursor: pointer;
    &:hover {
      @extend .dog-tabmenu_item--active;
    }
    &--active {
      background-color: #ddc2f9;
    }
    &:last-child {
      margin-right: 0;
    }
    @media screen and (max-width: 430px) {
      & {
        font-size: 12px;
      }
    }
  }
}
</style>

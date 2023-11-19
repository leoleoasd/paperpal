<template>
  <div class="holder">
    <n-card
      :title="prop.title"
      :style="{
        '--width': prop.width ?? 480 + 'px'
      }"
    >
      <slot></slot>
    </n-card>
  </div>
</template>

<script setup lang="tsx">
const prop = defineProps<{
  title: string;
  width?: number | undefined;
}>();
</script>

<style scoped lang="scss">
.holder {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    .n-card {
        width: var(--width);
    }
}
</style>

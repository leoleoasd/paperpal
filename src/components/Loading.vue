<template>
  <n-spin :show="loadingDebounced">
    <template #description>
      <slot name="description">
      </slot>
    </template>
    <slot v-if="hasData">
    </slot>
    <slot
      v-else
      name="loading"
    >
      <n-skeleton
        v-if="!hasData"
        text
        :repeat="20"
      ></n-skeleton>
    </slot>
  </n-spin>
</template>

<script lang="ts" setup>
import { useDebounce } from '@vueuse/core';
import { toRef } from 'vue';

const props = withDefaults(defineProps<{
  loading: boolean;
  hasData: boolean;
  debounceMs?: number;
}>(), {
  debounceMs: 0,
});
const loadingDebounced = useDebounce<boolean>(toRef(props, 'loading'), props.debounceMs);
</script>

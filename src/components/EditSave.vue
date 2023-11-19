<script setup lang="ts">
import {ref, watch, onMounted} from 'vue';
import EditFilled from '@vicons/material/EditFilled';
import CheckFilled from '@vicons/material/CheckFilled';
import type { Component } from 'vue';
import type { NInput } from 'naive-ui';
const props = defineProps<{
  value: string,
  focus?: () => void,
}>();
const value = ref(props.value);
const emit = defineEmits<{
  'update:value': [value: string],
  'save': [value: string, callback: () => void],
//   (e: 'update:value', value: string): void
//   (e: 'save', value: string): void
}>();
const editing = ref(false);
const loading = ref(false);
watch(value, (value) => {
  emit('update:value', value);
});
const save = async () => {
  loading.value = true;
  editing.value = false;
  // await props.callback(value.value);
  emit('save', value.value, () => {
    loading.value = false;
  });
};
const inputEl = ref<InstanceType<typeof NInput> | null>();
</script>
<template>
  <n-input-group>
    <slot
      :value="value"
      :readonly="!editing"
      :save="save"
      :set-value="(v: string) => {value=v}"
    >
      <n-input
        ref="inputEl"
        v-model:value="value"
        :readonly="!editing"
        @keyup.enter="save"
      ></n-input>
    </slot>
    <n-button
      v-if="!editing"
      :loading="loading"
      @click="editing=true; (focus ?? inputEl!.focus)();"
    >
      <template #icon>
        <n-icon>
          <EditFilled></EditFilled>
        </n-icon>
      </template>
    </n-button>
    <n-button
      v-if="editing"
      :loading="loading"
      @click="save"
    >
      <template #icon>
        <n-icon>
          <CheckFilled></CheckFilled>
        </n-icon>
      </template>
    </n-button>
  </n-input-group>
</template>
<style lang="scss">
.n-input-group {
    align-items: stretch;
    .n-button {
        height: auto;
    }
}
</style>

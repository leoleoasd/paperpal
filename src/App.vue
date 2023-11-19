<script setup lang="ts">
import { RouterView } from 'vue-router';
import { darkTheme } from 'naive-ui';
import {ref, computed} from 'vue';
import Header from '@/components/Header.vue';

import { useColorMode } from '@vueuse/core';

const mode = useColorMode();
const theme = computed(() => ({
  dark: darkTheme,
  light: null,
  auto: null,
}[mode.value]));
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <n-dialog-provider>
        <Header></Header>
        <RouterView></RouterView>
        <n-global-style></n-global-style>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.n-config-provider {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
}
</style>

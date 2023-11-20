<script setup lang="tsx">
import { useColorMode, useCycleList } from '@vueuse/core';
import { MoonRegular, SunRegular } from '@vicons/fa';
import { SettingsSuggestOutlined } from '@vicons/material';
import { computed } from 'vue';

import { useDialog, useMessage } from 'naive-ui';
window.$dialog = useDialog();
window.$message = useMessage();
const mode = useColorMode({
  emitAuto: true,
});

const { state, next } = useCycleList(['dark', 'light', 'auto'], { initialValue: mode });
const stateText = computed(() => ({
  'light': 'Light',
  'dark': 'Dark',
  'auto': 'Auto'
}[state.value]));

</script>

<template>
  <header>
    <div class="container header">
      <a
        class="title"
        href="#"
        style="color: inherit; text-decoration: none;"
        @click="$event.preventDefault(); $router.push('/')"
      >
        PaperPal
      </a>
      <div class="space"></div>
      <!-- <n-divider
        vertical
        style="height: 36px"
      ></n-divider> -->
      <div class="row actions">
        <n-button
          quaternary
          @click="next()"
        >
          <template #icon>
            <n-icon
              v-if="state === 'dark'"
            >
              <MoonRegular></MoonRegular>
            </n-icon>
            <n-icon
              v-else-if="state === 'light'"
            >
              <SunRegular></SunRegular>
            </n-icon>
            <n-icon
              v-else-if="state === 'auto'"
            >
              <SettingsSuggestOutlined></SettingsSuggestOutlined>
            </n-icon>
          </template>
          {{ stateText }}
        </n-button>
        <!-- <n-button
          v-if="auth.logged"
          @click="auth.logout()"
        >
          登出
        </n-button>
        <n-button
          v-else
          @click="router.push({ name: 'login'})"
        >
          登录
        </n-button> -->
      </div>
    </div>
  </header>
</template>


<style lang="scss">
.header {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-content: center;
  justify-content: flex-start;
  align-items: center;

  .title {
    margin-left: 25px;
    font-size: 25px;
  }

  .space {
    flex: 1;
  }

  :deep(.n-menu) {
    flex: auto 0 0;
    height: 60px;
    .n-menu-item {
      height: 60px
    }
  }
  height: 60px;
}

header {
  display: flex;
  justify-content: center;
  border-bottom: 1px #e7e7e7 solid;
  margin-bottom: 20px;
}

</style>

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import './assets/main.scss';
import 'vfonts/Lato.css?inline';
import 'vfonts/FiraCode.css?inline';
import type { useDialog, useMessage } from 'naive-ui';

declare global {
  interface Window { $dialog: ReturnType<typeof useDialog>; $message: ReturnType<typeof useMessage>; }
}

const app = createApp(App);

app.use(createPinia());
app.use(router);
// app.use(naive);

app.mount('#app');

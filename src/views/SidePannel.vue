<script setup lang="ts">
import json_papers from './papers.json';
import lodash from 'lodash';
import {Hsluv} from 'hsluv';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
import router from '@/router';
const back = () => {
  console.log('back');
  router.push({ name: 'home' });
};
</script>
<template>
  <div class="outer">
    <div
      class="sidedrawer"
    >
      123 {{ route.params.paperId }}
    </div>
    <div
      class="mask"
      @click="back"
    >
    </div>
  </div>
</template>
<style scoped lang="scss">
.sidedrawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 300px;
    background-color: #fff;
    box-shadow: 1px 0px 7px rgba(0, 0, 0, 0.5);
    z-index: 200;
}
.mask {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 100;
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
<style lang="scss">
.slide-right-enter-active {
    .sidedrawer {
        animation: slide-right-in 0.5s cubic-bezier(.21,.79,.37,.85);
    }
    .mask {
        animation: fade-in 0.5s cubic-bezier(.21,.79,.37,.85);
    }
}
.slide-right-leave-active {
    .sidedrawer {
        animation: slide-right-out 0.5s cubic-bezier(.21,.79,.37,.85);
    }
    .mask {
        animation: fade-out 0.5s cubic-bezier(.21,.79,.37,.85);
    }
}
@keyframes slide-right-in {
    0% {
        transform: translateX(100%);
    }
    100% {
        transform: translateX(0);
    }
}
@keyframes slide-right-out {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(100%);
    }
}
@keyframes fade-in {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
@keyframes fade-out {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }

}
</style>
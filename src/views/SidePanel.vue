<script setup lang="ts">
import json_papers from './papers.json';
import lodash, { toInteger } from 'lodash';
import {Hsluv} from 'hsluv';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
import router from '@/router';
const back = () => {
  console.log('back');
  router.push({ name: 'home' });
};
const paper = ref(JSON.parse(JSON.stringify(json_papers[toInteger(route.params.paperId)])));
const all_tags = [
  'nlp', 'hci', 'to_read', 'interesting', 'arxiv',
];
const hueStep = 30;
const hueValues = lodash.range(0, 360, hueStep);

let hueDictionary: { [key: string]: number } = {};

all_tags.forEach((tag, index) => {
  hueDictionary[tag] = hueValues[index];
});
paper.value.tags = lodash.sampleSize(all_tags, 3).map(tag => {
  const conv = new Hsluv();
  conv.hsluv_h = hueDictionary[tag];
  conv.hsluv_s = 100;
  conv.hsluv_l = 95;
  conv.hsluvToHex();

  const convBorderColor = new Hsluv();
  convBorderColor.hsluv_h = hueDictionary[tag];
  convBorderColor.hsluv_s = 100;
  convBorderColor.hsluv_l = 70;
  convBorderColor.hsluvToHex();

  const convTextColor = new Hsluv();
  convTextColor.hsluv_h = hueDictionary[tag];
  convTextColor.hsluv_s = 100;
  convTextColor.hsluv_l = 35;
  convTextColor.hsluvToHex();

  return {
    name: tag,
    color: {
      color: conv.hex,
      borderColor: convBorderColor.hex,
      textColor: convTextColor.hex,
    }
  };
});
paper.value.authors = paper.value.author.split(' and ').map((author: string) => {
  return {
    name: author,
    smart: false,
  };
});
paper.value.authors[0].smart = true;
paper.value.authors[paper.value.authors.length - 1].smart = true;
paper.value.abstract_tldr = paper.value.abstract.split('.')[0];
paper.value.abstract_longer = paper.value.abstract + paper.value.abstract;
// Tag related parts
const tagInputRef = ref(null);

const removeTag = (tagName: string) => {
  paper.value.tags = paper.value.tags.filter((tag: { name: string; }) => tag.name !== tagName);
};

const addTag = () => {
  if (paper.value.new_tag) {
    if (paper.value.tags.map((tag: { name: string; }) => tag.name).includes(paper.value.new_tag)) {
      paper.value.adding_tag = false;
      paper.value.new_tag = '';
    } else {
      // if not present, assign new hue
      if (!hueDictionary[paper.value.new_tag]) {
        hueDictionary[paper.value.new_tag] = hueValues[Object.keys(hueDictionary).length];
      }
      const tag = paper.value.new_tag;
      const conv = new Hsluv();
      conv.hsluv_h = hueDictionary[tag];
      conv.hsluv_s = 100;
      conv.hsluv_l = 95;
      conv.hsluvToHex();

      const convBorderColor = new Hsluv();
      convBorderColor.hsluv_h = hueDictionary[tag];
      convBorderColor.hsluv_s = 100;
      convBorderColor.hsluv_l = 70;
      convBorderColor.hsluvToHex();

      const convTextColor = new Hsluv();
      convTextColor.hsluv_h = hueDictionary[tag];
      convTextColor.hsluv_s = 100;
      convTextColor.hsluv_l = 35;
      convTextColor.hsluvToHex();

      paper.value.tags.push({
        name: tag,
        color: {
          color: conv.hex,
          borderColor: convBorderColor.hex,
          textColor: convTextColor.hex,
        }
      });

      paper.value.adding_tag = false;
      paper.value.new_tag = '';
    }
  }
};

const options = computed(() => {
  let ret = all_tags.map(t => ({ value: t, label: t }));
  if (paper.value.new_tag) {
    ret = ret.filter(t => t.value.startsWith(paper.value.new_tag));
  }
  ret.push({ value: paper.value.new_tag, label: paper.value.new_tag });
  return ret;
});
</script>
<template>
  <div class="outer">
    <div
      class="sidedrawer"
    >
      <div class="paper-editor">
        <label>Title: </label>
        <div class="paper-title">
          <n-input
            v-model:value="paper.title"
            placeholder="Title"
          ></n-input>
        </div>
        <label>Abstract: </label>
        <n-tabs class="paper-abstract">
          <n-tab-pane
            name="tldr"
            tab="TL;DR"
          >
            <div>
              <n-input
                v-model:value="paper.abstract_tldr"
                type="textarea"
                placeholder="TL;DR Abstract"
                :rows="10"
              ></n-input>
            </div>
          </n-tab-pane>
          <n-tab-pane
            name="original"
            tab="Original"
          >
            <div>
              <n-input
                v-model:value="paper.abstract"
                type="textarea"
                placeholder="Original Abstract"
                :rows="10"
              ></n-input>
            </div>
          </n-tab-pane>
          <n-tab-pane
            name="longer"
            tab="Longer"
          >
            <div>
              <n-input
                v-model:value="paper.abstract_longer"
                type="textarea"
                placeholder="Longer Abstract"
                :rows="10"
              ></n-input>
            </div>
          </n-tab-pane>
        </n-tabs>
        <label>Tags: </label>
        <div class="paper-tags">
          <n-tag
            v-for="tag in paper.tags"
            :key="tag.name"
            :type="'default'"
            :color="tag.color"
            size="small"
            closable
            @close="removeTag(tag.name)"
          >
            {{ tag.name }}
          </n-tag>
          <n-tag
            v-if="!paper.adding_tag"
            size="small"
            @click.stop="paper.adding_tag=true; $nextTick(() => tagInputRef!.focus())"
          >
            +
          </n-tag>
          <n-auto-complete
            v-if="paper.adding_tag"
            ref="tagInputRef"
            v-model:value="paper.new_tag"
            :options="options"
            :input-props="{
              autocomplete: 'disabled'
            }"
            size="small"
            style="width: 300px;"
            placeholder="Press enter to add tag"
            @blur="paper.adding_tag=false"
            @keydown.enter="addTag()"
          ></n-auto-complete>
        </div>
        <label>Authors: </label>
        <div class="paper-authors">
          <n-input-group
            v-for="(author, index) in paper.authors"
            :key="index"
            class="author"
          >
            <n-input v-model:value="author.name"></n-input>
            <n-button
              type="error"
              @click="paper.authors.splice(index, 1)"
            >
              Delete
            </n-button>
            <n-button @click="author.smart = !author.smart">
              <template #icon>
                <n-icon v-if="author.smart">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 12 12"
                  ><g fill="none"><path
                    d="M8.052 1.436a1.5 1.5 0 0 0-2.38.347L4.145 4.608l-2.33.928a.5.5 0 0 0-.169.818l1.647 1.647l-2.146 2.146l-.147.854l.854-.147L4 8.708l1.646 1.646a.5.5 0 0 0 .818-.168l.933-2.332l2.821-1.526a1.5 1.5 0 0 0 .347-2.38L8.052 1.436z"
                    fill="currentColor"
                  /></g></svg>
                </n-icon>
                <n-icon v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 12 12"
                  ><g fill="none"><path
                    d="M8.052 1.436a1.5 1.5 0 0 0-2.38.347L4.145 4.608l-2.33.928a.5.5 0 0 0-.169.818l1.647 1.647l-2.146 2.146l-.147.854l.854-.147L4 8.708l1.646 1.646a.5.5 0 0 0 .818-.168l.933-2.332l2.821-1.526a1.5 1.5 0 0 0 .347-2.38L8.052 1.436zm-1.5.822a.5.5 0 0 1 .793-.115l2.513 2.513a.5.5 0 0 1-.116.793L6.762 7.06a.5.5 0 0 0-.226.254L5.817 9.11L2.891 6.184l1.793-.715a.5.5 0 0 0 .254-.226l1.614-2.985z"
                    fill="currentColor"
                  /></g></svg>
                </n-icon>
              </template>
            </n-button>
          </n-input-group>
          <n-button @click="paper.authors.push({ name: '', smarts: false })">
            Add Author
          </n-button>
        </div>
      </div>
    </div>
    <div
      class="mask"
      @click="back"
    >
    </div>
  </div>
</template>
<style scoped lang="scss">

.paper-editor {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    .paper-authors {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
    }

    .paper-title {
        display: flex;
        flex-direction: column;
    }
    .paper-title,
    .paper-tags,
    .paper-abstract,
    .paper-authors {
        &::before{
            content: '';
            width: 100%;
            margin-top: -8px;
        }
        &::after {
            content: '';
            border-bottom: 1px solid #ddd;
            width: 100%;
            margin-top: 8px;
        }
    }
}
.sidedrawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: min(800px, 100vw);
    padding: 40px 20px;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: 1px 0px 7px rgba(0, 0, 0, 0.5);
    z-index: 200;
    overflow: scroll;
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
.paper-tags {
    display: flex;
    flex-wrap: wrap;
    row-gap: 8px;
    column-gap: 8px;
}
</style>
<style lang="scss">
.slide-right-enter-active {
    .sidedrawer {
        animation: slide-right-in 0.3s cubic-bezier(.21,.79,.37,.85);
    }
    .mask {
        animation: fade-in 0.3s cubic-bezier(.21,.79,.37,.85);
    }
}
.slide-right-leave-active {
    .sidedrawer {
        animation: slide-right-out 0.3s cubic-bezier(.21,.79,.37,.85);
    }
    .mask {
        animation: fade-out 0.3s cubic-bezier(.21,.79,.37,.85);
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
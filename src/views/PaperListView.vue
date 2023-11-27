<script setup lang="ts">
import json_papers from './papers.json';
import lodash from 'lodash';
import {Hsluv} from 'hsluv';
import { ref, computed } from 'vue';

const papers = ref(JSON.parse(JSON.stringify(json_papers)));

const all_tags = [
  'nlp', 'hci', 'to_read', 'interesting', 'arxiv',
];
const hueStep = 30;
const hueValues = lodash.range(0, 360, hueStep);

let hueDictionary: { [key: string]: number } = {};

all_tags.forEach((tag, index) => {
  hueDictionary[tag] = hueValues[index];
});

for (const paper of papers.value) {
  paper.tags = lodash.sampleSize(all_tags, 3).map(tag => {
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

  const authors = paper.author.split(' and ');
  paper.smart_authors = lodash.sampleSize(authors, Math.min(3, authors.length));
  paper.adding_tag = false;
  paper.new_tag = '';
}
const input_refs = ref([]);

const removeTag = (id: number, tagName: string) => {
  console.log(id, tagName);
  papers.value[id].tags = papers.value[id].tags.filter((tag: { name: string; }) => tag.name !== tagName);
};
const addtag = (id: number) => {
  console.log(id);
  if (papers.value[id].new_tag) {
    if (papers.value[id].tags.map((tag: { name: string; }) => tag.name).includes(papers.value[id].new_tag)) {
      papers.value[id].adding_tag = false;
      papers.value[id].new_tag = '';
    } else {
      // if not present, assign new hue
      if (!hueDictionary[papers.value[id].new_tag]) {
        hueDictionary[papers.value[id].new_tag] = hueValues[Object.keys(hueDictionary).length];
      }
      const tag = papers.value[id].new_tag;
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

      papers.value[id].tags.push({
        name: tag,
        color: {
          color: conv.hex,
          borderColor: convBorderColor.hex,
          textColor: convTextColor.hex,
        }
      });

      papers.value[id].adding_tag = false;
      papers.value[id].new_tag = '';
      if (!all_tags.includes(tag)) {
        all_tags.push(tag);
      }
    }
  }
};

const options = computed(() => {
  let ret = all_tags.map(t => ({ value: t, label: t }));
  // find paper with adding_tag
  const paper = papers.value.find(p => p.adding_tag);
  if (!paper) {
    return ret;
  }
  if (paper.new_tag) {
    ret = ret.filter(t => t.value.startsWith(paper.new_tag));
  }
  ret.push({ value: paper.new_tag, label: paper.new_tag });
  return ret;
});
</script>

<template>
  <div class="container">
    <n-card title="Paper List">
      <template #header-extra>
        <div class="row">
          <n-button
            type="info"
            quaternary
          >
            Add Paper
          </n-button>
          <n-button
            type="info"
            quaternary
          >
            Manage Subscriptions
          </n-button>
        </div>
      </template>
      <n-table
        :bordered="false"
        :single-line="false"
      >
        <thead>
          <tr>
            <th> Title </th>
            <th> Smart Authors </th>
            <th> Tags </th>
            <th> Actions </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="paper, id in papers"
            :key="paper.id"
            class="table-row"
            @click="() => $router.push(`/paper/${id}`)"
          >
            <td>{{ paper.title }}</td>
            <td>{{ paper.smart_authors.join(', ') }}</td>
            <td>
              <div
                class="tags"
                @click.stop="() => {}"
              >
                <n-tag
                  v-for="tag in paper.tags"
                  :key="tag.name"
                  :type="'default'"
                  :color="tag.color"
                  size="small"
                  closable
                  @close="removeTag(id, tag.name)"
                >
                  {{ tag.name }}
                </n-tag>
                <n-tag
                  v-if="!paper.adding_tag"
                  size="small"
                  @click.stop="paper.adding_tag=true; $nextTick(() => input_refs[0].focus())"
                >
                  +
                </n-tag>
                <n-auto-complete
                  v-if="paper.adding_tag"
                  ref="input_refs"
                  v-model:value="paper.new_tag"
                  size="small"
                  style="width: 300px;"
                  placeholder="Press enter to add tag"
                  :options="options"
                  :input-props="{
                    autocomplete: 'disabled'
                  }"
                  @blur="paper.adding_tag=false"
                  @keydown.enter="addtag(id)"
                ></n-auto-complete>
              </div>
            </td>
            <td>
              <n-button-group>
                <n-button
                  size="small"
                >
                  Read
                </n-button>
                <n-button
                  size="small"
                >
                  Edit
                </n-button>
                <n-button
                  size="small"
                  type="error"
                >
                  Delete
                </n-button>
              </n-button-group>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-card>
    <router-view v-slot="{ Component }">
      <!-- Use any custom transition and  to `fade` -->
      <Transition
        name="slide-right"
        :duration="300"
      >
        <component :is="Component"></component>
      </Transition>
    </router-view>
  </div>
</template>

<style scoped>
.tags {
    display: flex;
    row-gap: 8px;
    column-gap: 8px;
    flex-wrap: wrap;
}
.table-row {
  &:hover {
    cursor: pointer;
    > td {
      background-color: #f5f5f5;
    }
  }
}
</style>
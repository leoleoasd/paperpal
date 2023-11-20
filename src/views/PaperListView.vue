<script setup lang="ts">
import json_papers from './papers.json';
import lodash from 'lodash';
import {Hsluv} from 'hsluv';
import { ref } from 'vue';

const papers = ref(JSON.parse(JSON.stringify(json_papers)));

const all_tags = [
  'nlp', 'hci', 'to_read', 'interesting', 'arxiv',
];
const hueStep = 360 / all_tags.length;
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
}

const removeTag = (id: number, tagName: string) => {
  console.log(id, tagName);
  papers.value[id].tags = papers.value[id].tags.filter((tag: { name: string; }) => tag.name !== tagName);
};
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
          >
            <td>{{ paper.title }}</td>
            <td>{{ paper.smart_authors.join(', ') }}</td>
            <td>
              <div class="tags">
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
  </div>
</template>

<style scoped>
.tags {
    display: flex;
    row-gap: 8px;
    column-gap: 8px;
    flex-wrap: wrap;
}
</style>
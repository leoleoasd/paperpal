<script setup lang="ts">
import {computed, ref, type VNode} from 'vue';
import { getProject, getData, updateData } from '@/api/project';
import { computedAsync } from '@vueuse/core';
import Loading from '@/components/Loading.vue';
import SequenceTag from '@/views/label/SequenceTag.vue';
import IncontextLabeling from '@/views/label/IncontextLabeling.vue';
import router from '@/router';

import { useMessage } from 'naive-ui';
import type { NER } from '@/api/types';

const message = useMessage();
const props = defineProps<{
  projectId: number;
  labelId: number;
}>();
const projectLoading = ref(true);
const projectInfo = computedAsync(async () => {
  return (await getProject(props.projectId));
}, null, projectLoading);
const labelLoading = ref(true);
const submitting = ref(false);
const labelInfo = computedAsync(async () => {
  return (await getData(props.projectId, props.labelId));
}, null, labelLoading);

// first, we display all 'data_colums' in this project.
// but we have to remove any columns used in NER.
const dataColumns = computed(() => {
  if(projectInfo.value) {
    const togetherLabelColumns = Object.values(projectInfo.value.project.schema.label_columns)
      .filter((spec) => spec.type === 'ner' || spec.type === 'incontext')
      .map((spec) => spec.target);
    const dataColumns =  Object.keys(projectInfo.value.project.schema.data_columns)
      .filter((column) => !togetherLabelColumns.includes(column))
      .map((column) => column);
    // move id first
    dataColumns.unshift(dataColumns.splice(dataColumns.indexOf('id'), 1)[0]);
    return dataColumns;
  } else {
    return [];
  }
});
const labelColumn = computed(() => projectInfo.value?.project?.schema.label_columns);
const labelColumnOptions = computed(() => {
  if(projectInfo.value) {
    return Object.fromEntries(Object.keys(projectInfo.value.project.schema.label_columns)
      .filter((column) => labelColumn.value![column].type === 'label' || labelColumn.value![column].type === 'ner' || labelColumn.value![column].type === 'incontext')
      .map((column) => [
        column,
        labelColumn.value![column].choices?.map((choice, index) => ({
          label: choice,
          value: index,
        }))
      ]));
  } else {
    return {};
  }
});
const submit = async () => {
  submitting.value = true;
  const d: {
    [key: string]: NER | string | string[] | number | null | {
      [key: string]: NER | string | string[] | number | null;
    };
  } = {};
  // only keep label columns
  for (const column of Object.keys(labelColumn.value!)) {
    if (Object.keys(labelInfo.value!.data).includes(column) && labelInfo.value!.data[column] !== null) {
      d[column] = labelInfo.value!.data[column];
    }
  }
  if (Object.keys(d).length !== 0) {
    const resp = await updateData({
      project_id: props.projectId,
      label_id: props.labelId,
      data: d,
    });
    if (resp.code !== 0){
      message.error(resp.message);
    }
  }
  submitting.value = false;
  router.push({name: 'label', params: {
    projectId: props.projectId,
    labelId: labelInfo.value!.next_no_label_id
  }});
};
const editorRefs = ref<{
  [key: string]: InstanceType<typeof SequenceTag> | InstanceType<typeof IncontextLabeling> | null;
}>({});


const acceptAll = () => {
  for(const key in editorRefs.value) {
    editorRefs.value[key]!.acceptAllSuggestions!();
  }
};
</script>
<template>
  <div class="container">
    <n-card :title="projectInfo?.project.name">
      <Loading
        :loading="projectLoading || labelLoading || submitting"
        :has-data="!!projectInfo && !!labelInfo"
      >
        <!-- <div
          v-for="column in dataColumns"
          :key="column"
        >
          <div class="key">
            {{ column }}
          </div>
          <div class="value">
            {{ labelInfo!.data[column] }}
          </div>
        </div> -->
        <div class="row">
          <div
            v-for="column in dataColumns"
            :key="column"
            class="data"
          >
            <div class="key">
              {{ column }}
            </div>
            <div class="value">
              {{ labelInfo!.data[column] }}
            </div>
          </div>
        </div>

        <div
          v-for="column in Object.keys(labelColumn!)"
          :key="column"
        >
          <div class="labelkey">
            {{ column }}
          </div>
          <div class="value">
            <!-- @vue-ignore -->
            <n-input
              v-if="labelColumn![column].type === 'text'"
              v-model:value="labelInfo!.data[column]"
            ></n-input>
            <!-- @vue-ignore -->
            <n-select
              v-if="labelColumn![column].type === 'label'"
              v-model:value="labelInfo!.data[column]"
              :options="labelColumnOptions[column]"
            ></n-select>
            <!-- @vue-ignore -->
            <SequenceTag
              v-if="labelColumn![column].type === 'ner'"
              :ref="(el) => {editorRefs[column]=el;}"
              v-model:value="labelInfo!.data[column]"
              :text="(labelInfo!.data[labelColumn![column].target!] as string[])"
              :choices="labelColumnOptions[column]"
              :prediction="labelInfo!.data.predictions ? labelInfo!.data.predictions[column] : null"
              :project="projectInfo!.project"
            ></SequenceTag>
            <!-- @vue-ignore -->
            <IncontextLabeling
              v-if="labelColumn![column].type === 'incontext'"
              :ref="(el) => {editorRefs[column]=el;}"
              v-model:value="labelInfo!.data[column]"
              :text="labelInfo!.data[labelColumn![column].target!]"
              :choices="labelColumnOptions[column]"
              :prediction="labelInfo!.data.predictions ? labelInfo!.data.predictions[column] : null"
              :project="projectInfo!.project"
            >
            </IncontextLabeling>
          </div>
        </div>

        <n-button-group
          vertical
          class="action-button"
        >
          <n-tooltip placement="left">
            <template #trigger>
              <n-button
                class="btn"
                @click="$router.push({name: 'label', params: {
                  projectId: props.projectId,
                  labelId: labelInfo!.data.id - 1
                }})"
              >
                <template #icon>
                  <n-icon :size="30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 12 12"
                    ><g fill="none"><path
                      d="M2.146 7.354a.5.5 0 0 0 .708 0L6 4.207l3.146 3.147a.5.5 0 1 0 .708-.708l-3.5-3.5a.5.5 0 0 0-.708 0l-3.5 3.5a.5.5 0 0 0 0 .708z"
                      fill="currentColor"
                    /></g></svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            Previous
          </n-tooltip>
          <n-tooltip placement="left">
            <template #trigger>
              <n-button
                class="btn"
                @click="$router.push({name: 'label', params: {
                  projectId: props.projectId,
                  labelId: labelInfo!.data.id + 1
                }})"
              >
                <template #icon>
                  <n-icon :size="30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 12 12"
                    ><g fill="none"><path
                      d="M2.146 4.646a.5.5 0 0 1 .708 0L6 7.793l3.146-3.147a.5.5 0 1 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 0 1 0-.708z"
                      fill="currentColor"
                    /></g></svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            Next
          </n-tooltip>
          <n-tooltip placement="left">
            <template #trigger>
              <n-button
                class="btn"
                @click="submit"
              >
                <template #icon>
                  <n-icon :size="30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 20 20"
                    ><g fill="none"><path
                      d="M3 5a2 2 0 0 1 2-2h8.379a2 2 0 0 1 1.414.586l1.621 1.621A2 2 0 0 1 17 6.621V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm2-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1v-4.5A1.5 1.5 0 0 1 6.5 10h7a1.5 1.5 0 0 1 1.5 1.5V16a1 1 0 0 0 1-1V6.621a1 1 0 0 0-.293-.707l-1.621-1.621A1 1 0 0 0 13.379 4H13v2.5A1.5 1.5 0 0 1 11.5 8h-4A1.5 1.5 0 0 1 6 6.5V4H5zm2 0v2.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5V4H7zm7 12v-4.5a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5V16h8z"
                      fill="currentColor"
                    /></g></svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            Submit
          </n-tooltip>
          <n-tooltip placement="left">
            <template #trigger>
              <n-button
                class="btn"
                @click="acceptAll"
              >
                <template #icon>
                  <n-icon :size="30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 20 20"
                    ><g fill="none"><path
                      d="M6.13 2.793A3.91 3.91 0 0 1 8.5 2a1.757 1.757 0 0 1 1.5.78A1.757 1.757 0 0 1 11.5 2a3.91 3.91 0 0 1 2.37.793c.525.408.93.973 1.073 1.656c.328.025.628.161.88.366c.382.31.66.775.835 1.267c.274.765.348 1.74.064 2.57c.072.034.143.074.212.12c.275.183.484.445.638.754c.303.605.428 1.449.428 2.474c0 1.141-.435 1.907-.987 2.38a2.68 2.68 0 0 1-1.054.555c-.1.558-.38 1.204-.819 1.752C14.57 17.402 13.686 18 12.5 18c-.94 0-1.688-.52-2.174-1.03a4.252 4.252 0 0 1-.326-.385a4.245 4.245 0 0 1-.326.385C9.188 17.48 8.441 18 7.5 18c-1.186 0-2.069-.598-2.64-1.313a4.057 4.057 0 0 1-.819-1.752a2.68 2.68 0 0 1-1.054-.555C2.435 13.907 2 13.14 2 12c0-1.025.126-1.87.428-2.474c.154-.309.363-.57.638-.755a1.58 1.58 0 0 1 .212-.118c-.284-.832-.21-1.806.064-2.571c.175-.492.453-.957.835-1.267c.252-.205.552-.34.88-.366c.144-.683.549-1.248 1.074-1.656zM9.5 4.5V4.49l-.002-.05a2.744 2.744 0 0 0-.154-.764a1.222 1.222 0 0 0-.309-.49A.76.76 0 0 0 8.5 3a2.91 2.91 0 0 0-1.756.582C6.28 3.943 6 4.432 6 5a.5.5 0 0 1-.658.474c-.188-.062-.356-.027-.535.117c-.196.16-.387.444-.524.827c-.279.782-.25 1.729.133 2.305A.5.5 0 0 1 4.5 9h.75a2.25 2.25 0 0 1 2.25 2.25v.335a1.5 1.5 0 1 1-1 0v-.335c0-.69-.56-1.25-1.25-1.25H3.5a.499.499 0 0 1-.175-.032l-.003.006C3.124 10.369 3 11.025 3 12c0 .859.315 1.343.638 1.62c.347.298.732.38.862.38a.5.5 0 0 1 .5.5c0 .368.2 1.011.64 1.563c.429.535 1.046.937 1.86.937c.56 0 1.062-.313 1.45-.72c.191-.2.34-.407.437-.577a1.573 1.573 0 0 0 .113-.236V7.5H8.415a1.5 1.5 0 1 1 0-1H9.5v-2zm1 9.999v.967a1.575 1.575 0 0 0 .113.236c.098.17.246.377.436.577c.389.407.892.72 1.451.72c.814 0 1.431-.402 1.86-.937c.44-.552.64-1.195.64-1.563a.5.5 0 0 1 .5-.5c.13 0 .515-.082.862-.38c.323-.277.638-.761.638-1.62c0-.975-.125-1.63-.322-2.026a.923.923 0 0 0-.3-.37A.657.657 0 0 0 16 9.5a.5.5 0 0 1-.416-.777c.384-.576.412-1.523.133-2.305c-.137-.383-.328-.668-.524-.827c-.179-.144-.347-.18-.535-.117A.5.5 0 0 1 14 5c0-.568-.28-1.057-.745-1.418A2.91 2.91 0 0 0 11.5 3a.76.76 0 0 0-.535.186a1.22 1.22 0 0 0-.31.49a2.579 2.579 0 0 0-.155.814v9.01h.75c.69 0 1.25-.56 1.25-1.25v-1.835a1.5 1.5 0 1 1 1 0v1.835a2.25 2.25 0 0 1-2.25 2.25h-.75zM6.5 7a.5.5 0 1 0 1 0a.5.5 0 0 0-1 0zM13 9.5a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1zm-6 3a.5.5 0 1 0 0 1a.5.5 0 0 0 0-1z"
                      fill="currentColor"
                    /></g></svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            Accept All AI Suggestions
          </n-tooltip>
        </n-button-group>
      </Loading>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.data {
  margin: 8px;
}
.label-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  // min-height: 48px;
}
.key {
  font-size: 1.3em;
  border-bottom: 2px solid rgb(184, 184, 184);
  display: block;
  width: 100%;
}
.labelkey {
  font-size: 1.3em;
  display: block;
  width: 100%;
}
.value {
  font-size: 2em;
  display: block;
  width: 100%;
}
.action-button {
  position: fixed;
  right: 0px;
  top: calc(50vh - 80px);
  .btn {
    // border: 1px solid black;
    width: 60px;
    height: 60px;
  }
}
</style>

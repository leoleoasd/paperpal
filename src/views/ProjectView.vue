<script setup lang="ts">
import { ref, type Component } from 'vue';
import { getProject, updateProject } from '@/api/project';
import { computedAsync } from '@vueuse/core';
import Loading from '@/components/Loading.vue';
import {format} from 'date-fns';
import EditSave from '@/components/EditSave.vue';
import { NInput, useMessage } from 'naive-ui';
import type {Project} from '@/api/types';
const message = useMessage();
const props = defineProps<{
  projectId: number;
}>();
const loading = ref(true);
const inputEl = ref<InstanceType<typeof NInput> | null>();
const projectInfo = computedAsync(async () => {
  return (await getProject(props.projectId));
}, null, loading);
const save = async (key: 'name' | 'task_description_prompt', value: string, callback: () => void) => {
  // console.log('saving', key, value);
  const resp = await updateProject(props.projectId, {
    [key]: value,
  });
  if (resp.code === 0) {
    message.success('Your change is saved');
    projectInfo.value!.project[key] = value;
    callback();
  } else {
    message.error(`Failed to save, ${resp.message}`);
    callback();
  }
};
</script>
<template>
  <div class="container">
    <Loading
      :loading="loading"
      :has-data="!!projectInfo"
    >
      <n-card class="project-card">
        <template #header>
          {{ projectInfo!.project.name }}
        </template>
        <div>
          Created At: {{ format(projectInfo!.project.created_at, "PPp") }}
          <div class="row">
            <div class="key">
              Name:
            </div>
            <div class="value">
              <EditSave
                :value="projectInfo!.project.name"
                @save="(value, callback) => save('name', value, callback)"
              ></EditSave>
            </div>
          </div>
          <div class="row">
            <div class="key">
              Task Description Prompt:
            </div>
            <div class="value">
              <EditSave
                v-slot="slotProps"
                :value="projectInfo!.project.task_description_prompt"
                :focus="
                  () => {
                    inputEl!.focus()
                  }
                "

                @save="(value, callback) => save('task_description_prompt', value, callback)"
              >
                <n-input
                  ref="inputEl"
                  :value="slotProps.value"
                  type="textarea"
                  :readonly="slotProps.readonly"
                  @input="slotProps.setValue"
                ></n-input>
              </EditSave>
            </div>
          </div>
          <!-- {{ projectInfo }} -->
        </div>
        <n-button @click="$router.push({name: 'label', params: {projectId: props.projectId, labelId: projectInfo!.meta.first_no_label_id}})">
          Continue Label
        </n-button>
      </n-card>
    </Loading>
  </div>
</template>
<style scoped lang="scss">
// .project-card .n-card-header__main {
//     display: flex;
//     justify-content: center;
// }
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  // min-height: 48px;
}
</style>

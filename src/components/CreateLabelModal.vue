<script setup lang="ts">

import { updateProject } from '@/api/project';
import type { Project } from '@/api/types';
import {ref, toRef, watch} from 'vue';
import { useMessage } from 'naive-ui';
const message = useMessage();
// const showModal = ref(true);
const createLabelName = ref('');
const loading = ref(false);
const props = defineProps<{
  project: Project,
  showModal: boolean,
}>();
const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void
}>();
const showModal = toRef(props, 'showModal');
const showModalInternal = ref(false);
watch(showModal, (value) => {
  showModalInternal.value = value;
});
watch(showModalInternal, (value) => {
  emit('update:showModal', value);
});


const createLabel = async (project: Project) => {
  const editing_label_column = Object.keys(project.schema.label_columns)[0];
  const old_schema = project.schema;
  const new_schema = {
    ...old_schema,
    label_columns: {
      ...old_schema.label_columns,
      [editing_label_column]: {
        ...old_schema.label_columns[editing_label_column],
        choices: [
          ...old_schema.label_columns[editing_label_column].choices!,
          createLabelName.value,
        ],
      },
    },
  };
  const resp = await updateProject(project.id, {
    schema: new_schema,
  });
  if (resp.code === 0) {
    message.success('Create label successfully');
    project.schema = new_schema;
  } else {
    message.error('Create label failed');
  }
  showModalInternal.value = false;
  createLabelName.value = '';
};
</script>
<template>
  <n-modal
    v-model:show="showModalInternal"
    preset="dialog"
    title="Create a new label choice"
  >
    <n-input
      v-model:value="createLabelName"
      placeholder="Label name"
    ></n-input>
    <template #action>
      <div class="row">
        <div class="space"></div>
        <n-button
          @click="showModalInternal=false; createLabelName='';"
        >
          Cancel
        </n-button>
        <n-button
          type="primary"
          :loading="loading"
          @click="createLabel(project!)"
        >
          Create
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

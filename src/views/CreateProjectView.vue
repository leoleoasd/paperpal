<template>
  <FormCard
    title="Create Project"
    :width="800"
  >
    <n-form
      ref="formRef"
      :label-width="80"
      :model="formValue"
      :rules="rules"
    >
      <n-steps
        :current="currentStep"
        status="process"
        style="margin-bottom: 24px"
      >
        <n-step
          title="Select a File"
        ></n-step>
        <n-step
          title="Select label Columns"
        ></n-step>
        <n-step
          title="Select label details"
        ></n-step>
      </n-steps>
      <div v-if="currentStep == 1">
        <n-form-item
          label="Project Name"
          path="name"
        >
          <n-input
            v-model:value="formValue.name"
            placeholder="example project"
          ></n-input>
        </n-form-item>
        <n-form-item
          label="Task Description Prompt"
          path="task_description_prompt"
        >
          <n-input
            v-model:value="formValue.task_description_prompt"
            placeholder="Named Entity Recognition (NER) is a subtask of information extraction ..."
            type="textarea"
          ></n-input>
        </n-form-item>
        <loading
          :has-data="true"
          :loading="uploading"
        >
          <template #description>
            Uploading your file...
          </template>
          <n-form-item
            label="Dataset Files"
            path="file"
          >
            <n-upload
              v-ref="uploadRef"
              :max="1"
              :custom-request="handleUpload"
            >
              <n-upload-dragger>
                <div style="margin-bottom: 12px">
                  <n-icon
                    size="48"
                    :depth="3"
                  >
                    <archive-icon></archive-icon>
                  </n-icon>
                </div>
                <n-text style="font-size: 16px">
                  Click or drag file to this area to upload <br>
                </n-text>
              </n-upload-dragger>
            </n-upload>
          </n-form-item>
        </loading>
        <div class="row">
          <n-button
            type="primary"
            :loading="loading"
            :disabled="formValue.name === '' || dataFile === null"
            @click="currentStep++"
          >
            Next
          </n-button>
        </div>
        <!-- <n-form-item
        v-if="formValue.config_name === '__other__'"
        path="config_name"
        label="Project Config"
      >
        <loading
          :loading="columnLoading"
          :has-data="columns?.length > 0"
          style="width: 100%"
        >
          <config-input
            v-model="formValue.config"
            :possible-columns="columns"
          ></config-input>
          <template #loading>
            Please upload file first
          </template>
        </loading>
      </n-form-item> -->
        <!-- <div class="row">
        <n-button
          type="primary"
          :loading="loading"
        >
          Upload File
        </n-button>
      </div> -->
      </div>
      <div v-if="currentStep == 2">
        <div
          class="row"
          style="margin-bottom: 24px"
        >
          Please select the columns that you want to use as labels
        </div>

        <div
          class="row"
          style="margin-bottom: 24px"
        >
          <n-input-group>
            <n-input
              v-model:value="addingColumnName"
              placeholder="Add a column"
              @keyup.enter="addColumn"
            ></n-input>
            <n-button
              type="primary"
              :disabled="addingColumnName === ''"
              ghost
              @click="addColumn"
            >
              Add
            </n-button>
          </n-input-group>
        </div>

        <n-transfer
          ref="transfer"
          v-model:value="labelColumns"
          :options="allColumns"
        ></n-transfer>

        <div class="row">
          <n-button
            type="primary"
            :loading="loading"
            :disabled="formValue.name === '' || dataFile === null"
            @click="currentStep++"
          >
            Next
          </n-button>
        </div>
      </div>
      <div v-if="currentStep === 3">
        <div class="row">
          <div class="card-group">
            <n-card
              v-for="c in labelColumns"
              :key="c"
              :title="`Label Column: ${c}`"
            >
              <label-column-edit
                v-model:value="labelColumnConfigs[c]"
                :column="c"
                :target-columns="Object.entries(dataColumns).filter(([_, type]) => type === 'string').map(([column, _]) => column)"
              ></label-column-edit>
            </n-card>
          </div>
        </div>

        <n-button
          type="primary"
          :loading="loading"
          @click="submit"
        >
          Submit
        </n-button>
      </div>
    </n-form>
  </FormCard>
</template>

<script setup lang="tsx">
import FormCard from '@/components/FormCard.vue';
import Loading from '@/components/Loading.vue';
import { useMessage } from 'naive-ui';
import type { FormInst, UploadCustomRequestOptions } from 'naive-ui';
import { computed, ref } from 'vue';
import router from '@/router';
import { uploadFile, createProject } from '@/api/project';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import type {NUpload} from 'naive-ui';
import type { ProjectSchema, DataFile, LabelColumnSpec } from '@/api/types';
import LabelColumnEdit from '@/components/LabelColumnEdit.vue';
import { watch } from 'vue';
const message = useMessage();
const formRef = ref<FormInst | null>(null);
const currentStep = ref(1);
const loading = ref(false);
const uploading = ref(false);
const uploadRef = ref<InstanceType<typeof NUpload> | null>(null);
const labelColumnConfigs = ref<{
  [key: string]: LabelColumnSpec
}>({});

const formValue = ref<{
  name: string,
  schema: ProjectSchema | null,
  file: File|null,
  task_description_prompt: string,
}>({
  task_description_prompt: '',
  name: '',
  schema: null,
  file: null,
});

const dataFile = ref<DataFile | null>(null);

const labelColumns = ref<string[]>([]);
const manualAddColumns = ref<string[]>([]);
const addingColumnName = ref('');
const dataColumns = computed(() => {
  if(dataFile.value) {
    // remove label columns from dataFile.value.columns
    return Object.fromEntries(Object.entries(dataFile.value.columns).filter(([column, _]) => !labelColumns.value.includes(column)));
  } else {
    return {};
  }
});

const addColumn = () => {
  if(addingColumnName.value === '') {
    return;
  }
  // check for duplicate
  if(allColumns.value.map(v => v.value).includes(addingColumnName.value)) {
    message.error('Cannot have duplicate column name');
    return;
  }
  manualAddColumns.value.push(addingColumnName.value);
  labelColumns.value.push(addingColumnName.value);
  addingColumnName.value = '';
};
watch(labelColumns, (value) => {
  // check for all manually added columns, if not in labelColumns, remove it
  manualAddColumns.value = manualAddColumns.value.filter(column => value.includes(column));
  labelColumnConfigs.value = {};
  for(const column of value) {
    labelColumnConfigs.value[column] = {
      type: 'text',
    };
  }
}, {deep: true});

const handleUpload = async (args: UploadCustomRequestOptions) => {
  uploading.value = true;
  try {
    console.log(args.file.file);
    if(args.file.file) {
      formValue.value.file = args.file.file;
      const resp = await uploadFile(args.file.file);
      dataFile.value = resp.data_file;
    } else {
      message.error('Please select a file');
    }
  } finally {
    uploading.value = false;
  }
};

const allColumns = computed(() => {
  if(dataFile.value) {
    return Object.entries(dataFile.value.columns).map(([column, type]) => ({
      label: `${column} (${type})`,
      value: column,
      disabled: column === 'id',
    })).concat(manualAddColumns.value.map(column => ({
      label: `${column} (manualy added)`,
      value: column,
      disabled: false,
    })));
  } else {
    return [];
  }
});

const rules = {
  name: {
    required: true,
    message: 'Please set project name',
    trigger: ['input']
  },
  file: {
    required: true
  },
  task_description_prompt: {
    required: true,
    message: 'Please set task description prompt',
    trigger: ['blur']
  }
};

const submit = async() => {
  loading.value = true;
  try{
    const req = {
      name: formValue.value.name,
      schema: {
        data_columns: dataColumns.value,
        label_columns: labelColumnConfigs.value,
      },
      file_id: dataFile.value!.id,
      task_description_prompt: formValue.value.task_description_prompt,
    };
    console.log(req);
    const resp = await createProject(req);
    console.log(resp);
    if(resp.code !== 0) {
      message.error(resp.message);
      return;
    }
    message.success('创建成功');
    router.push('/');
  } finally{
    loading.value = false;
  }
};

// const handleSubmit = async () => {
//   loading.value = true;
//   try {
//     console.log(formValue.value);
//     await formRef.value?.validate();
//     const {file: _, config, config_name,  ...rest} = formValue.value;
//     const form: any = rest;
//     if (config_name === '__other__') {
//       form.config = JSON.stringify(config);
//     } else {
//       form.config_name = config_name;
//     }
//     const resp = await createProject(form, formValue.value.file!);
//     console.log(resp);
//     message.success('创建成功');
//     router.push('/');
//   }finally {
//     loading.value = false;
//   }
// };
</script>

<style scoped lang="scss">
.config-item {
  :deep(.n-form-item-blank){
    flex-direction: column;
    row-gap: 8px;
  }
}
.row {
  margin-bottom: 24px;
}
</style>

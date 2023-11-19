<script setup lang="ts">
import type { LabelColumnSpec } from '@/api/types';
import { ref, watch, computed } from 'vue';
import {DeleteOutlineFilled} from '@vicons/material';
const props = defineProps<{
  value: LabelColumnSpec | null,
  targetColumns: string[],
}>();
const value = ref(props.value ?? {
  type: 'text',
  choices: [],
  target: '',
  relations: {},
});
const emit = defineEmits<{
  (e: 'update:value', value: LabelColumnSpec): void
}>();
watch(value, (value) => {
  emit('update:value', value);
}, { deep: true });
const typeOptions = [
  { label: 'Free-form Text', value: 'text' },
  { label: 'Multiple Choice', value: 'label' },
  { label: 'Named Entity Recognition', value: 'ner' },
  { label: 'In-Context Sentence Labeling', value: 'incontext' },
];

const addingChoiceName = ref('');
const addChoice = () => {
  if(addingChoiceName.value === '') {
    return;
  }
  if(value.value.choices === undefined) {
    value.value.choices = [];
  }
  value.value.choices.push(addingChoiceName.value);
  addingChoiceName.value = '';
};
const targetOptions = computed(() => {
  return props.targetColumns.map((column) => ({
    label: column,
    value: column,
  }));
});
const relationOptions = computed(() => {
  return value.value.choices === undefined ? [] : value.value.choices.map((choice) => ({
    label: choice,
    value: choice,
  }));
});
const addingRelationName = ref('');
const addingRelationFrom = ref([]);
const addingRelationTo = ref([]);
const addRelation = () => {
  if(addingRelationName.value === '') {
    return;
  }
  if(value.value.relations === undefined) {
    value.value.relations = {};
  }
  value.value.relations[addingRelationName.value] = {
    from: addingRelationFrom.value,
    to: addingRelationTo.value,
  };
  addingRelationName.value = '';
  addingRelationFrom.value = [];
  addingRelationTo.value = [];
};
</script>
<template>
  <div>
    <n-form-item
      label="Type"
    >
      <n-select
        v-model:value="value.type"
        :options="typeOptions"
        style="width: 400px"
      ></n-select>
    </n-form-item>
    <n-form-item
      v-if="value.type === 'ner' || value.type === 'incontext'"
      label="Target"
    >
      <n-select
        v-model:value="value.target"
        :options="targetOptions"
        style="width: 400px"
      ></n-select>
    </n-form-item>
    <div class="card-group">
      <n-card
        v-if="value.type === 'label' || value.type === 'ner' || value.type === 'incontext'"
      >
        <n-empty
          v-if="value.choices?.length === 0"
          description="Please add choices"
        >
        </n-empty>
        <n-list>
          <n-list-item
            v-for="(choice, index) in value.choices"
            :key="choice"
          >
            <div class="row">
              <span>
                {{ choice }}
              </span>
              <div class="space"></div>
              <n-button
                round
                size="tiny"
                type="error"
                @click="() => value.choices?.splice(index, 1)"
              >
                <template #icon>
                  <n-icon>
                    <DeleteOutlineFilled></DeleteOutlineFilled>
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-list-item>
        </n-list>
        <n-input-group>
          <n-input
            v-model:value="addingChoiceName"
            placeholder="Add a choice / entity type"
            @keyup.enter="addChoice"
          ></n-input>
          <n-button
            type="primary"
            :disabled="addingChoiceName === ''"
            ghost
            @click="addChoice"
          >
            Add
          </n-button>
        </n-input-group>
      </n-card>
      <n-card
        v-if="false"
      >
        <n-empty
          v-if="Object.keys(value.relations ?? {}).length === 0"
          description="No relation defined"
        >
        </n-empty>
        <n-list>
          <n-list-item
            v-for="(relation, key) in value.relations"
            :key="key"
          >
            <div class="row">
              <span>
                Name: {{ key }}
                From:
                <n-tag
                  v-for="f in relation.from"
                  :key="f"
                  style="margin-right: 5px;"
                > {{ f }} </n-tag>
                To:
                <n-tag
                  v-for="t in relation.to"
                  :key="t"
                  style="margin-right: 5px;"
                >
                  {{ t }}
                </n-tag>
              </span>

              <div class="space"></div>
              <n-button
                tiny
                circle
                type="error"
                @click="() => {delete value.relations![key]}"
              >
                <template #icon>
                  <n-icon>
                    <DeleteOutlineFilled></DeleteOutlineFilled>
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-list-item>
        </n-list>
        <n-form-item label="Relation name">
          <n-input
            v-model:value="addingRelationName"
            placeholder="Relation name"
          ></n-input>
        </n-form-item>
        <n-form-item label="From Entity Type">
          <n-select
            v-model:value="addingRelationFrom"
            :options="relationOptions"
            multiple
          ></n-select>
        </n-form-item>
        <n-form-item label="To Entity Type">
          <n-select
            v-model:value="addingRelationTo"
            :options="relationOptions"
            multiple
          ></n-select>
        </n-form-item>

        <n-button
          type="primary"
          :disabled="addingRelationName === '' || addingRelationFrom.length === 0 || addingRelationTo.length === 0"
          ghost
          @click="addRelation"
        >
          Add
        </n-button>
      </n-card>
    </div>
  </div>
</template>

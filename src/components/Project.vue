<script setup lang="ts">
import type { Project } from '@/api/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {EditFilled, DeleteFilled} from '@vicons/material';
const _ = defineProps<{
  project: Project;
  action?: boolean;
}>();
</script>

<template>
  <n-thing>
    <template
      #header
    >
      {{ project.name }}
    </template>
    <template
      #description
    >
      Created At {{ format(project.created_at, "PPp", {locale: zhCN}) }}
    </template>
    <template
      v-if="action"
      #action
    >
      <n-space>
        <n-button
          size="small"
          type="success"
          @click="$router.push({name: 'project', params: {projectId: project.id}})"
        >
          <!-- <template #icon>
            <n-icon>
              <EditFilled></EditFilled>
            </n-icon>
          </template> -->
          Open
        </n-button>
        <n-button
          size="small"
          type="error"
        >
          <template #icon>
            <n-icon>
              <DeleteFilled></DeleteFilled>
            </n-icon>
          </template>
          Delete
        </n-button>
      </n-space>
    </template>
  </n-thing>
</template>

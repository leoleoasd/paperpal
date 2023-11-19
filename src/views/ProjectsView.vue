<script setup lang="tsx">
import {getProjects} from '@/api/project';
import type { Project } from '@/api/types';
import ProjectComponent from '@/components/Project.vue';
import {ref} from 'vue';

let projects = ref([] as Project[]);
let loading = ref(true);
getProjects().then((res) => {
  projects.value = res.projects;
  loading.value = false;
});

</script>

<template>
  <div class="container">
    <n-card title="My Projects">
      <div
        v-if="loading"
        class="spin-holder"
      >
        <n-spin size="medium"></n-spin>
      </div>
      <div
        v-else
        :class="(projects.length === 0 ? ['empty', 'projects'] : ['projects'])"
      >
        <div
          v-for="(project, index) in projects"
          :key="project.id"
        >
          <ProjectComponent
            :action="true"
            :project="project"
          ></ProjectComponent>
          <n-divider v-if="index !== projects.length - 1"></n-divider>
        </div>
        <n-empty
          v-if="projects.length === 0"
          description="You don't have any project"
        >
          <template #extra>
            <n-button @click="$router.push({'name': 'project.new'})">
              Create a Project
            </n-button>
          </template>
        </n-empty>
      </div>

      <template #header-extra>
        <n-button @click="$router.push({'name': 'project.new'})">
          Create Project
        </n-button>
      </template>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
.container {
  margin-bottom: 20px;
  flex: 1;
  overflow: auto;
  .n-card {
    max-height: 100%;
    :deep(.n-card__content) {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 300px;
      overflow-y: auto;
    }
    .projects.empty {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
    }
  }
}
.spin-holder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

</style>

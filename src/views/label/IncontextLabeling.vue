<template>
  <div class="holder">
    <n-card
      class="main"
      :style="{
        '--text-color': theme.textColorBase
      }"
    >
      <div class="text">
        <template
          v-for="(sentence, i) in text"
          :key="i"
        >
          <span
            v-if="tags.hasOwnProperty(i)"
            class="tag"
            :class="{
              active: i === labelEditorPosition?.editing,
            }"
            :style="{
              '--hue': label_to_hue(tags[i]),
            }"
            @click="(e: MouseEvent) => {
              if (tags.hasOwnProperty(i)) {
                openLabelEditor(i, e);
              } else {
                openLabelPicker(i, e);
              }
            }"
          >
            {{ sentence }}
            <div
              class="label"
            >
              <div class="label-text">
                {{ label_to_name[tags[i]] }}
              </div>
            </div>
          </span>
          <span
            v-if="!tags.hasOwnProperty(i) && !suggested_tags.hasOwnProperty(i)"
            class="tag no-label"
            :class="{
              active: i === labelEditorPosition?.editing,
            }"
            :style="{
              '--hue': label_to_hue(tags[i]),
            }"
            @click="(e: MouseEvent) => openLabelPicker(i, e)"
          >
            {{ sentence }}
          </span>
          <span
            v-if="suggested_tags.hasOwnProperty(i) && !tags.hasOwnProperty(i)"
            class="tag suggested"
            :class="{
              active: i === labelEditorPosition?.editing,
            }"
            :style="{
              '--hue': label_to_hue(suggested_tags[i]),
            }"
            @click="acceptSuggestion(i)"
            @contextmenu="delete suggested_tags[i]; $event.preventDefault();"
          >
            {{ sentence }}
            <div
              class="label"
            >
              <div
                class="label-text"
              >
                {{ label_to_name[suggested_tags[i]] }}
              </div>
            </div>
          </span>
        </template>
      </div>
    </n-card>
    <n-button-group
      v-if="labelEditorPosition"
      ref="labelEditorEl"
      v-click-outside="() => {labelEditorPosition = null}"
      class="label-editor"
      :style="{
        '--top': labelEditorPosition!.top + 'px',
        '--left': labelEditorPosition!.left + 'px',
        '--background-color': theme.baseColor,
      }"
      vertical
    >
      <n-button
        v-if="labelEditorPosition.showdelete"
        type="error"
        class="delete"
        @click="deleteLabel(labelEditorPosition.editing)"
      >
        <template #icon>
          <n-icon>
            <DeleteOutlineFilled></DeleteOutlineFilled>
          </n-icon>
        </template>
        Delete
      </n-button>
      <n-button
        v-for="label of choices"
        :key="label.value"
        text-color="black"
        :style="{
          '--hue': label_to_hue(label.value),
        }"
        @click="setLabel(labelEditorPosition.editing, label.value)"
      >
        <div class="box"></div>
        {{ label.label }}
      </n-button>
      <n-button
        class="delete"
        @click="showModal=true; labelEditorPosition=null"
      >
        <template #icon>
          <n-icon>
            <AddBoxOutlined></AddBoxOutlined>
          </n-icon>
        </template>
        Create a new label
      </n-button>
    </n-button-group>
    <CreateLabelModal
      v-model:show-modal="showModal"
      :project="project"
    ></CreateLabelModal>
  </div>
</template>
<script setup lang="tsx">
import { ref, computed, type Ref, type VNode, watch, toRefs } from 'vue';
import { useThemeVars } from 'naive-ui';
import {clickoutside as vClickOutside} from 'vdirs';
import { hsv2rgb, toHexString } from 'seemly';
import { NPopover } from 'naive-ui';
import type { NER } from '@/api/types';
import axios from 'axios';
import CreateLabelModal from '@/components/CreateLabelModal.vue';
import type { Project } from '@/api/types';
import AddBoxOutlined from '@vicons/material/AddBoxOutlined';
import DeleteOutlineFilled from '@vicons/material/DeleteOutlineFilled';
const showModal = ref(false);

const hwb2rgb = (h: number, w: number, b: number) => {
  return toHexString(hsv2rgb(h, 100 * (1 - (w / (1-b))),100 * (1 - b)));
};


const props = defineProps<{
  text: string[],
  choices: {
    label: string,
    value: number,
  }[],
  value: {
    [key: number]: number, // sentence_index -> label
  } | null,
  prediction: {
    [key: number]: number, // sentence_index -> label
  } | null,
  project: Project,
}>();

const {text, choices, value, prediction} = toRefs(props);

const emit = defineEmits<{
  (e: 'update:value', value: {
    [key: number]: number, // sentence_index -> label
  }): void
}>();

const labelEditorPosition: Ref<{
  top: number,
  left: number,
  editing: number,
  showdelete: boolean,
} | null> = ref(null);
const labelEditorEl: Ref<HTMLElement | null> = ref(null);
const theme = useThemeVars();

const label_to_name = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  for (const label of choices.value) {
    result[label.value] = label.label;
  }
  return result;
});

const label_to_hue = (label: number) => {
  return 60 * label;
};

const tags: Ref<{
  [key: number]: number, // sentence_index -> label
}> = ref(value?.value ?? {});



const suggested_tags: Ref<{
  [key: number]: number, // sentence_index -> label
}> = ref(prediction?.value ?? {});

watch(value!, () => {
  tags.value = value?.value ?? {};
}, {deep: true});

watch(text, () => {
  labelEditorPosition.value = null;
  tags.value = value?.value ?? {};
}, {
  deep: true,
});

watch(prediction, () => {
  suggested_tags.value = prediction?.value ?? {};
}, {deep: true});

const setLabel = (editing: number, value: number) => {
  tags.value[editing] = value;

  emit('update:value', tags.value);
  labelEditorPosition.value = null;
};

const deleteLabel = (editing: number) => {
  delete tags.value[editing];
  emit('update:value', tags.value);
  labelEditorPosition.value = null;
};

const acceptSuggestion = (index: number) => {
  tags.value[index] = suggested_tags.value[index];
  delete suggested_tags.value[index];
  emit('update:value', tags.value);
};

const acceptAllSuggestions = () => {
  for (const index in suggested_tags.value) {
    tags.value[index] = suggested_tags.value[index];
  }
  suggested_tags.value = {};
  emit('update:value', tags.value);
};

defineExpose({
  acceptAllSuggestions,
});

const openLabelEditor = (index: number, e: MouseEvent) => {
  const scrollOffset = {
    top: window.scrollY,
    left: window.scrollX,
  };
  labelEditorPosition.value = {
    top: e.clientY + scrollOffset.top,
    left: e.clientX + scrollOffset.left,
    editing: index,
    showdelete: true,
  };
};

const openLabelPicker = (index: number, e: MouseEvent) => {
  const scrollOffset = {
    top: window.scrollY,
    left: window.scrollX,
  };
  labelEditorPosition.value = {
    top: e.clientY + scrollOffset.top,
    left: e.clientX + scrollOffset.left,
    editing: index,
    showdelete: false,
  };
};

</script>
<style scoped lang="scss">
.holder {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}
.main {
    .selecting {
      position: fixed;
      background: #3297FD;
      opacity: 0.5;
      pointer-events: none;
    }
}
.text {
    font-size: 2em;
    line-height: 2;
    &::selection {
        // background: #ffffff60;
        // color: transparent;
        background: transparent;
    }
    :deep(.selection) {
        color: #fff;
        background: #3297FD;
    }
    :deep(.tag) {
      cursor: pointer;
      border-radius: 8px;
      border: 3px solid transparent;
      box-sizing: border-box;
      background-color: hwb(var(--hue) 70% 10%);
      transition: all 0.25s;
      margin-right: 5px;
      &:hover, &.active {
        border-color: hwb(var(--hue) 50% 25%);
      }
      &.no-label:hover, &.no-label.active {
        background-color: #00000027;
        border-color: transparent;
      }
      &.suggested {
        border: 4px dotted hwb(var(--hue) 10% 35%);;
        background-color: hwb(var(--hue) 98% 0%);
        &:hover, &.active {
          background-color: hwb(var(--hue) 90% 0%);
        }
      }
      position: relative;
      .label {
        // scale: 50%;
        font-family: Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace;
        font-size: 0.5em;

        display: inline;

        background-color: hsl(var(--hue) 100% 35%);
        border-radius: 8px;
        padding: 2px;
        margin: 5px;
        .label-text {
          color: white;
          display: inline;
          // mix-blend-mode: difference;
        }
      }
    }
}
.label-editor {
  z-index: 9999;
  position: absolute;
  width: auto;
  top: var(--top);
  left: var(--left);
  background: var(--background-color);
  :deep(button) {
    justify-content: flex-start;
    .box {
      // position: absolute;
      height: 14px;
      width: 14px;
      margin-right: 6px;
      margin-left: 2px;
      background-color: hwb(var(--hue) 40% 5%);
    }
  }
}
</style>

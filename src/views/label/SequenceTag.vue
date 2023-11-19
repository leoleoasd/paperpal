<template>
  <div class="holder">
    <n-card
      class="main"
      :style="{
        '--text-color': theme.textColorBase,
      }"
      @mousemove="onMousemove"
      @mouseup="onMouseUp"
    >
      <computed-html></computed-html>
      <!-- @vue-ignore -->
      <div
        v-for="rect in selectionRects!"
        :key="rect.top"
        class="selecting"
        :style="{
          top: rect.top + 'px',
          left: rect.left + 'px',
          width: rect.width + 'px',
          height: rect.height + 'px',
        }"
      ></div>
    </n-card>

    <!-- v-click-outside="() => {labelPickerPosition = null}" -->
    <n-button-group
      v-if="labelPickerPosition"
      ref="labelPickerEl"
      class="label-picker"
      :style="{
        '--top': labelPickerPosition!.top + 'px',
        '--left': labelPickerPosition!.left + 'px',
        '--background-color': theme.baseColor,
      }"
      vertical
    >
      <n-button
        v-for="label of choices"
        :key="label.value"
        text-color="black"
        :style="{
          '--hue': label_to_hue(label.value),
        }"
        @click="applyLabel(label)"
      >
        <div class="box"></div>
        {{ label.label }}
      </n-button>
      <n-button
        class="delete"
        @click="showModal=true; labelPickerPosition=null"
      >
        <template #icon>
          <n-icon>
            <AddBoxOutlined></AddBoxOutlined>
          </n-icon>
        </template>
        Create a new label
      </n-button>
    </n-button-group>

    <!-- v-click-outside="() => {labelEditorPosition = null}" -->
    <n-button-group
      v-if="labelEditorPosition"
      ref="labelEditorEl"
      class="label-editor"
      :style="{
        '--top': labelEditorPosition!.top + 'px',
        '--left': labelEditorPosition!.left + 'px',
        '--background-color': theme.baseColor,
      }"
      vertical
    >
      <n-button
        type="error"
        @click="() => {
          tags.splice(labelEditorPosition!.editing, 1);
          labelEditorPosition = null;
          emit('update:value', {
            tags: tags
          });}"
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
        @click="updateLabel(label)"
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
import CreateLabelModal from '@/components/CreateLabelModal.vue';
import type { Project } from '@/api/types';
import AddBoxOutlined from '@vicons/material/AddBoxOutlined';
import DeleteOutlineFilled from '@vicons/material/DeleteOutlineFilled';

const showModal = ref(false);

const hwb2rgb = (h: number, w: number, b: number) => {
  return toHexString(hsv2rgb(h, 100 * (1 - (w / (1-b))),100 * (1 - b)));
};
// const text = 'Lorem ipsum dolor sit amet, {}:{":[]][;././././]"} longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong 中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文 consectetur adipiscing elit. Ut tortor metus, faucibus sit amet commodo quis, pellentesque congue felis. Etiam maximus, urna condimentum ornare vulputate, justo diam euismod arcu, ac rhoncus mi velit id magna. Vestibulum viverra odio <br> lobortis magna egestas interdum. Duis tempus sit amet lectus nec tempor. In porttitor elementum velit, tempus pretium arcu ornare in. Integer sit amet dignissim ante, sit amet iaculis eros. Integer turpis quam, laoreet vel congue eu, condimentum eu dolor. Donec eleifend eu tortor nec aliquet. Nunc facilisis vestibulum mi sit amet molestie. Pellentesque finibus ex a libero tristique mattis. Proin non dapibus ipsum. Duis eu condimentum felis, at auctor lectus. Morbi scelerisque condimentum tincidunt. Praesent varius velit ipsum. Aenean feugiat rhoncus semper.';
// const text = 'Lorem ipsum dolor sit amet a tiananmen square \n lorem beijing museum ipsum dolor sit olympics park jack tom amet.';
const props = defineProps<{
  text: string,
  choices: {
    label: string,
    value: number,
  }[],
  value?: NER,
  prediction?: NER,
  project: Project,
}>();

const emit = defineEmits<{
  (e: 'update:value', value: NER): void
}>();
const {text, choices, value, prediction} = toRefs(props);
const selectionRange: Ref<{
  start: number,
  end: number,
} | null> = ref(null);
const labelPickerPosition: Ref<{
  top: number,
  left: number,
} | null> = ref(null);
const labelEditorPosition: Ref<{
  top: number,
  left: number,
  editing: number,
} | null> = ref(null);
const labelPickerEl: Ref<HTMLElement | null> = ref(null);
const labelEditorEl: Ref<HTMLElement | null> = ref(null);
const theme = useThemeVars();
const textEL: Ref<HTMLElement | null> = ref(null);
const smartSelection = ref(true);



// const choices: Ref<{
//   label: number,
//   value: string,
// }[]> = ref([
//   {
//     label: 0,
//     value: 'organization',
//   },
//   {
//     label: 1,
//     value: 'location',
//   },
//   {
//     label: 2,
//     value: 'person',
//   },
//   {
//     label: 3,
//     value: 'miscellaneous'
//   }
// ]);

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
  start: number,
  end: number,
  value: number,
}[]> = ref(value?.value?.tags ?? []);

watch(value!, () => {
  tags.value = value?.value?.tags ?? [];
}, {deep: true});

const suggested_tags: Ref<{
  start: number,
  end: number,
  value: number,
}[]> = ref(prediction?.value?.tags ?? []);

watch(text, () => {
  labelPickerPosition.value = null;
  labelEditorPosition.value = null;
  selectionRange.value = null;
});

watch(prediction!, () => {
  suggested_tags.value = prediction?.value?.tags ?? [];
}, {deep: true});

// watch(tags, () => {
//   emit('update:value', {
//     tags: tags.value
//   });
// }, {deep: true});

// watch(tags, (new_tags) => {
//   console.log(new_tags);
//   const data: {text: string, demo?: any} = {
//     text: text.value
//   };
//   if (new_tags.length > 0) {
//     data.demo = {
//       text: text.value,
//       label: new_tags,
//     };
//   }
//   axios({
//     method: 'post',
//     url: 'http://localhost:5000/api/suggest',
//     data,
//   }).then((response) => {
//     let new_suggestions = response.data;
//     // check and remove intersections with existing tags
//     for (const tag of new_tags) {
//       for (let i = 0; i < new_suggestions.length; ++ i) {
//         if (tag.start < new_suggestions[i].end && tag.end > new_suggestions[i].start) {
//           new_suggestions.splice(i, 1);
//           i -= 1;
//         }
//       }
//     }
//     suggested_tags.value = new_suggestions;
//   });
// }, {
//   immediate: true,
//   deep: true,
// });

const selectionRects: Ref<DOMRectList | null> = ref(null);

const applyLabel = (label: {
  label: string,
  value: number
}) => {
  if (selectionRange.value) {
    tags.value.push({
      ...selectionRange.value!,
      value: label.value
    });
    emit('update:value', {
      tags: tags.value
    });
    selectionRange.value = null;
    labelPickerPosition.value = null;
  }
};

const updateLabel = (label: {
  label: string,
  value: number
}) => {
  if (labelEditorPosition.value) {
    tags.value[labelEditorPosition.value.editing].value = label.value;
    emit('update:value', {
      tags: tags.value
    });
    labelEditorPosition.value = null;
  }
};

const openLabelEditor = (tag_id: number) => (e: MouseEvent) => {
  if ((e.target! as HTMLElement).classList.contains('label')) {
    return;
  }
  const rect = (e.target! as HTMLElement).getBoundingClientRect();
  labelEditorPosition.value = {
    top: rect.top + rect.height + 3,
    left: rect.left,
    editing: tag_id,
  };
};

const confirmSuggestion = (suggestion_id: number) => (e: MouseEvent) => {
  tags.value.push(suggested_tags.value[suggestion_id]);
  emit('update:value', {
    tags: tags.value
  });
  suggested_tags.value.splice(suggestion_id, 1);
};


const acceptAllSuggestions = () => {
  for (const tag of suggested_tags.value) {
    tags.value.push(tag);
  }
  suggested_tags.value = [];
  emit('update:value', {
    tags: tags.value
  });
};

defineExpose({
  acceptAllSuggestions,
});

const rejectSuggestion = (suggestion_id: number) => (e: MouseEvent) => {
  e.preventDefault();
  suggested_tags.value.splice(suggestion_id, 1);
};

const computedHtml = computed(() => {
  let texts: (string | VNode)[] = [text.value];
  if (selectionRange.value){
    let now_pos = 0;
    for(let i = 0; i < texts.length; ++ i){
      console.log(JSON.stringify(texts[i]));
      if(typeof texts[i] == 'string'){
        if ((texts[i] as string).length + now_pos > selectionRange.value.start){
          texts.splice(i, 1,
            (texts[i] as string).slice(0, selectionRange.value.start - now_pos),
            <span class="selection">{(texts[i] as string).slice(selectionRange.value.start - now_pos, selectionRange.value.end - now_pos)}</span>,
            (texts[i] as string).slice(selectionRange.value.end - now_pos),
          );
          break;
        } else {
          now_pos += (texts[i] as string).length;
        }
      }
    }
  }
  for (const [index, tag] of tags.value.entries()) {
    let now_pos = 0;
    for(let i = 0; i < texts.length; ++ i){
      if (typeof texts[i] == 'string') {
        // this is a string
        const now_text = texts[i] as string;
        if (now_text.length + now_pos > tag.start){
          texts.splice(i, 1,
            now_text.slice(0, tag.start - now_pos),
            <span onClick={openLabelEditor(index)} class={['tag', `tag-${tag.value}`]} style={{'--hue': label_to_hue(tag.value)}}>{now_text.slice(tag.start - now_pos, tag.end - now_pos)}<div class="label">{label_to_name.value[tag.value]}</div></span>,
            now_text.slice(tag.end - now_pos),
          );
          break;
        } else {
          now_pos += now_text.length;
        }
      } else {
        // this is a VNode
        // we don't allow tags within tags, so this string shouldn't need to be splitted.
        // we should count it's first direct child's string length
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        now_pos += (texts[i] as VNode).children![0].length;
      }
    }
  }
  for (const [index, tag] of suggested_tags.value.entries()) {
    // if overlap skip
    if (tags.value.some((t) => t.start < tag.end && t.end > tag.start)) {
      continue;
    }
    let now_pos = 0;
    for(let i = 0; i < texts.length; ++ i){
      if (typeof texts[i] == 'string') {
        const now_text = texts[i] as string;
        console.log(now_text);
        if (now_text.length + now_pos > tag.start){
          texts.splice(i, 1,
            now_text.slice(0, tag.start - now_pos),
            <span onClick={confirmSuggestion(index)} onContextmenu={rejectSuggestion(index)} class={['tag', `tag-${tag.value}`, 'suggestion']} style={{'--hue': label_to_hue(tag.value)}}>{now_text.slice(tag.start - now_pos, tag.end - now_pos)}<div class="label suggested">{label_to_name.value[tag.value]}</div></span>,
            now_text.slice(tag.end - now_pos),
          );
          break;
        } else {
          now_pos += now_text.length;
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        now_pos += (texts[i] as VNode).children![0].length;
      }
    }
  }
  // add tooltip
  for(let i = 0; i < texts.length; ++ i) {
    if (typeof texts[i] != 'string') {
      const node = texts[i] as VNode;
      if (node.props!.class?.includes('suggestion')) {
        texts.splice(i, 1, <NPopover trigger="hover">
          {{
            default: () => <div>Click to confirm <br /> Right click to reject</div>,
            trigger: () => node,
          }}
        </NPopover>);
      }
    }
  }
  return (
    <div
      ref="textEL"
      class="text"
    >
      {
        texts
      }
    </div>
  );
});

const hasRange = () => {
  return (document.getSelection()?.rangeCount ?? 0 > 0 ) && document.getSelection()!.toString().length > 0;
};

const trim = (range: Range, text: string) => {
  let left = range.startOffset;
  let right = range.endOffset;
  while (' ,.?!"\'\\()[]{}:;<>/'.includes(text[left]) && left < right){
    left += 1;
  }
  range.setStart(range.startContainer, left);
  while (' ,.?!"\'\\()[]{}:;<>/'.includes(text[right - 1]) && right > left){
    right -= 1;
  }
  range.setEnd(range.endContainer, right);
};
const trim_expand = (range: Range, text: string) => {
  if (smartSelection.value) {
    trim(range, text);
    let left = range.startOffset;
    while(left > 0 && /[a-zA-Z0-9]/.test(text[left - 1])){
      left -= 1;
    }
    range.setStart(range.startContainer, left);
    let right = range.endOffset;
    while(right < text.length && /[a-zA-Z0-9]/.test(text[right])){
      right += 1;
    }
    range.setEnd(range.endContainer, right);
    trim(range, text);
  }
};

const onMouseUp = () => {
  if (!hasRange()){
    selectionRange.value = null;
    selectionRects.value = null;
    // labelPickerPosition.value = null;
  } else {
    let range = document.getSelection()!.getRangeAt(0);
    let node = range.startContainer;
    if (node.parentElement != textEL.value || range.startContainer != range.endContainer) {
      console.log('selecting from within tag');
      document.getSelection()?.empty();
      selectionRects.value = null;
      selectionRange.value = null;
      return;
    }
    trim_expand(range, range.startContainer.textContent!);
    let rrange = {
      start: range.startOffset,
      end: range.endOffset,
    };
    // console.log(node.parentElement, textEL.value);
    while(node.previousSibling){
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (node.previousSibling.nodeType == Node.ELEMENT_NODE && (node.previousSibling.tagName  == 'BR')) {
        rrange.start += 1;
        rrange.end += 1;
      } else {
        if (node.previousSibling.nodeType == Node.TEXT_NODE){
          rrange.start += node.previousSibling.textContent!.length;
          rrange.end += node.previousSibling.textContent!.length;
        } else {
          for (const c in node.previousSibling.childNodes) {
            const child = node.previousSibling.childNodes[c];
            if (child.nodeType == Node.TEXT_NODE) {
              rrange.start += child.textContent!.length;
              rrange.end += child.textContent!.length;
            }
          }
        }
      }

      node = node.previousSibling;
    }
    selectionRange.value = rrange;
    console.log(selectionRects.value);
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1];
    // get scroll offset
    const scrollOffset = {
      top: window.scrollY,
      left: window.scrollX,
    };

    labelPickerPosition.value = {
      top: rect.top + scrollOffset.top + rect.height,
      left: rect.left + scrollOffset.left + rect.width,
    };
    selectionRects.value = null;
  }
};
const onMousemove = () => {
  if (!hasRange()){
    selectionRects.value = null;
  } else {
    let range = document.getSelection()!.getRangeAt(0).cloneRange();
    if (range.startContainer != range.endContainer){
      selectionRects.value = range.getClientRects();
      return;
    }
    let text = range.startContainer.textContent!;
    trim_expand(range, text);
    selectionRects.value = range.getClientRects();
  }
//   console.log(e);
//   console.log('mouse moved');
//   const sel = rangy.getSelection();
//   console.log(sel);
//   if (i == 0){
//     i = 1;
//     sel.expand('word');
//   } else {
//     i = 0;
//   }
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
    line-height: 2.5;
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
      border-radius: 8px;
      line-height: 1.5;
      cursor: pointer;
      // background-color: hsl(var(--hue) 100% 80%);
      // &:hover {
      //   background-color: hwb(var(--hue) 80% 0%);
      // }
      outline: 3px solid hwb(var(--hue) 40% 5%);
      &.suggestion {
        // background-color: hwb(var(--hue) 85% 0%);
        outline: 5px dotted hwb(var(--hue) 40% 5%);
        border-radius: 0px;
      }
      display: inline-block;
      position: relative;
      transition: background-color 0.25s;
      z-index: 5;
      .label {
        cursor: auto;
        z-index: 0;
        transition: background-color 0.25s;
        // scale: 50%;
        font-size: 0.5em;
        font-family: Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace;
        line-height: 1em;
        position: absolute;
        white-space: nowrap;
        overflow-x: show;
        // &:after {
        //   content: '';
        //   position: absolute;
        //   // background: hwb(var(--hue) 40% 5%);
        //   border-radius: 3px;
        //   height: 0px;
        //   border: 3px solid hwb(var(--hue) 40% 5%);
        //   left: 0;
        //   right: 0;
        //   top: -7px;
        // }
        // &.suggested::after{
        //   // background: hwb(var(--hue) 75% 10%);
        //   border: none;
        // }
        width: 100%;
        left: 0;
      }
    }
}
.label-picker, .label-editor {
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
  // .n-button:not(.delete) {
  //   background-color: hwb(var(--hue) var(--white) var(--black));
  //   // outline: 1px solid hwb(var(--hue) 30% 20%);
  //   :deep(.n-button__state-border) {
  //     // border-color: transparent;
  //     // border: 1px solid hwb(var(--hue) 50% 20%);
  //     border: 1px solid hwb(var(--hue) var(--border-white) var(--border-black));
  //   }
  //   &:hover {

  //     :deep(.n-button__state-border) {
  //       // border-color: transparent;
  //       // border: 1px solid hwb(var(--hue) 10% 30%);
  //       border: 1px solid hwb(var(--hue) var(--border-hover-white) var(--border-hover-black));
  //     }
  //     // background-color: hwb(var(--hue) 80% 0%);
  //     background-color: hwb(var(--hue) var(--hover-white) var(--hover-black));
  //   }
  // }
}

</style>

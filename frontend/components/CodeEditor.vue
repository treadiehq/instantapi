<template>
  <div ref="editorRef" class="code-editor min-h-[400px]"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { placeholder } from '@codemirror/view'

const props = defineProps<{
  modelValue: string
  language: 'javascript' | 'python'
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorRef = ref<HTMLElement>()
let editorView: EditorView | null = null
const languageCompartment = new Compartment()
const readOnlyCompartment = new Compartment()
const placeholderCompartment = new Compartment()

onMounted(() => {
  if (!editorRef.value) return

  const languageExtension = props.language === 'javascript' ? javascript() : python()

  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      languageCompartment.of(languageExtension),
      oneDark,
      placeholderCompartment.of(props.placeholder ? placeholder(props.placeholder) : []),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
      readOnlyCompartment.of([
        EditorView.editable.of(!props.disabled),
        EditorState.readOnly.of(props.disabled || false)
      ]),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          height: '400px',
        },
        '.cm-scroller': {
          fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
          lineHeight: '1.6',
        },
        '.cm-gutters': {
          backgroundColor: '#0a0a0a',
          borderRight: 'none',
        },
        '.cm-content': {
          caretColor: '#60a5fa',
          padding: '10px 0',
        },
        '&.cm-focused': {
          outline: 'none',
        },
        '.cm-placeholder': {
          color: '#6b7280',
          fontStyle: 'italic',
        },
      }),
    ],
  })

  editorView = new EditorView({
    state: startState,
    parent: editorRef.value,
  })
})

// Watch for language changes
watch(() => props.language, (newLang) => {
  if (!editorView) return

  const languageExtension = newLang === 'javascript' ? javascript() : python()
  
  editorView.dispatch({
    effects: languageCompartment.reconfigure(languageExtension)
  })
})

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (!editorView || editorView.state.doc.toString() === newValue) return
  
  editorView.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: newValue,
    },
  })
})

// Watch for disabled changes
watch(() => props.disabled, (newDisabled) => {
  if (!editorView) return
  
  editorView.dispatch({
    effects: readOnlyCompartment.reconfigure([
      EditorView.editable.of(!newDisabled),
      EditorState.readOnly.of(newDisabled || false)
    ])
  })
})

// Watch for placeholder changes
watch(() => props.placeholder, (newPlaceholder) => {
  if (!editorView) return
  
  editorView.dispatch({
    effects: placeholderCompartment.reconfigure(
      newPlaceholder ? placeholder(newPlaceholder) : []
    )
  })
})

onBeforeUnmount(() => {
  editorView?.destroy()
})
</script>

<style scoped>
.code-editor {
  background: #000;
  border-radius: 0;
  overflow: hidden;
}

:deep(.cm-editor) {
  background: #000 !important;
}

:deep(.cm-activeLineGutter) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.cm-activeLine) {
  background-color: rgba(255, 255, 255, 0.02) !important;
}

:deep(.cm-placeholder) {
  color: #6b7280 !important;
  font-style: italic;
}

:deep(.cm-gutters) {
  background-color: rgba(106,114,130,0.1) !important;
}

/* :deep(.cm-gutter .cm-foldGutter) {
  padding-left: 10px !important;

}

:deep(.cm-gutter .cm-foldGutter) {
  padding-left: 10px !important;
} */
</style>


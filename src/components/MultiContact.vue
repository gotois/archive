<template>
  <QSelect
    v-model="modelContact"
    :readonly="readonly"
    :label="label"
    autocomplete="off"
    spellcheck="false"
    :hint="hint"
    :hide-hint="hideHint"
    :hide-bottom-space="hideBottomSpace"
    :type="currentContactType"
    :error="hasErrorMessage"
    :error-message="errorMessage"
    :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'"
    :dense="dense"
    :color="color"
    use-input
    use-chips
    multiple
    hide-dropdown-icon
    square
    outlined
    @focus="(target) => emit('focus', target)"
    @input-value="onInputValueContact"
    @new-value="onNewValueContact"
  >
    <template #prepend>
      <QIcon name="contacts" />
    </template>
    <template #selected-item="item">
      <QChip
        :icon="formatIconContact(item.opt)"
        :dense="dense"
        color="transparent"
        square
      >
        {{ item.opt.value }}
      </QChip>
    </template>
  </QSelect>
</template>
<script lang="ts" setup>
import { ref, computed, PropType } from 'vue'
import { QSelect, QIcon, QChip, patterns } from 'quasar'

enum InputType {
  email = 'email',
  url = 'url',
  tel = 'tel',
  text = 'text',
}
interface MultiContact {
  type: InputType
  value: string
}

const emit = defineEmits(['focus', 'update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Array as PropType<MultiContact[]>,
    required: true,
  },
  readonly: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: false,
  },
  label: {
    type: String as PropType<string>,
    required: false,
    default: null,
  },
  errorMessage: {
    type: String as PropType<string>,
    required: false,
    default: null,
  },
  color: {
    type: String as PropType<string>,
    required: false,
    default: null,
  },
  hint: {
    type: String as PropType<string>,
    required: false,
    default: null,
  },
  hideHint: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: null,
  },
  hideBottomSpace: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: null,
  },
  dense: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: null,
  },
})

const hasErrorMessage = ref(false)
const currentContactType = ref<InputType>(InputType.text)

const modelContact = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

function validTelString(tel: string) {
  return tel.startsWith('+')
}

function formatIconContact(contact: MultiContact) {
  switch (contact.type) {
    case InputType.email: {
      return 'alternate_email'
    }
    case InputType.url: {
      return 'link'
    }
    case InputType.tel: {
      return 'add_call'
    }
    default: {
      return 'question_mark'
    }
  }
}

function validUrlString(url: string) {
  if (
    !(
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('did:')
    )
  ) {
    return false
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  if (Reflect.has(URL, 'canParse') && !URL.canParse(url)) {
    return false
  }
  return true
}

function onInputValueContact(text: string) {
  if (validTelString(text)) {
    currentContactType.value = InputType.tel
  } else if (validUrlString(text)) {
    currentContactType.value = InputType.url
  } else if (text.includes('@') && patterns.testPattern.email(text)) {
    currentContactType.value = InputType.email
  } else {
    currentContactType.value = InputType.text
  }
}

function onNewValueContact(
  text: string,
  done: (value: MultiContact, format: string) => void,
) {
  hasErrorMessage.value = false
  text = text.toLowerCase().replaceAll(' ', '')
  if (validTelString(text)) {
    return done(
      {
        type: InputType.tel,
        value: text.replace(/\D/g, ''),
      },
      'add-unique',
    )
  } else if (validUrlString(text)) {
    return done({ type: InputType.url, value: text }, 'add-unique')
  } else if (text.includes('@') && patterns.testPattern.email(text)) {
    return done({ type: InputType.email, value: text }, 'add-unique')
  }
  hasErrorMessage.value = true
}
</script>

<template>
  <VOtpInput
    ref="otpInput"
    :value="pin"
    input-classes="otp-input"
    :separator="separator"
    :num-inputs="num"
    :is-disabled="disabled"
    :should-auto-focus="autofocus"
    :conditional-class="['first', '', '', 'last']"
    :placeholder="placeholder"
    @on-change="onChange"
    @on-complete="$emit('complete')"
  />
</template>
<script lang="ts" setup>
import { PropType, ref } from 'vue'
import VOtpInput from 'vue3-otp-input'

const emit = defineEmits(['complete', 'change'])
const props = defineProps({
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  autofocus: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  placeholder: {
    type: String as PropType<string>,
    default: '*',
  },
  separator: {
    type: String as PropType<string>,
    default: '-',
  },
  num: {
    type: Number as PropType<number>,
    default: 4,
  },
})

const pin = ref('')
const placeholder = ref(
  (props.placeholder + ',')
    .repeat(props.num)
    .split(',')
    .filter((x) => !!x),
)
const otpInput = ref<InstanceType<typeof VOtpInput> | null>(null)

function onChange(value: string) {
  pin.value = value
  emit('change', value)
}

function clear() {
  otpInput.value.clearInput()
  document
    .querySelectorAll('.otp-input')
    .forEach((element) => (element as HTMLElement).blur())
}

defineExpose({
  clear,
  get num() {
    return props.num
  },
  get code(): string {
    return pin.value
  },
})
</script>

<style lang="scss">
.otp-input {
  width: 40px;
  height: 40px;
  margin: 0 10px;
  font-size: 20px;
  border-radius: 4px;
  text-align: center;
  outline: none;
  transition: border-color 0.36s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus-visible {
    outline: none;
  }

  &:focus,
  &:target {
    border-color: $secondary;
  }

  &.first {
    margin-left: 0;
  }
  &.last {
    margin-right: 0;
  }

  &.is-complete {
    border: 1px solid $secondary;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }

  input::placeholder {
    font-size: 15px;
    text-align: center;
    font-weight: 600;
  }

  + span {
    pointer-events: none;
  }
}
body.body--light {
  .otp-input {
    background-color: white;
    border: 1px solid rgba(black, 0.24);

    &:active,
    &:focus-visible,
    &:hover {
      border-color: rgba(black, 0.87);
    }
    &.is-complete {
      background-color: white;
    }
  }
}
body.body--dark {
  .otp-input {
    color: white;
    background-color: var(--q-dark);
    border: 1px solid rgba(white, 0.24);

    &:active,
    &:focus-visible,
    &:hover {
      border-color: rgba(white, 0.87);
    }
    &.is-complete {
      background-color: black;
    }
  }
}
</style>

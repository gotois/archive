import { h, defineComponent, ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { date, QChatMessage, QSkeleton } from 'quasar'
import { parse } from '../helpers/markdownHelper'

function timeAgo(d: Date) {
  return date.formatDate(d, 'YYYY/MM/DD HH:mm')
}

const props = {
  index: Number,
  sent: Boolean,
}

export const ChatComponent = defineComponent({
  props: props,
  setup(props) {
    const asyncContent = ref(null)
    let timer: string | number = null
    onBeforeMount(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      timer = setTimeout(
        () => {
          asyncContent.value = {
            sent: props.sent,
            name: props.sent === true ? 'Вы' : 'Бот',
            stamp: timeAgo(new Date()),
            text: [parse(`Message with id **${props.index}**`)],
          }
        },
        300 + Math.random() * 2000,
      )
    })

    onBeforeUnmount(() => {
      clearTimeout(timer)
    })

    return () => {
      if (asyncContent.value === Object(asyncContent.value)) {
        return h(QChatMessage, {
          class: 'q-mx-sm',
          key: props.index,
          ...asyncContent.value,
        })
      }

      const content = [
        h(QSkeleton, {
          class: 'on-left on-right',
          animation: 'none',
          type: 'text',
          width: '150px',
          height: '100px',
        }),
      ]

      return h(
        'div',
        {
          class: `row no-wrap items-center q-mx-sm justify-${
            props.sent === true ? 'end' : 'start'
          }`,
          style: 'height: 78px',
          key: props.index,
        },
        content,
      )
    }
  },
})

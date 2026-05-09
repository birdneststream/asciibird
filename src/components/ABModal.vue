<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-lg transform overflow-visible rounded bg-white shadow transition-all"
            >
              <div v-if="title" class="border-b p-3 font-bold">
                {{ title }}
              </div>
              <div class="p-3">
                <slot />
              </div>
              <div class="p-1 rounded-b bg-gray-100">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';

export default {
  name: 'ABModal',
  components: {
    Dialog: Dialog,
    DialogPanel: DialogPanel,
    TransitionRoot: TransitionRoot,
    TransitionChild: TransitionChild,
  },
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
  },
  emits: ['close'],
};
</script>

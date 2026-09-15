<template>
  <ABModal
    :open="showHelpModal"
    @close="modalStore.closeModal('help')"
    title="ASCIIBIRD Help"
  >
    <div class="flex flex-col min-w-0">
      <!-- Tabs -->
      <div class="flex gap-1 mb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="flex-1 py-1.5 font-label-mono text-label-mono rounded-sm transition-colors flex items-center justify-center gap-1"
          :class="activeTab === tab.id
            ? 'bg-primary-container/20 text-primary border border-primary/50'
            : 'text-on-surface-variant hover:bg-surface-variant border border-transparent'"
          @click="activeTab = tab.id"
        >
          <span
            class="material-icons text-sm"
            aria-hidden="true"
          >{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tools tab -->
      <div
        v-if="activeTab === 'tools'"
        class="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1"
        data-testid="help-tools"
      >
        <div
          v-for="tool in helpTools"
          :key="tool.name"
          class="flex items-start gap-2 bg-surface-container-lowest border border-outline-variant/50 rounded p-2"
        >
          <span
            class="material-icons text-lg text-on-surface-variant flex-shrink-0"
            aria-hidden="true"
          >{{ tool.icon }}</span>
          <div class="min-w-0">
            <span class="font-label-mono text-label-mono text-primary block">
              {{ tool.label }}
            </span>
            <span class="text-on-surface-variant text-body-sm block leading-snug">
              {{ tool.description }}
            </span>
          </div>
        </div>
      </div>

      <!-- Shortcuts tab -->
      <div
        v-else
        class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1"
        data-testid="help-shortcuts"
      >
        <div
          v-for="group in shortcutGroups"
          :key="group.title"
        >
          <span class="font-label-mono text-label-mono text-primary block mb-1">
            {{ group.title }}
          </span>
          <div
            v-for="(shortcut, i) in group.shortcuts"
            :key="group.title + i"
            class="flex items-baseline justify-between gap-3 py-0.5 border-b border-outline-variant/20 last:border-0"
          >
            <span class="text-on-surface-variant text-body-sm text-right flex-shrink-0">
              {{ shortcut.action }}
            </span>
            <kbd class="ab-kbd flex-shrink-0">{{ shortcut.keys }}</kbd>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="flex justify-between"
        @click="modalStore.closeModal('help')"
      >
        <button
          type="button"
          class="ab-button p-2 w-full"
        >
          Close
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useModalStore } from '../../store/modal';
import ABModal from '../ABModal.vue';
import {
  HELP_TOOLS,
  HELP_SHORTCUT_GROUPS,
} from '../../utils/helpContent';

const modalStore = useModalStore();

const showHelpModal = computed(() => modalStore.modalState.help);

const tabs = [
  { id: 'tools' as const, label: 'Tools', icon: 'construction' },
  { id: 'shortcuts' as const, label: 'Shortcuts', icon: 'keyboard' },
];

const activeTab = ref<'tools' | 'shortcuts'>('tools');

const helpTools = computed(() => HELP_TOOLS);
const shortcutGroups = computed(() => HELP_SHORTCUT_GROUPS);

defineExpose({ showHelpModal, activeTab, helpTools, shortcutGroups });
</script>

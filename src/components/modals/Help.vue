<template>
  <ABModal
    :open="showHelpModal"
    wide
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
          class="flex-1 py-1.5 font-label-mono text-label-mono rounded-xs transition-colors flex items-center justify-center gap-1"
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
        class="flex flex-col gap-1.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1"
        data-testid="help-tools"
      >
        <div
          v-for="tool in HELP_TOOLS"
          :key="tool.name"
          class="flex items-start gap-2 bg-surface-container-lowest border border-outline-variant/50 rounded-sm p-2"
        >
          <span
            class="material-icons text-lg text-on-surface-variant shrink-0"
            aria-hidden="true"
          >{{ tool.icon }}</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-label-mono text-label-mono text-primary">
                {{ tool.label }}
              </span>
              <kbd
                v-if="tool.shortcut"
                class="ab-kbd"
                :title="`Activate the ${tool.label} tool`"
              >{{ tool.shortcut }}</kbd>
            </div>
            <span class="text-on-surface-variant text-body-sm block leading-snug">
              {{ tool.description }}
            </span>
            <!-- Shape type sub-entries (shapes tool only) -->
            <div
              v-if="tool.shapeTypes"
              class="flex flex-wrap gap-1 mt-1.5"
            >
              <span
                v-for="shapeType in tool.shapeTypes"
                :key="shapeType.name"
                class="flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-surface-variant/30 border border-outline-variant/30"
                :title="shapeType.label"
              >
                <span
                  class="material-icons text-sm text-on-surface-variant"
                  aria-hidden="true"
                >{{ shapeType.icon }}</span>
                <span class="text-[10px] font-label-mono text-on-surface-variant">
                  {{ shapeType.label }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Work area tab -->
      <div
        v-else-if="activeTab === 'area'"
        class="flex flex-col gap-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1"
        data-testid="help-area"
      >
        <div
          v-for="section in HELP_PANELS"
          :key="section.id"
          class="bg-surface-container-lowest border border-outline-variant/50 rounded-sm p-2"
        >
          <div class="flex items-center gap-2 mb-1">
            <span
              class="material-icons text-lg text-on-surface-variant"
              aria-hidden="true"
            >{{ section.icon }}</span>
            <span class="font-label-mono text-label-mono text-primary">
              {{ section.title }}
            </span>
          </div>
          <span class="text-on-surface-variant text-body-sm block leading-snug mb-1">
            {{ section.purpose }}
          </span>
          <ul class="text-on-surface-variant text-body-sm leading-snug list-disc list-inside mb-1">
            <li
              v-for="item in section.items"
              :key="item"
              class="min-w-0"
            >
              {{ item }}
            </li>
          </ul>
          <div
            v-if="section.shortcuts.length"
            class="flex flex-col gap-0.5 pt-1 border-t border-outline-variant/20"
          >
            <div
              v-for="shortcut in section.shortcuts"
              :key="section.id + shortcut.keys"
              class="flex items-baseline justify-between gap-3"
            >
              <span class="text-on-surface-variant text-body-sm min-w-0">
                {{ shortcut.action }}
              </span>
              <kbd class="ab-kbd shrink-0">{{ shortcut.keys }}</kbd>
            </div>
          </div>
        </div>
      </div>

      <!-- Shortcuts tab -->
      <div
        v-else
        class="flex flex-col gap-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1"
        data-testid="help-shortcuts"
      >
        <div
          v-for="group in HELP_SHORTCUT_GROUPS"
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
            <span class="text-on-surface-variant text-body-sm min-w-0">
              {{ shortcut.action }}
            </span>
            <kbd class="ab-kbd shrink-0">{{ shortcut.keys }}</kbd>
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
  HELP_PANELS,
  HELP_SHORTCUT_GROUPS,
} from '../../utils/helpContent';

const modalStore = useModalStore();

const showHelpModal = computed(() => modalStore.modalState.help);

const tabs = [
  { id: 'tools' as const, label: 'Tools', icon: 'construction' },
  { id: 'area' as const, label: 'Work Area', icon: 'dashboard' },
  { id: 'shortcuts' as const, label: 'Shortcuts', icon: 'keyboard' },
];

const activeTab = ref<'tools' | 'area' | 'shortcuts'>('tools');

defineExpose({
  showHelpModal,
  activeTab,
  helpTools: HELP_TOOLS,
  helpPanels: HELP_PANELS,
  shortcutGroups: HELP_SHORTCUT_GROUPS,
});
</script>

<template>
	<t-modal
	 name="settings-modal"
   header="Settings"
   :clickToClose="false"
   :escToClose="true"
  >
    Font Family
    <t-input
      type="text"
      name="font"
      v-model="forms.settings.font"
      min="1"
    />
    <template v-slot:footer>
      <div class="flex justify-between">
        <t-button type="button"
        @click="$modal.hide('settings-modal')"> Cancel </t-button>
        <t-button type="button" @click="updateSettings()"> Ok </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>

export default {
  name: 'SettingsModal',
  created() {},
  data: () => ({
    forms: {
      settings: {
        font: 'Hack',
      },
    },
  }),
  computed: {
    showSettingsModal() {
      return this.$store.getters.modalState.settingsModal;
    },
  },
  watch: {
    showSettingsModal(val, old) {
      this.createClick();
    },
  },
  methods: {
    createClick() {
      this.forms.settings.font = this.$store.getters.getOptions.font;
      this.$modal.show('settings-modal');
    },

    updateSettings() {
      // font settings
      this.$store.getters.getOptions.font = this.forms.settings.font;
      // actually change the font here too.
      document.body.style.fontFamily = this.forms.settings.font;
      this.$modal.hide('settings-modal');
      this.show = false;
    },
  },
};

</script>

<template>
	<t-modal
	 name="settings-modal"
   header="Settings"
   :clickToClose="false"
   :escToClose="true"
  >
    Font
    <t-input
      type="text"
      name="font"
      v-modal="forms.settingsForm.fontFamily"
    />
    <template v-slot:footer>
      <div class="flex justify-between">
        <t-button type="button"
        @click="$modal.hide('settings-modal')"> Cancel </t-button>
        <t-button type="button"> Ok </t-button>
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
      settingsForm: {
        fontFamily: 'Hack',
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
      this.$modal.show('settings-modal');
    },
  },
};

</script>

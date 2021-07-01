<template>
	<t-modal
	 name="settings-modal"
   header="Settings"
   :clickToClose="false"
   :escToClose="true"
  >
  <p> hi! </p>
  </t-modal>
</template>

<script>

export default {
  name: 'SettingsModal',
  created() {},
  data: () => ({

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

<template>
  <t-card>
    <t-button
      type="button"
      v-for="(char, keyChar) in $store.getters.charCodes"
      :key="keyChar"
      class="border-gray-200 p-2 min-h-0"
      @click="onCharChange(char)"
    >{{ char }}</t-button>
  </t-card>
</template>

<script>
export default {
  name: "CharPicker",
  async created() {},
  methods: {
    onCharChange(char) {
        this.$store.commit("changeChar", char);
    },
  },
};
</script>

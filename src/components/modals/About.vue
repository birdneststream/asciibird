<template>
  <t-modal name="about-modal" :click-to-close="false" :esc-to-close="true"
    @closed="$store.commit('closeModal', 'about')">
    <template v-slot:default>
      <div class="mt-6 lg:mt-0 rounded shadow bg-white text-center ">
        <BrushCanvas :blocks="aboutAscii" class="w-32 -right-40 relative" />

        <span class="p-2"><small class="text-blue-400 cursor-pointer"><a href="https://github.com/birdneststream/asciibird"
              target="_blank">Github</a></small></span>
        <h1 class="p-2 font-extrabold">
          Big Shout Outs to Patrons
        </h1>
        <span>shrew, octopus, j-hex, nes, mouse, dingo, eraser, pancakes</span>

        <h5 class="p-2 font-extrabold">
          Special Thanks to
        </h5>
        <span class="text-sm">special thanks to slime aka botmaster slime for the wonderful bot integration with
          asciibird</span>
      </div>
    </template>

    <template v-slot:footer>
      <div class="flex justify-between" @click="$store.commit('closeModal', 'about')">
        <t-button type="button" class="p-2 w-full">
          Ok
        </t-button>
      </div>
    </template>
  </t-modal>
</template>

<script>
import LZString from 'lz-string';
import BrushCanvas from "./../../components/parts/BrushCanvas.vue";
export default {
  name: "About",
  components: {
    BrushCanvas,
  },
  created() {},
  mounted() {
    if (this.showOptionsModal) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({}),
  computed: {
    showOptionsModal() {
      return this.$store.getters.modalState.about;
    },
    aboutAscii() {
      return JSON.parse(LZString.decompressFromEncodedURIComponent("NrDeF8BpQIgMwOYwFwAZIwMYAsCGAnFGAQRilkRXSz0ORgGUzp4k0McCiBhZit6pzowAkn1ZUOtImPIT2NLvQBC4ygqEy1AqUpgAlbZMXCAIn3KXolgLqQwViC3WDp9AG5GNbmAEYL1oFOwY6hdg5BjvKuegAKXjHChnIuusIAoglpRABqWSZaKToF9JlFxpr0AOoBIdbhwTAARmy+GKklMAAE4i0obdHZ9D1yfcgDHZXdva3txVMjkUHNs4Odi7BjE-M+Gyv9cxW7MwdrCyfjh956G7b2m6uTx6OPOze1L6dP75+XZ88sLZXRJEPZA-4-QGvI6QuqNcHfYRg6HXJEWBr7P6I0EfJYPL5vNG-bYwol40LkhoUuHU2mU+7lVFEAB6+XOjJB9AALmyfNheXoAJYC4QAZxFOI5QxgwqlnXFcvZzkJRFwCTCDPJytJRCaEvosu1TPohEVPgAJriaZEqVrrfa6RAbDYgA"));
    }
  },
  watch: {
    showOptionsModal(val) {
      if (val === true) {
        this.open();
      }

      if (val === false) {
        this.close();
      }
    },
  },
  methods: {
    open() {
      this.$modal.show("about-modal");
    },
    close() {
      this.$modal.hide("about-modal");
    },
  },
};
</script>

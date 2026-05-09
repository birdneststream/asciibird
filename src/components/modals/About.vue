<template>
  <ABModal :open="showAboutModal" @close="store.closeModal('about')" title="">
    <div class="mt-6 lg:mt-0 rounded shadow bg-white text-center ">
      <BrushCanvas
        :blocks="aboutAscii"
        class="w-32 -right-40 relative"
      />

      <span class="p-2"><small class="text-blue-400 cursor-pointer"><a
        href="https://github.com/birdneststream/asciibird"
        target="_blank"
      >Github</a></small></span>
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

    <template #footer>
      <div
        class="flex justify-between"
        @click="store.closeModal('about')"
      >
        <button
          type="button"
          class="ab-button p-2 w-full"
        >
          Ok
        </button>
      </div>
    </template>
  </ABModal>
</template>

<script>
import LZString from 'lz-string';
import BrushCanvas from "./../parts/BrushCanvas.vue";
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import { useClipboard } from '../../composables/useClipboard';
import ABModal from '../ABModal.vue';

export default {
  name: "About",
  components: {
    BrushCanvas,
  },
  setup() {
    const store = useAsciiBirdStore();
    const toast = useToast();
    const dialog = useDialog();
    const clipboard = useClipboard();
    return { store, toast, dialog, clipboard };
  },
  created() {},
  mounted() {
    if (this.showAboutModal) {
      this.open();
    } else {
      this.close();
    }
  },
  data: () => ({}),
  computed: {
    showAboutModal() {
      return this.store.modalState.about;
    },
    aboutAscii() {
      return JSON.parse(LZString.decompressFromEncodedURIComponent("NrDeF8BpQIgMwOYwFwAZIwMYAsCGAnFGAQRilkRXSz0ORgGUzp4k0McCiBhZit6pzowAkn1ZUOtImPIT2NLvQBC4ygqEy1AqUpgAlbZMXCAIn3KXolgLqQwViC3WDp9AG5GNbmAEYL1oFOwY6hdg5BjvKuegAKXjHChnIuusIAoglpRABqWSZaKToF9JlFxpr0AOoBIdbhwTAARmy+GKklMAAE4i0obdHZ9D1yfcgDHZXdva3txVMjkUHNs4Odi7BjE-M+Gyv9cxW7MwdrCyfjh956G7b2m6uTx6OPOze1L6dP75+XZ88sLZXRJEPZA-4-QGvI6QuqNcHfYRg6HXJEWBr7P6I0EfJYPL5vNG-bYwol40LkhoUuHU2mU+7lVFEAB6+XOjJB9AALmyfNheXoAJYC4QAZxFOI5QxgwqlnXFcvZzkJRFwCTCDPJytJRCaEvosu1TPohEVPgAJriaZEqVrrfa6RAbDYgA"));
    }
  },
  watch: {
    showAboutModal(val) {
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
    },
    close() {
    },
  },
};
</script>

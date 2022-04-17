import {
  mount,
  createLocalVue
} from '@vue/test-utils'
import Vuex from 'vuex'
import Editor from '@/views/Editor.vue'
import vuexStore from '../../src/store/index'
import {
  createNewAscii,
  exportMirc,
  mergeLayers,
  cyrb53,
  toolbarIcons
} from '../../src/ascii'
import 'jest-canvas-mock';
import hotkeysImport from 'hotkeys-js';

const localVue = createLocalVue()
localVue.use(Vuex)

// Test cases will cover most of asciibirds stuff
// Make new ascii
// Import ascii
// Change tabs ?
// Whatever tools on both


describe('Editor.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    store = vuexStore
    hotkeys = hotkeysImport

    // make a new ascii
    createNewAscii({
      createAscii: {
        title: 'New Test ASCII',
        width: 5,
        height: 5,
      }
    })   

  })

  it('create new ascii data is as expected', () => {
    const wrapper = mount(Editor, {
      store,
      localVue,
      hotkeys
    })

    expect(store.getters.asciibirdMeta[0]).toStrictEqual({
      "title": "New Test ASCII",
      "history": [],
      "historyIndex": 0,
      "x": 247,
      "y": 24,
      "layers": "᭣㰱ࢀ⌥ᡬƑ䁙ᰮ瀡J㠹怫䬡ȣᐦࠩዌT〣㠩㟹䰱晰䁮ż瀸¹∲䙬ਠ៮䐬峹祲Ɣ痆ᒈ⮺廋⦂仝䵫ࠕྍ⬡䳨゠גv͛㣬Ǭ眩᳊  ",
      "imageOverlay": {
        "url": null,
        "opacity": 95,
        "asciiOpacity": 100,
        "left": 0,
        "top": 0,
        "position": "centered",
        "size": 100,
        "repeatx": true,
        "repeaty": true,
        "visible": false,
        "stretched": false
      },
      "selectedLayer": 0
    });
  })


  it('new ascii exports as expected', () => {
    const wrapper = mount(Editor, {
      store,
      localVue,
      hotkeys
    })

    // Blank ascii exported to mIRC
    let mircExportHash = cyrb53(exportMirc(mergeLayers()).output.join(""));

    expect(mircExportHash).toEqual(182731023251036);
  })


  it('fill tool on new ascii and export', () => {
    const wrapper = mount(Editor, {
      store,
      localVue,
      hotkeys,
    })

    wrapper.vm.x = 1;
    wrapper.vm.y = 1;

    wrapper.vm.fill(false);
    
    // Black canvas fill
    let mircExportHash = cyrb53(exportMirc(mergeLayers()).output.join(""));
    expect(mircExportHash).toEqual(8495140863968528);
  })


  // it('brush tool on new ascii and export', () => {
  //   const wrapper = mount(Editor, {
  //     store,
  //     localVue,
  //     hotkeys,
  //     toolbarIcons
  //   })

  //   wrapper.vm.x = 0;
  //   wrapper.vm.y = 0;

  //   // console.log(exportMirc(mergeLayers()).output.join(""));

  //   store.commit('changeTool', 'brush');

  //   const canvasTools = wrapper.find('#canvastools')
  //   canvasTools.trigger('click');

  //   // console.log(exportMirc(mergeLayers()).output.join(""));
  // })



})

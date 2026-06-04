import {reactive} from "vue";

const viewStore = reactive({
  scroll: 0,
  defaultImagePath: null,
  isOverlayScrollInit: false,
  debugMode: false
});

export default viewStore;
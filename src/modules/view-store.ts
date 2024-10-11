import {reactive} from "vue";

const viewStore = reactive({
  scroll: 0,
  defaultImagePath: null,
  isOverlayScrollInit: false
});

export default viewStore;
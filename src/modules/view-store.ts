import {reactive} from "vue";

const viewStore = reactive({
  scroll: 0,
  defaultImagePath: null
});

export default viewStore;
import {ref} from "vue";

const title = ref("Test");
const message = ref("test");
const icon = ref("");
const autoDismissTime = ref(3000);
const progressBar = ref(false);
const progressAmount = ref(0);

const notificationActive = ref(false);

function displayNotification(notifyTitle: string, msg: string, dismissTime?: number) {
  title.value = notifyTitle;
  message.value = msg;
  autoDismissTime.value = dismissTime ?? 0;
  notificationActive.value = true;
}

export function useNotification() {
  return {title, message, icon, autoDismissTime, progressBar, progressAmount, notificationActive, displayNotification}
}
<template>
    <label @click="click" class="top-button" :for="checkFor">
        <i class="material-icons-outlined">{{button.icon}}</i>
        <span>{{button.name}}</span>
    </label>
</template>

<script>
import {ipcRenderer} from 'electron'
export default {
    props: ['button'],
    computed: {
        checkFor(item) {
            if (item.button.for == null) {
                return
            }
            return item.button.for;
        }
    },
    methods: {
        click() {
            switch(this.button.id) {
                case "removeLibrary":
                    ipcRenderer.send('deleteLibrary')
                    break;
            }
        }
    }
}
</script>

<style scoped>
.top-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 20px;
}

.top-button:hover {
    opacity: 0.5;
}

.top-button i {
    font-size: 20px;
}

.top-button span {
    margin-left: 5px;
    font-size: 14px;
}
</style>
<template>
    <Button class="button-right" :button="button"/>
</template>

<script>
import Button from '../../StandardButton.vue'

export default {
    props: ['button'],
    components: {
        Button
    }
}
</script>
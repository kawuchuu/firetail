<template>
    <Button class="button-right" :button="button"/>
</template>

<script>
import Button from '@/components/StandardButton'

export default {
    props: ['button'],
    components: {
        Button
    }
}
</script>
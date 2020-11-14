<template>
    <Button class="button-right" :button="button"/>
</template>

<script>
import Button from '@/components/Button'

export default {
    props: ['button'],
    components: {
        Button
    }
}
</script>
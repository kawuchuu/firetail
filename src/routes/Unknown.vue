<template>
<div>
  <h1>No component associated with this path</h1>
  <p>Path: {{route.fullPath}}</p>
  <p>This shouldn't appear during normal use. Please consider posting an issue on GitHub if this is unexpected.</p>
</div>
</template>

<script lang="ts" setup>
import {useRoute} from "vue-router";

const route = useRoute();
</script>
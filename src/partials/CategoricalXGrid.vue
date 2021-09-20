<template>
  <Grid>
    <line
      v-for="label in displayLabels"
      :key="label.label"
      :x1="label.canvasX"
      :y1="0"
      :x2="label.canvasX"
      :y2="canvasHeight"
    ></line>
  </Grid>
</template>

<script>
  import Grid from './Grid';

  export default {
    components: { Grid },
    props: {
      displayLabels: Array,
      canvasHeight: Number
    }
  };
</script>

<template>
  <Grid>
    <line
      v-for="(yTick, index) in displayYTicks"
      :key="index"
      :x1="0"
      :y1="yTick.canvasValue"
      :x2="100"
      :y2="yTick.canvasValue"
    ></line>
  </Grid>
</template>

<script>
  import Grid from './Grid';

  export default {
    components: { Grid },

    props: {
      displayYTicks: Array
    }
  };
</script>

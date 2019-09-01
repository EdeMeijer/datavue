<template>
  <g class="datavue-grid">
    <line
      v-for="(yTick, index) in displayYTicks"
      :key="index"
      :x1="0"
      :y1="yTick.canvasValue"
      :x2="100"
      :y2="yTick.canvasValue"
    ></line>
  </g>
</template>

<script>
  export default {
    props: {
      displayYTicks: Array
    }
  };
</script>

<template>
  <g class="datavue-grid">
    <line
      v-for="label in displayLabels"
      :key="label.label"
      :x1="label.canvasX"
      :y1="0"
      :x2="label.canvasX"
      :y2="canvasHeight"
    ></line>
  </g>
</template>

<script>
  export default {
    props: {
      displayLabels: Array,
      canvasHeight: Number
    }
  };
</script>

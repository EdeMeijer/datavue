<template>
  <g class="datavue-bar-group">
    <rect
      class="datavue-bar-group-outline"
      :x="group.canvasX"
      :width="width"
      :y="yNorm"
      :height="heightNorm"
    ></rect>
    <slot></slot>
  </g>
</template>

<script>
  export default {
    props: {
      group: Object,
      width: Number
    },
    computed: {
      yNorm () {
        if (this.group.canvasHeight < 0) {
          return this.group.canvasY + this.group.canvasHeight;
        }
        return this.group.canvasY;
      },
      heightNorm () {
        return Math.abs(this.group.canvasHeight);
      }
    }
  };
</script>

<style lang="scss">
  .datavue-bar-group-outline {
    fill: transparent;
    stroke: rgba(0, 0, 0, 0.5);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }
</style>

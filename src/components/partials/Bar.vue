<template>
  <rect
    :class="['datavue-bar', {hover: hover}, `datavue-serie-${sidx + 1}`]"
    :x="x"
    :width="width"
    :y="yNorm"
    :height="heightNorm"
  ></rect>
</template>

<script>
  export default {
    props: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      sidx: Number,
      hover: Boolean
    },
    computed: {
      yNorm () {
        if (this.height < 0) {
          return this.y + this.height;
        }
        return this.y;
      },
      heightNorm () {
        return Math.abs(this.height);
      }
    }
  };
</script>

<style lang="scss">
  .datavue-bar {
    opacity: 0.7;

    .datavue-series & {
      stroke: rgba(0, 0, 0, 0.5);
      stroke-width: 1px;
      vector-effect: non-scaling-stroke;
    }

    &.hover {
      opacity: 1.0;
    }
  }
</style>

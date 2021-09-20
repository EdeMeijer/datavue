<template>
  <div class="datavue-legend">
    <div
      v-for="(serie, sidx) in series"
      :key="sidx"
      :class="[`datavue-serie-${sidx + 1}`]"
      :style="{'background-color': serie.color}"
    >
      <slot name="serie" :serie="serie">
        {{ serie.name }}
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      series: Array
    }
  };
</script>

<style lang="scss">
  @import "src/assets/variables";

  .datavue-legend {
    font-size: 0.9em;
    position: absolute;
    left: 0;
    right: 0;

    .with-grid & {
      left: -$grid-margin-left;
      right: -$grid-margin-right;
    }
    margin-top: 2em;
    opacity: 0.65;

    & > div {
      line-height: 20px;
      font-size: 1em;
      padding: 0 10px;
      color: white;
      border-radius: 5px;
      text-align: center;
      float: left;
      margin-right: 10px;
    }
  }
</style>

<template>
  <div class="datavue-y-ticks">
    <span
      v-for="(tick, index) in displayYTicks"
      :key="index"
      :style="{top: `${tick.percentValue}%`}"
    >
      <span>
        <slot name="value" :value="tick.value">{{ tick.value }}</slot>
      </span>
    </span>
  </div>
</template>

<script>
  export default {
    props: {
      displayYTicks: Array
    }
  };
</script>

<style lang="scss">
  .datavue-y-ticks {
    font-size: 0.8em;
    position: absolute;
    top: 0;
    bottom: 0;

    & > span {
      position: absolute;
      left: 0;

      & > span {
        display: inline-block;
        position: relative;
        left: -100%;
        top: -10px;
        padding-right: 10px;
        white-space: nowrap;
      }
    }
  }
</style>

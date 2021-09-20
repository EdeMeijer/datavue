<template>
  <div
    v-if="tooltip"
    class="datavue-tooltip-wrapper"
    :style="{left: `${tooltip.left}%`, top: `${tooltip.top}%`}"
  >
    <div :class="['datavue-tooltip', `datavue-align-${tooltip.align}`]">
      <div class="datavue-tooltip-header">
        <slot name="label" :label="tooltip.label">{{ tooltip.label.label }}</slot>
      </div>
      <div class="datavue-tooltip-body">
        {{ tooltip.serie }}:
        <slot name="value" :value="tooltip.value">{{ tooltip.value }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      tooltip: Object
    }
  };
</script>

<style lang="scss">
  .datavue-tooltip-wrapper {
    position: absolute;
    z-index: 1000;
  }

  .datavue-tooltip {
    font-size: 0.9em;
    background-color: white;
    border-radius: .25rem;
    position: absolute;
    bottom: 0;
    margin-bottom: 10px;
    overflow: hidden;
    box-shadow: 0 0 5px black;
    text-align: center;

    &.datavue-align-left {
      left: 0;
    }

    &.datavue-align-right {
      right: 0;
    }
  }

  .datavue-tooltip-header {
    padding: 5px;
    background-color: #CCC;
    font-weight: bold;
    white-space: nowrap;
  }

  .datavue-tooltip-body {
    padding: 5px;
    white-space: nowrap;
  }
</style>

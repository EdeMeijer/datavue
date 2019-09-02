<template>
  <div class="datavue-labels">
    <span
      v-for="label in displayLabels"
      :key="label.name"
      :style="{left: `${label.canvasX}%`}"
    >
      <span>
        <slot name="label" :label="label">{{ label.name }}</slot>
      </span>
    </span>
  </div>
</template>

<script>
  export default {
    props: {
      displayLabels: Array
    }
  };
</script>

<style lang="scss">
  .datavue-labels {
    font-size: 0.8em;
    position: absolute;
    left: 0;
    right: 0;

    & > span {
      position: absolute;
      bottom: -20px;
      left: 0;

      & > span {
        position: relative;
        left: -50%;
        white-space: nowrap;
      }
    }
  }
</style>

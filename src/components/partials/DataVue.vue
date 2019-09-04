<template>
  <div class="datavue">
    <span class="datavue-title">{{ title }}</span>
    <div class="datavue-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String
    }
  };
</script>

<style lang="scss">
  @import "../../assets/variables.scss";

  .datavue {
    position: relative;
    padding: 0;

    &.with-legend {
      padding-bottom: 51px;
    }

    &.with-grid {
      padding-left: $grid-margin-left;
      padding-right: $grid-margin-right;
    }
  }

  .datavue-title {
    display: block;
    text-align: center;
    margin: 10px 0;
    font-weight: bold;
    font-size: 0.9em;
  }

  .datavue-wrapper {
    position: relative;

    svg {
      vertical-align:top;
    }
  }
</style>

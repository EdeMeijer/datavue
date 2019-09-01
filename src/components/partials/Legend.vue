<template>
  <div class="datavue-legend">
    <div
      v-for="(serie, sidx) in series"
      :key="sidx"
      :class="[`datavue-serie-${sidx + 1}`]"
    >{{ serie.name }}
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
  .datavue-legend {
    font-size: 0.9em;
    position: absolute;
    left: -35px;
    right: -15px;
    margin-top: 2em;
    opacity: 0.65;

    & > div {
      line-height: 0.9em;
      padding: 4px 10px 2px 10px;
      color: white;
      border-radius: 5px;
      text-align: center;
      float: left;
      margin-right: 10px;
    }
  }
</style>

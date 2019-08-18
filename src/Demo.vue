<template>
  <div id="demo">
    <div id="wrapper">
      <BarChart title="Demo chart" :labels="labels" :series="series">
        <template v-slot:value="{ value }">
          {{ value }}%
        </template>
        <template v-slot:label="{ label }">
          custom {{ label.label }}
        </template>
      </BarChart>
    </div>
  </div>
</template>

<script>
import BarChart from './components/BarChart';

export default {
  components: { BarChart },
  data () {
    return {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      series: [
        {
          data: [5, 2, 8, 14, 2, 6]
        }
      ]
    };
  }
};
</script>

<style>
  #wrapper {
    width: 500px;
    margin: 100px auto;
  }
</style>

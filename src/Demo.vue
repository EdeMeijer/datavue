<template>
  <div id="demo">
    <div class="wrapper">
      <BarChart title="Demo bar chart" v-bind="chart">
        <template v-slot:value="{ value }">
          {{ value }}%
        </template>
        <template v-slot:label="{ label }">
          custom {{ label.name }}
        </template>
      </BarChart>
    </div>
    <div class="wrapper">
      <StackedBarChart title="Demo stacked bar chart" v-bind="chart">
        <template v-slot:value="{ value }">
          {{ value }}%
        </template>
        <template v-slot:label="{ label }">
          custom {{ label.name }}
        </template>
      </StackedBarChart>
    </div>
    <div class="wrapper">
      <PieChart title="Demo pie chart" v-bind="pie"></PieChart>
    </div>
    <div class="wrapper">
      <PieChart title="Demo pie chart (custom colors)" v-bind="pie2">
        <template v-slot:value="{ value }">
          {{ value }} !!
        </template>
        <template v-slot:label="{ label }">
          L: {{ label.name }}
        </template>
      </PieChart>
    </div>
  </div>
</template>

<script>
  import BarChart from './components/BarChart';
  import StackedBarChart from './components/StackedBarChart/StackedBarChart';
  import PieChart from './components/PieChart/PieChart';

  export default {
    components: { PieChart, StackedBarChart, BarChart },
    data () {
      return {
        chart: {
          labels: ['a', 'b', 'c', 'd', 'e', 'f'],
          series: [
            {
              name: 'Total foo',
              data: [5, 2, 8, 14, 2, 6]
            },
            {
              name: 'Total bar',
              data: [1, 7, 1, null, -3, -1]
            },
            {
              name: 'Total qux',
              data: [1, 3, null, 4, 8, null]
            }
          ]
        },
        pie: {
          labels: ['a', 'b', 'c', 'd', 'e', 'f'],
          data: [5, 2, 8, 14, 2, 2]
        },
        pie2: {
          labels: ['fatal', 'error', 'warn', 'info', 'debug'],
          data: [2, 9, 3, 10, 15],
          colors: [
            '#880746',
            '#bf180d',
            '#ae5c00',
            '#565989',
            '#aaa9aa'
          ]
        }
      };
    }
  };
</script>

<style>
  .wrapper {
    width: 500px;
    margin: 30px auto;
    background-color: #ebe8f2;
    padding: 30px;
    border-radius: 5px;
  }
</style>

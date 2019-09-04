<template>
  <div id="demo">
    <div class="wrapper">
      <BarChart title="Demo bar chart" v-bind="chart">
        <template v-slot:value="{ value }">
          {{ value }}%
        </template>
        <template v-slot:label="{ label }">
          Such {{ label.name }}
        </template>
      </BarChart>
    </div>
    <div class="wrapper">
      <StackedBarChart title="Demo stacked bar chart" v-bind="chart">
        <template v-slot:value="{ value }">
          {{ value }}%
        </template>
        <template v-slot:label="{ label }">
          My {{ label.name }}
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
    <div class="wrapper">
      <Gauge title="Demo gauge" v-bind="gauge">
        <template v-slot:value="{ value }">
          {{ value }}%
        </template>
      </Gauge>
    </div>
  </div>
</template>

<script>
  import BarChart from './components/BarChart';
  import StackedBarChart from './components/StackedBarChart/StackedBarChart';
  import PieChart from './components/PieChart/PieChart';
  import Gauge from './components/Gauge/Gauge';

  export default {
    components: { Gauge, PieChart, StackedBarChart, BarChart },
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
          labels: ['fatal', 'error', 'info', 'debug'],
          data: [1, 3, 7, 19],
          colors: [
            '#880746',
            '#bf180d',
            '#565989',
            '#aaa9aa'
          ]
        },
        gauge: {
          value: 78,
          max: 100
        }
      };
    }
  };
</script>

<style>
  body {
    font-family: sans-serif;
  }

  .wrapper {
    width: 400px;
    margin: 15px;
    float: left;
    background-color: #ebe8f2;
    padding: 30px;
    border-radius: 5px;
  }
</style>

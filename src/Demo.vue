<template>
    <div id="demo">
        <div class="wrapper">
            <BarChart title="Demo bar chart" :labels="labels" :series="series">
                <template v-slot:value="{ value }">
                    {{ value }}%
                </template>
                <template v-slot:label="{ label }">
                    custom {{ label.label }}
                </template>
            </BarChart>
        </div>
        <div class="wrapper">
            <StackedBarChart title="Demo stacked bar chart" :labels="labels" :series="series">
                <template v-slot:value="{ value }">
                    {{ value }}%
                </template>
                <template v-slot:label="{ label }">
                    custom {{ label.label }}
                </template>
            </StackedBarChart>
        </div>
    </div>
</template>

<script>
    import BarChart from './components/BarChart';
    import StackedBarChart from './components/StackedBarChart/StackedBarChart';

    export default {
        components: { StackedBarChart, BarChart },
        data () {
            return {
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
            };
        }
    };
</script>

<style>
    .wrapper {
        width: 500px;
        margin: 100px auto;
        background-color: #EEE;
    }
</style>

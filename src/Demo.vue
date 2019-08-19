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
                        name: 'Foo',
                        data: [5, 2, 8, 14, 2, 6]
                    },
                    {
                        name: 'Bar',
                        data: [1, 7, 1, null, -3, -1]
                    },
                    {
                        name: 'Qux',
                        data: [1, 3, null, 4, 8, null]
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
        background-color: #EEE;
    }
</style>

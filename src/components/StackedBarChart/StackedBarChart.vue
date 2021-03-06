<template>
  <DataVue :title="title" class="with-grid with-legend">
    <svg :viewBox="viewBox">
      <YGrid :displayYTicks="displayYTicks"/>
      <CategoricalXGrid :displayLabels="displayLabels" :canvasHeight="canvasHeight"/>

      <BarGroup
        v-for="(group, pidx) in displayData"
        :key="labels[pidx]"
        :group="group"
        :width="xWidth"
      >
        <Bar
          v-for="(point, sidx) in group.points"
          :key="sidx"
          :sidx="sidx"
          :x="group.canvasX"
          :width="xWidth"
          :y="point.canvasY"
          :height="point.canvasHeight"
          :hover="point.hover"
          @mouseover.native="highlight(point)"
          @mouseout.native="unhighlight()"
        />
      </BarGroup>
    </svg>

    <Labels :displayLabels="displayLabels">
      <template v-slot:label="{ label }">
        <slot name="label" :label="label">{{ label.name }}</slot>
      </template>
    </Labels>
    <YTicks :displayYTicks="displayYTicks">
      <template v-slot:value="{ value }">
        <slot name="value" :value="value">{{ value }}</slot>
      </template>
    </YTicks>

    <Tooltip :tooltip="tooltip">
      <template v-slot:value="{ value }">
        <slot name="value" :value="value">{{ value }}</slot>
      </template>
      <template v-slot:label="{ label }">
        <slot name="label" :label="label">{{ label.name }}</slot>
      </template>
    </Tooltip>

    <Legend :series="series"/>
  </DataVue>
</template>

<script>
  import { max, min } from 'lodash-es';
  import Legend from '../partials/Legend';
  import Tooltip from '../partials/Tooltip';
  import Bar from '../partials/Bar';
  import BarGroup from '../partials/BarGroup';
  import chartMixin from '../mixins/chartMixin';
  import yAxisMixin from '../mixins/yAxisMixin';
  import YTicks from '../partials/YTicks';
  import Labels from '../partials/Labels';
  import categoricalXAxisMixin from '../mixins/categoricalXAxisMixin';
  import YGrid from '../partials/YGrid';
  import CategoricalXGrid from '../partials/CategoricalXGrid';
  import DataVue from '../partials/DataVue';

  export default {
    name: 'stacked-bar-chart',
    components: { DataVue, CategoricalXGrid, YGrid, Labels, YTicks, BarGroup, Bar, Tooltip, Legend },
    mixins: [chartMixin, yAxisMixin, categoricalXAxisMixin],
    props: {
      series: { type: Array, required: true }
    },
    computed: {
      dataMax () {
        return max(this.groupedData.map(g => max(g.points.map(p => p.accumValue))));
      },
      dataMin () {
        return min(this.groupedData.map(g => min(g.points.map(p => p.accumValue))));
      },
      groupedData () {
        const accumPos = this.labels.map(() => 0.0);
        const accumNeg = this.labels.map(() => 0.0);

        const groups = this.labels.map(() => ({
          min: 0,
          max: 0,
          points: []
        }));

        this.series.forEach((serie) => {
          serie.data.forEach((value, pidx) => {
            const accum = value >= 0.0 ? accumPos : accumNeg;
            const base = accum[pidx];
            accum[pidx] += value;
            const accumValue = accum[pidx];
            const group = groups[pidx];

            group.min = Math.min(group.min, accumValue);
            group.max = Math.max(group.max, accumValue);
            group.points.push({ value, base, accumValue });
          });
        });

        return groups;
      },
      displayData () {
        const { sidx: hoverSidx = null, pidx: hoverPidx = null } = (this.selectedTooltip || {});

        return this.groupedData.map(({ min, max, points }, pidx) => {
          return {
            canvasX: this.xScale.project(pidx * (1 + this.xGap)),
            min,
            max,
            canvasHeight: this.yScaleCanvas.scale(max - min),
            canvasY: this.yScaleCanvas.project(min),
            points: points.map(({ value, base, accumValue }, sidx) => {
              return {
                value,
                base,
                accumValue,
                sidx,
                pidx,
                hover: hoverSidx === sidx && hoverPidx === pidx,
                canvasHeight: this.yScaleCanvas.scale(value),
                canvasY: this.yScaleCanvas.project(base)
              };
            })
          };
        });
      },
      tooltip () {
        if (this.selectedTooltip === null) {
          return null;
        }
        const { sidx, pidx } = this.selectedTooltip;
        const serie = this.series[sidx].name;
        const group = this.displayData[pidx];
        const point = group.points[sidx];
        const label = this.labels[pidx];
        const align = group.canvasX > 50 ? 'right' : 'left';

        return {
          align,
          left: group.canvasX + (align === 'right' ? this.xWidth : 0),
          label: { name: label, i: pidx },
          serie,
          value: point.value,
          top: this.yScalePercent.project(Math.max(point.accumValue, point.base, 0))
        };
      }
    }
  };
</script>

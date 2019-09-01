<template>
  <DataVue :title="title">
    <svg :viewBox="viewBox">
      <YGrid :displayYTicks="displayYTicks"/>
      <CategoricalXGrid :displayLabels="displayLabels" :canvasHeight="canvasHeight"/>

      <g class="datavue-series" v-for="(serie, sidx) in this.displaySeries" :key="sidx">
        <Bar
          v-for="(point, pidx) in serie"
          :key="labels[pidx]"
          :sidx="sidx"
          :x="point.canvasX"
          :width="barWidth"
          :y="point.canvasY"
          :height="point.canvasHeight"
          :hover="point.hover"
          @mouseover.native="highlight(point)"
          @mouseout.native="unhighlight()"
        />
      </g>
    </svg>

    <Labels :displayLabels="displayLabels">
      <template v-slot:label="{ label }">
        <slot name="label" :label="label">{{ label.label }}</slot>
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
        <slot name="label" :label="label">{{ label.label }}</slot>
      </template>
    </Tooltip>

    <Legend :series="series"/>
  </DataVue>
</template>

<script>
  import { max, min } from 'lodash-es';
  import Legend from '../partials/Legend';
  import Tooltip from '../partials/Tooltip';
  import Scale from '../../Scale';
  import Bar from '../partials/Bar';
  import chartMixin from '../mixins/chartMixin';
  import yAxisMixin from '../mixins/yAxisMixin';
  import YTicks from '../partials/YTicks';
  import Labels from '../partials/Labels';
  import categoricalXAxisMixin from '../mixins/categoricalXAxisMixin';
  import YGrid from '../partials/YGrid';
  import CategoricalXGrid from '../partials/CategoricalXGrid';
  import DataVue from '../partials/DataVue';

  export default {
    name: 'bar-chart',
    components: { DataVue, CategoricalXGrid, YGrid, Labels, YTicks, Bar, Tooltip, Legend },
    mixins: [chartMixin, yAxisMixin, categoricalXAxisMixin],
    data () {
      return {
        defaultOptions: {
          xAxis: {
            barGap: 0.25
          }
        }
      };
    },
    computed: {
      xSubGap () {
        return this.mergedOptions.xAxis.barGap;
      },
      xSubMax () {
        const n = this.series.length;
        return n + (n - 1) * this.xSubGap;
      },
      xSubScale () {
        return new Scale(0, this.xSubMax, 0, 1);
      },
      barWidth () {
        return this.xScale.scale(this.xSubScale.scale(1));
      },
      dataMax () {
        return max(this.series.map(s => max(s.data)));
      },
      dataMin () {
        return min(this.series.map(s => min(s.data)));
      },
      displaySeries () {
        const { sidx: hoverSidx = null, pidx: hoverPidx = null } = (this.selectedTooltip || {});

        return this.series.map((serie, sidx) => {
          return serie.data.map((value, pidx) => {
            return {
              value,
              sidx,
              pidx,
              hover: hoverSidx === sidx && hoverPidx === pidx,
              canvasX: this.xScale.project(pidx * (1 + this.xGap) + this.xSubScale.project(sidx * (1 + this.xSubGap))),
              canvasHeight: this.yScaleCanvas.scale(value),
              canvasY: this.yScaleCanvas.project(0)
            };
          });
        });
      },
      tooltip () {
        if (this.selectedTooltip === null) {
          return null;
        }
        const { sidx, pidx } = this.selectedTooltip;
        const serie = this.series[sidx].name;
        const point = this.displaySeries[sidx][pidx];
        const label = this.labels[point.pidx];
        const align = point.canvasX > 50 ? 'right' : 'left';
        return {
          align,
          left: point.canvasX + (align === 'right' ? this.barWidth : 0),
          label: { label, i: point.pidx },
          serie,
          value: point.value,
          top: this.yScalePercent.project(Math.max(point.value, 0))
        };
      }
    }
  };
</script>

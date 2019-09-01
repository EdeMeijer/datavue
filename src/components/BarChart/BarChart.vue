<template>
  <div class="datavue">
    <span class="datavue-title">{{ title }}</span>
    <div class="datavue-wrapper">
      <svg style="vertical-align:top;" :viewBox="viewBox">
        <g class="datavue-grid">
          <line
            v-for="label in displayLabels"
            :key="label.label"
            class="datavue-grid-y"
            :x1="label.canvasX"
            :y1="0"
            :x2="label.canvasX"
            :y2="canvasHeight"
          ></line>

          <line
            v-for="(yTick, index) in displayYTicks"
            :key="index"
            class="datavue-grid-x"
            :x1="0"
            :y1="yTick.canvasValue"
            :x2="100"
            :y2="yTick.canvasValue"
          ></line>
        </g>

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
    </div>
  </div>
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

  export default {
    name: 'bar-chart',
    components: { Labels, YTicks, Bar, Tooltip, Legend },
    mixins: [chartMixin, yAxisMixin],
    props: {
      labels: { type: Array, required: true }
    },
    data () {
      return {
        defaultOptions: {
          xAxis: {
            gap: 0.5,
            barGap: 0.25,
            maxTicks: 6,
            skipTicks: 0,
            margin: 0.01
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
      xGap () {
        return this.mergedOptions.xAxis.gap;
      },
      xMin () {
        return 0;
      },
      xMax () {
        const n = this.labels.length;
        return n + (n - 1) * this.xGap;
      },
      xPadding () {
        return (this.xMax - this.xMin) * this.mergedOptions.xAxis.margin;
      },
      xMaxPadded () {
        return this.xMax + this.xPadding;
      },
      xMinPadded () {
        return this.xMin - this.xPadding;
      },
      xScale () {
        return new Scale(this.xMinPadded, this.xMaxPadded, 0, 100);
      },
      xWidth () {
        return this.xScale.scale(1);
      },
      barWidth () {
        return this.xScale.scale(this.xSubScale.scale(1));
      },
      canvasHeight () {
        return 100 / this.mergedOptions.aspect;
      },
      dataMax () {
        return max(this.series.map(s => max(s.data)));
      },
      dataMin () {
        return min(this.series.map(s => min(s.data)));
      },
      effectiveSkipLabels () {
        const maxLabels = this.mergedOptions.xAxis.maxTicks;
        const skipLabels = this.mergedOptions.xAxis.skipTicks;
        if (maxLabels === null) {
          return skipLabels;
        }
        const skip = Math.ceil(this.labels.length / maxLabels) - 1;
        return Math.max(skip, skipLabels);
      },
      displayLabels () {
        return this.labels
          .map((label, i) => ({ label, i }))
          .filter(({ i }) => i % (this.effectiveSkipLabels + 1) === 0)
          .map(({ label, i }) => {
            return {
              label,
              i,
              canvasX: this.xScale.project(i * (1 + this.xGap) + 0.5)
            };
          });
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

<style lang="scss">
  .datavue {
    padding: 0 15px 51px 35px;
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
  }

  .datavue-grid line {
    stroke: rgba(0, 0, 0, 0.5);
    stroke-width: 0.15
  }

  .datavue-serie-1 {
    fill: #3490DC;
    background-color: #23679f;
  }

  .datavue-serie-2 {
    fill: #42c17c;
    background-color: #298a55;
  }

  .datavue-serie-3 {
    fill: #c4aa42;
    background-color: #9d8832;
  }

  .datavue-serie-4 {
    fill: #c45c40;
    background-color: #b95337;
  }

  .datavue-serie-5 {
    fill: #c46287;
    background-color: #aa5273;
  }

  .datavue-serie-6 {
    fill: #9163c4;
    background-color: #7b4eac;
  }
</style>

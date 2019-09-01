<template>
  <div class="datavue">
    <span class="datavue-title">{{ title }}</span>
    <div class="datavue-wrapper">
      <svg style="vertical-align:top;" :viewBox="viewBox">
        <g class="datavue-grid">
          <line
            v-for="label in displayXTicks"
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
            @mouseover.native="highlight(point)"
            @mouseout.native="unhighlight()"
          />
        </BarGroup>
      </svg>

      <div class="datavue-labels">
        <span
          v-for="label in displayXTicks"
          :key="label.label"
          :style="{left: `${label.canvasX}%`}"
        >
          <span>
            <slot name="label" :label="label">{{ label.label }}</slot>
          </span>
        </span>
      </div>

      <div class="datavue-y-ticks">
        <span
          v-for="(tick, index) in displayYTicks"
          :key="index"
          :style="{top: `${tick.percentValue}%`}"
        >
          <span>
            <slot name="value" :value="tick.value">{{ tick.value }}</slot>
          </span>
        </span>
      </div>

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
  import preferred from 'preferred';
  import optionsMixin from '../mixins/optionsMixin';
  import Legend from '../partials/Legend';
  import Tooltip from '../partials/Tooltip';
  import Scale from '../../Scale';
  import Bar from '../partials/Bar';
  import BarGroup from '../partials/BarGroup';

  export default {
    name: 'stacked-bar-chart',
    components: { BarGroup, Bar, Tooltip, Legend },
    mixins: [optionsMixin],
    props: {
      title: { type: String, required: true },
      labels: { type: Array, required: true },
      series: { type: Array, required: true }
    },
    data () {
      return {
        selectedTooltip: null,
        defaultOptions: {
          aspect: 1.5,
          xAxis: {
            gap: 0.5,
            maxTicks: 6,
            skipTicks: 0,
            margin: 0.01
          },
          yAxis: {
            maxTicks: 6,
            preferredNumbers: [1, 2, 2.5, 4, 5],
            preferredNumberBase: 10,
            margin: 0.02
          }
        }
      };
    },
    computed: {
      preferredSeq () {
        return preferred.sequence(
          this.mergedOptions.yAxis.preferredNumbers,
          this.mergedOptions.yAxis.preferredNumberBase
        );
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
      canvasHeight () {
        return 100 / this.mergedOptions.aspect;
      },
      dataMax () {
        return max(this.groupedData.map(g => max(g.points.map(p => p.accumValue))));
      },
      dataMin () {
        return min(this.groupedData.map(g => min(g.points.map(p => p.accumValue))));
      },
      yMax () {
        return Math.max(0, this.dataMax);
      },
      yMin () {
        return Math.min(0, this.dataMin);
      },
      yRange () {
        return this.yMax - this.yMin;
      },
      yPadding () {
        return this.yRange * this.mergedOptions.yAxis.margin;
      },
      yRangePadded () {
        return this.yRange + 2 * this.yPadding;
      },
      yMaxPadded () {
        return this.yMax + this.yPadding;
      },
      yMinPadded () {
        return this.yMin - this.yPadding;
      },
      yScaleCanvas () {
        return new Scale(this.yMinPadded, this.yMaxPadded, this.canvasHeight, 0);
      },
      yScalePercent () {
        return new Scale(this.yMinPadded, this.yMaxPadded, 100, 0);
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
      displayXTicks () {
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
      yTicks () {
        const maxYTicks = this.mergedOptions.yAxis.maxTicks;
        const spacingBounds = this.preferredSeq.bounds(this.yRangePadded / (maxYTicks - 1));

        // First try the small/floor spacing
        const ticks = this.getYTicksForSpacing(spacingBounds.floor);
        if (ticks.length <= maxYTicks) {
          return ticks;
        }
        // Too many labels, use the bigger/ceil spacing
        return this.getYTicksForSpacing(spacingBounds.ceil);
      },
      displayYTicks () {
        return this.yTicks.map(value => {
          return {
            value,
            percentValue: this.yScalePercent.project(value),
            canvasValue: this.yScaleCanvas.project(value)
          };
        });
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
      viewBox () {
        return `0 0 100 ${this.canvasHeight}`;
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
          label: { label, i: point.pidx },
          serie,
          value: point.value,
          top: this.yScalePercent.project(Math.max(point.accumValue, point.base, 0))
        };
      }
    },
    methods: {
      getYTicksForSpacing (spacing) {
        const result = [];
        let next = Math.ceil(this.yMinPadded / spacing) * spacing;
        while (next <= this.yMaxPadded) {
          result.push(next);
          next += spacing;
        }
        return result;
      },
      highlight (point) {
        this.$data.selectedTooltip = { sidx: point.sidx, pidx: point.pidx };
      },
      unhighlight () {
        this.$data.selectedTooltip = null;
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

  .datavue-labels {
    font-size: 0.8em;
    position: absolute;
    left: 0;
    right: 0;

    & > span {
      position: absolute;
      bottom: -20px;
      left: 0;

      & > span {
        position: relative;
        left: -50%;
        white-space: nowrap;
      }
    }
  }

  .datavue-y-ticks {
    font-size: 0.8em;
    position: absolute;
    top: 0;
    bottom: 0;

    & > span {
      position: absolute;
      left: 0;

      & > span {
        display: inline-block;
        position: relative;
        left: -100%;
        top: -10px;
        padding-right: 10px;
        white-space: nowrap;
      }
    }
  }
</style>

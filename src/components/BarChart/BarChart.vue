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
        <g class="datavue-series" v-for="(serie, sidx) in this.displaySeries" :key="sidx">
          <rect
            v-for="(point, pidx) in serie"
            :key="labels[pidx]"
            :class="['datavue-bar', {hover: point.hover}, `datavue-serie-${sidx + 1}`]"
            :x="point.canvasX"
            :width="barWidth"
            :y="point.canvasBase"
            :height="point.canvasHeight"
            @mouseover="highlight(point)"
            @mouseout="unhighlight()"
          ></rect>
        </g>
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
          :style="{top: `${tick.unitValue * 100}%`}"
        >
          <span>
            <slot name="value" :value="tick.value">{{ tick.value }}</slot>
          </span>
        </span>
      </div>
      <div
        v-if="tooltip"
        class="datavue-tooltip-wrapper"
        :style="{left: `${tooltip.left}%`, top: `${tooltip.top}%`}"
      >
        <div :class="['datavue-tooltip', `datavue-align-${tooltip.align}`]">
          <div class="datavue-tooltip-header">
            <slot name="label" :label="tooltip.label">{{ tooltip.label.label }}</slot>
          </div>
          <div class="datavue-tooltip-body">
            {{ tooltip.serie }}:
            <slot name="value" :value="tooltip.value">{{ tooltip.value }}</slot>
          </div>
        </div>
      </div>
      <div class="datavue-legend">
        <div
          v-for="(serie, sidx) in series"
          :key="sidx"
          :class="[`datavue-serie-${sidx + 1}`]"
        >{{ serie.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { isArray, max, mergeWith, min } from 'lodash-es';
  // import isArray from 'lodash-es/isArray'
  import preferred from 'preferred';

  export default {
    name: 'BarChart',
    props: {
      title: { type: String, required: true },
      labels: { type: Array, required: true },
      series: { type: Array, required: true },
      options: { type: Object, default: () => ({}) }
    },
    data () {
      return {
        selectedTooltip: null,
        defaultOptions: {
          aspect: 1.5,
          xAxis: {
            gap: 0.5,
            barGap: 0.25,
            maxTicks: 6,
            skipTicks: 0
          },
          yAxis: {
            maxTicks: 6,
            preferredNumbers: [1, 2, 2.5, 4, 5],
            preferredNumberBase: 10
          }
        }
      };
    },
    computed: {
      mergedOptions () {
        function customizer (objValue, srcValue) {
          if (isArray(srcValue)) {
            return srcValue;
          }
        }

        return mergeWith({}, this.defaultOptions, this.options, customizer);
      },
      preferredSeq () {
        return preferred.sequence(
          this.mergedOptions.yAxis.preferredNumbers,
          this.mergedOptions.yAxis.preferredNumberBase
        );
      },
      xWidth () {
        const n = this.labels.length;
        return 100 / (n + (n - 1) * this.mergedOptions.xAxis.gap);
      },
      xDist () {
        return (1 + this.mergedOptions.xAxis.gap) * this.xWidth;
      },
      barWidth () {
        const n = this.series.length;
        return this.xWidth / (n + (n - 1) * this.mergedOptions.xAxis.barGap);
      },
      barDist () {
        return (1 + this.mergedOptions.xAxis.barGap) * this.barWidth;
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
      yMax () {
        return Math.max(0, this.dataMax);
      },
      yMin () {
        return Math.min(0, this.dataMin);
      },
      yRange () {
        return this.yMax - this.yMin;
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
              canvasX: i * this.xDist + 0.5 * this.xWidth
            };
          });
      },
      yTicks () {
        const maxYTicks = this.mergedOptions.yAxis.maxTicks;
        const spacingBounds = this.preferredSeq.bounds(this.yRange / (maxYTicks - 1));

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
            unitValue: this.translateYToUnit(value),
            canvasValue: this.translateYToCanvas(value)
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
              canvasX: pidx * this.xDist + sidx * this.barDist,
              canvasHeight: this.scaleYToCanvas(Math.abs(value)),
              canvasBase: this.translateYToCanvas(Math.max(value, 0))
            };
          });
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
        const point = this.displaySeries[sidx][pidx];
        const label = this.labels[point.pidx];
        const align = point.canvasX > 50 ? 'right' : 'left';
        return {
          align,
          left: point.canvasX + (align === 'right' ? this.barWidth : 0),
          label: { label, i: point.pidx },
          serie,
          value: point.value,
          top: this.translateYToUnit(Math.max(point.value, 0)) * 100
        };
      }
    },
    methods: {
      translateYToUnit (value) {
        return 1.0 - this.scaleYToUnit(value - this.yMin);
      },
      translateYToCanvas (value) {
        return this.translateYToUnit(value) * this.canvasHeight;
      },
      scaleYToUnit (value) {
        return value / this.yRange;
      },
      scaleYToCanvas (value) {
        return this.scaleYToUnit(value) * this.canvasHeight;
      },
      getYTicksForSpacing (spacing) {
        const result = [];
        let next = Math.ceil(this.yMin / spacing) * spacing;
        while (next <= this.yMax) {
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

  .datavue-bar {
    opacity: 0.7;
    filter: drop-shadow(0px 0px 0.5px rgba(0, 0, 0, .7));

    &.hover {
      opacity: 1.0;
    }
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

  .datavue-tooltip-wrapper {
    position: absolute;
    z-index: 1000;
  }

  .datavue-tooltip {
    font-size: 0.9em;
    background-color: white;
    border-radius: .25rem;
    position: absolute;
    bottom: 0;
    margin-bottom: 10px;
    overflow: hidden;
    box-shadow: 0 0 5px black;
    text-align: center;

    &.datavue-align-left {
      left: 0;
    }

    &.datavue-align-right {
      right: 0;
    }
  }

  .datavue-tooltip-header {
    padding: 5px;
    background-color: #CCC;
    font-weight: bold;
    white-space: nowrap;
  }

  .datavue-tooltip-body {
    padding: 5px;
    white-space: nowrap;
  }

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

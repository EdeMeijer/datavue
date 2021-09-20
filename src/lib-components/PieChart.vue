<template>
  <DataVue :title="title" class="with-legend">
    <svg :viewBox="viewBox">

      <ellipse
        class="datavue-pie-outline"
        :cx="canvasCenterX"
        :cy="canvasCenterY"
        :rx="canvasRadius"
        :ry="canvasRadius"
      />

      <Arc
        v-for="(slice, i) in slices"
        :key="labels[i]"
        :xScale="xScale"
        :yScale="yScale"
        :arcScale="arcScale"
        :start="slice.start"
        :end="slice.end"
        :length="1"
        :class="[`datavue-serie-${i + 1}`, 'datavue-slice']"
        :style="{fill: slice.color}"
        @mouseover.native="highlight(slice)"
        @mouseout.native="unhighlight"
      />

    </svg>

    <Tooltip :tooltip="tooltip">
      <template v-slot:value="{ value }">
        <slot name="value" :value="value">{{ value }}</slot>
      </template>
      <template v-slot:label="{ label }">
        <slot name="label" :label="label">{{ label.name }}</slot>
      </template>
    </Tooltip>

    <Legend :series="series">
      <template v-slot:serie="{ serie }">
        <slot name="label" :label="serie">{{ serie.name }}</slot>
      </template>
    </Legend>
  </DataVue>
</template>

<script>
  import chartMixin from '../mixins/chartMixin';
  import DataVue from '../partials/DataVue';
  import Tooltip from '../partials/Tooltip';
  import Legend from '../partials/Legend';
  import { maxBy, sum } from 'lodash-es';
  import Scale from '../utils/Scale';
  import Arc from '../partials/Arc';

  export default {
    name: 'pie-chart',
    components: { Arc, Legend, Tooltip, DataVue },
    mixins: [chartMixin],
    props: {
      labels: { type: Array, required: true },
      colors: { type: Array },
      data: { type: Array, required: true },
      margin: { type: Number, default: 0.02 }
    },
    computed: {
      series () {
        return this.labels.map((name, i) => {
          const color = this.colors ? this.colors[i] : null;
          return { name, color, value: this.data[i] };
        });
      },
      xScale () {
        const margin = (100 - this.canvasHeight) / 2;
        return new Scale(-1 - this.margin, 1 + this.margin, margin, margin + this.canvasHeight);
      },
      yScale () {
        return new Scale(-1 - this.margin, 1 + this.margin, this.canvasHeight, 0);
      },
      arcScale () {
        const offset = 0.5 * Math.PI;
        return new Scale(0, 1, 2 * Math.PI + offset, +offset);
      },
      yScalePercent () {
        return new Scale(-1 - this.margin, 1 + this.margin, 100, 0);
      },
      canvasCenterX () {
        return this.xScale.project(0);
      },
      canvasCenterY () {
        return this.yScale.project(0);
      },
      canvasRadius () {
        return this.xScale.scale(1.0);
      },
      slices () {
        const cx = this.canvasCenterX;
        const cy = this.canvasCenterY;

        const total = sum(this.data);

        let accum = 0.0;

        return this.data.map((value, i) => {
          const start = accum / total;
          accum += value;
          const end = accum / total;

          return {
            sidx: 0,
            pidx: i,
            corners: [{ x: cx, y: cy }, this.calcCoord(start), this.calcCoord(end)],
            start,
            end,
            color: this.colors ? this.colors[i] : null,
            value: value
          };
        });
      },
      tooltip () {
        if (this.selectedTooltip === null) {
          return null;
        }
        const { pidx } = this.selectedTooltip;
        const point = this.slices[pidx];
        const label = this.labels[pidx];

        const anchor = maxBy(point.corners, c => -c.y);

        const align = anchor.x > 50 ? 'right' : 'left';

        return {
          align,
          serie: this.series[pidx].name,
          label: { name: label, i: pidx },
          value: point.value,
          left: anchor.x,
          top: this.yScalePercent.project(this.yScale.reverse.project(anchor.y))
        };
      }
    },
    methods: {
      calcCoord (rotation) {
        const angle = this.arcScale.project(rotation);
        return {
          x: this.xScale.project(Math.cos(angle)),
          y: this.yScale.project(Math.sin(angle))
        };
      }
    }
  };
</script>

<style lang="scss">
  .datavue-pie-outline {
    fill: transparent;
    stroke: rgba(0, 0, 0, 0.5);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }

  .datavue-slice {
    opacity: 0.7;

    &.hover {
      opacity: 1.0;
    }
  }
</style>

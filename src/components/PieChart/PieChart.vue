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

      <path
        v-for="(slice, i) in slices"
        :key="labels[i]"
        :d="slice.path"
        :class="[`datavue-serie-${i + 1}`, 'datavue-slice']"
        :style="{fill: slice.color}"
        @mouseover="highlight(slice)"
        @mouseout="unhighlight"
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
  import Scale from '../../Scale';

  export default {
    name: 'pie-chart',
    components: { Legend, Tooltip, DataVue },
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
        const total = sum(this.data);
        let accum = 0.0;
        const startAngles = [];
        const ratios = [];
        for (const value of this.data) {
          ratios.push(value / total);
          startAngles.push((accum / total) * 2.0 * Math.PI + Math.PI * 0.5);
          accum -= value;
        }
        const startCoords = startAngles.map(angle => {
          return { x: this.xScale.project(Math.cos(angle)), y: this.yScale.project(Math.sin(angle)) };
        });

        const r = this.canvasRadius;
        const cx = this.canvasCenterX;
        const cy = this.canvasCenterY;

        return startCoords.map(({ x, y }, i) => {
          const next = startCoords[(i + 1) % startCoords.length];
          const big = ratios[i] > 0.5 ? 1 : 0;
          return {
            sidx: 0,
            pidx: i,
            corners: [{ x: cx, y: cy }, { x, y }, next],
            path: `
              M ${x},${y}
              A ${r},${r} 0 ${big} 1 ${next.x},${next.y}
              L ${cx},${cy}
              Z`,
            color: this.colors ? this.colors[i] : null,
            value: this.data[i]
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

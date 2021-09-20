<template>
  <DataVue :title="title">
    <svg :viewBox="viewBox">
      <Arc
        :end="1.0"
        :length="length"
        :width="width"
        :xScale="xScale"
        :yScale="yScale"
        :arcScale="arcScale"
        class="davaue-gauge-background"
      />

      <Arc
        v-for="(arc, i) in arcs"
        :key="i"
        :start="arc.start"
        :end="arc.end"
        :width="width"
        :xScale="xScale"
        :yScale="yScale"
        :arcScale="arcScale"
        :class="['davaue-gauge-arc', arc.class]"
      />
    </svg>
    <div class="datavue-gauge-value-wrapper" :style="{'top': `${percentCenterY}%`}">
      <div class="datavue-gauge-value">
        <slot name="value" :value="value">{{ value }}</slot>
      </div>
    </div>
  </DataVue>
</template>

<script>
  import chartMixin from '../mixins/chartMixin';
  import DataVue from '../partials/DataVue';
  import Scale from '../utils/Scale';
  import Arc from '../partials/Arc';

  export default {
    name: 'gauge',
    components: { Arc, DataVue },
    mixins: [chartMixin],
    props: {
      value: { type: Number },
      max: { type: Number, default: null },
      margin: { type: Number, default: 0.02 },
      length: { type: Number, default: 0.75 },
      width: { type: Number, default: 0.25 },
      stops: {
        type: Array,
        default: () => [
          { to: 1.0, class: 'datavue-serie-1' }
        ]
      }
    },
    computed: {
      gaugeBottom () {
        return Math.max(Math.cos((this.length + 1) * Math.PI), 0.4);
      },
      gaugeHeight () {
        return 1.0 + this.gaugeBottom;
      },
      xScale () {
        const marginOut = (100 - this.canvasHeight) / 2;
        const marginIn = (this.margin - (2.0 - this.gaugeHeight) / 2);
        return new Scale(-1 - marginIn, 1 + marginIn, marginOut, marginOut + this.canvasHeight);
      },
      yScale () {
        return new Scale(-this.gaugeBottom - this.margin, 1 + this.margin, this.canvasHeight, 0);
      },
      arcScale () {
        const margin = (1.0 - this.length) * 0.5;
        const offset = -0.25;
        return new Scale(0, 1, (offset - margin + 1) * 2 * Math.PI, (offset + margin) * 2 * Math.PI);
      },
      yScalePercent () {
        return new Scale(-this.gaugeBottom - this.margin, 1 + this.margin, 100, 0);
      },
      percentCenterY () {
        return this.yScalePercent.project(0);
      },
      arcs () {
        if (this.max === null) {
          return [];
        }
        const ratio = this.value / this.max;
        const result = [];

        let cur = 0.0;
        for (const stop of this.stops) {
          const to = Math.min(ratio, stop.to);

          result.push({
            start: cur,
            end: to,
            class: stop.class
          });

          if (stop.to >= ratio) {
            break;
          }
          cur = to;
        }

        return result;
      }
    }
  };
</script>

<style lang="scss">
  .davaue-gauge-background {
    fill: rgba(133, 133, 133, 0.35);
    stroke: rgba(0, 0, 0, 0.5);
    stroke-width: 0.5px;
    vector-effect: non-scaling-stroke;
  }

  .davaue-gauge-arc {
    opacity: 0.7;
  }

  .datavue-gauge-value-wrapper {
    position: absolute;
    left: 50%;
  }

  .datavue-gauge-value {
    font-size: 2.5em;
    position: relative;
    left: -50%;
    top: -0.7em;
  }
</style>

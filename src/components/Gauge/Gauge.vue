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
        v-if="max !== null"
        :end="value / max"
        :width="width"
        :xScale="xScale"
        :yScale="yScale"
        :arcScale="arcScale"
        class="davaue-gauge-foreground datavue-serie-1"
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
  import Scale from '../../Scale';
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
      width: { type: Number, default: 0.25 }
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
        const marginRatio = (1.0 - this.length) * 0.5;
        const offsetRatio = -0.25;
        const startRatio = offsetRatio - marginRatio + 1;
        const endRatio = offsetRatio + marginRatio;

        const startAngle = startRatio * 2 * Math.PI;
        const endAngle = endRatio * 2 * Math.PI;

        return new Scale(
          0,
          1,
          startAngle,
          endAngle
        );
      },
      yScalePercent () {
        return new Scale(-this.gaugeBottom - this.margin, 1 + this.margin, 100, 0);
      },
      canvasCenterX () {
        return this.xScale.project(0);
      },
      canvasCenterY () {
        return this.yScale.project(0);
      },
      canvasRadiusOuter () {
        return this.xScale.scale(1.0);
      },
      radiusInner () {
        return 1.0 - this.width;
      },
      canvasRadiusInner () {
        return this.xScale.scale(this.radiusInner);
      },
      percentCenterY () {
        return this.yScalePercent.project(0);
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

  .davaue-gauge-foreground {
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

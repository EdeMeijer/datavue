<template>
  <path :d="path"/>
</template>

<script>
  import Scale from '../../Scale';
  import { clamp } from 'lodash-es';

  export default {
    props: {
      completion: { type: Number },
      length: { type: Number },
      width: { type: Number },
      xScale: Scale,
      yScale: Scale
    },
    computed: {
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
      path () {
        const clampedCompletion = clamp(this.completion, 0, 1);
        const effectiveLength = this.length * clampedCompletion;
        const big = effectiveLength > 0.5 ? 1 : 0;

        const marginRatio = (1.0 - this.length) * 0.5;
        const offsetRatio = -0.25;
        const startRatio = offsetRatio - marginRatio;
        const endRatio = offsetRatio + marginRatio + (1.0 - clampedCompletion) * this.length;

        const startAngle = startRatio * 2 * Math.PI;
        const endAngle = endRatio * 2 * Math.PI;

        const startXOuter = this.xScale.project(Math.cos(startAngle));
        const startYOuter = this.yScale.project(Math.sin(startAngle));
        const startXInner = this.xScale.project(Math.cos(startAngle) * this.radiusInner);
        const startYInner = this.yScale.project(Math.sin(startAngle) * this.radiusInner);
        const endXOuter = this.xScale.project(Math.cos(endAngle));
        const endYOuter = this.yScale.project(Math.sin(endAngle));
        const endXInner = this.xScale.project(Math.cos(endAngle) * this.radiusInner);
        const endYInner = this.yScale.project(Math.sin(endAngle) * this.radiusInner);
        const rOuter = this.canvasRadiusOuter;
        const rInner = this.canvasRadiusInner;

        return `
          M ${startXOuter},${startYOuter}
          A ${rOuter},${rOuter} 0 ${big} 1 ${endXOuter},${endYOuter}
          L ${endXOuter},${endYOuter} ${endXInner},${endYInner}
          A ${rInner},${rInner} 0 ${big} 0 ${startXInner},${startYInner}
          Z
        `;
      }
    }
  };
</script>

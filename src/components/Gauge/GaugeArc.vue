<template>
  <path :d="path"/>
</template>

<script>
  import Scale from '../../Scale';

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
        const effectiveLength = this.length * this.completion;
        const big = effectiveLength > 0.5 ? 1 : 0;

        const startAngle = (1.5 - this.length) * -Math.PI;
        const endAngle = ((1.0 - this.length) * 0.5 + 0.75 - this.completion) * 2 * Math.PI;

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

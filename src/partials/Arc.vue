<template>
  <path :d="path"/>
</template>

<script>
  import Scale from '../utils/Scale';

  function normalizeAngle (angle) {
    while (angle < 0) {
      angle += 2 * Math.PI;
    }
    while (angle > 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    return angle;
  }

  export default {
    props: {
      start: { type: Number, default: 0.0 },
      end: Number,
      width: { type: Number, default: 1.0 },
      xScale: Scale,
      yScale: Scale,
      arcScale: Scale
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
        const startAngle = this.arcScale.project(this.start);
        const endAngle = this.arcScale.project(this.end);
        const arcAngle = normalizeAngle(startAngle - endAngle);

        const big = arcAngle > Math.PI ? 1 : 0;

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

        const commands = [
          // Move to the start on the outer circle
          `M ${startXOuter},${startYOuter}`,
          // Draw the arc to the end on the outer circle
          `A ${rOuter},${rOuter} 0 ${big} 1 ${endXOuter},${endYOuter}`,
          // Draw a line to the end on the inner circle
          `L ${endXOuter},${endYOuter} ${endXInner},${endYInner}`
        ];
        if (rInner > 0) {
          // Draw the arc to the start on the inner circle
          commands.push(`A ${rInner},${rInner} 0 ${big} 0 ${startXInner},${startYInner}`);
        }
        // Close the path
        commands.push('Z');
        return commands.join(' ');
      }
    }
  };
</script>

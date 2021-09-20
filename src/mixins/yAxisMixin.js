import preferred from 'preferred';
import Scale from '../utils/Scale';

export default {
  data () {
    return {
      defaultOptions: {
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
    }
  }
};

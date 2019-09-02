import Scale from '../../Scale';

export default {
  props: {
    labels: { type: Array, required: true }
  },
  data () {
    return {
      defaultOptions: {
        xAxis: {
          gap: 0.5,
          maxTicks: 6,
          skipTicks: 0,
          margin: 0.01
        }
      }
    };
  },
  computed: {
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
    effectiveSkipLabels () {
      const maxLabels = this.mergedOptions.xAxis.maxTicks;
      const skipLabels = this.mergedOptions.xAxis.skipTicks;
      if (maxLabels === null) {
        return skipLabels;
      }
      const skip = Math.ceil(this.labels.length / maxLabels) - 1;
      return Math.max(skip, skipLabels);
    },
    displayLabels () {
      return this.labels
        .map((label, i) => ({ label, i }))
        .filter(({ i }) => i % (this.effectiveSkipLabels + 1) === 0)
        .map(({ label, i }) => {
          return {
            name: label,
            i,
            canvasX: this.xScale.project(i * (1 + this.xGap) + 0.5)
          };
        });
    }
  }
};

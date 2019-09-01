export default {
  props: {
    title: { type: String, required: true },
    series: { type: Array, required: true }
  },
  data () {
    return {
      selectedTooltip: null,
      defaultOptions: {
        aspect: 1.5
      }
    };
  },
  methods: {
    highlight ({ sidx, pidx }) {
      this.$data.selectedTooltip = { sidx, pidx };
    },
    unhighlight () {
      this.$data.selectedTooltip = null;
    }
  }
};

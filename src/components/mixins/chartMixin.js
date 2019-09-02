import optionsMixin from './optionsMixin';

export default {
  mixins: [optionsMixin],
  props: {
    title: { type: String, required: true }
  },
  data () {
    return {
      selectedTooltip: null,
      defaultOptions: {
        aspect: 1.5
      }
    };
  },
  computed: {
    canvasHeight () {
      return 100 / this.mergedOptions.aspect;
    },
    viewBox () {
      return `0 0 100 ${this.canvasHeight}`;
    }
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

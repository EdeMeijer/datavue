import { isArray, mergeWith } from 'lodash-es';

function optionMergeCustomizer (objValue, srcValue) {
  if (isArray(srcValue)) {
    return srcValue;
  }
}

export default {
  props: {
    options: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      defaultOptions: {}
    };
  },
  computed: {
    mergedOptions () {
      return mergeWith({}, this.defaultOptions, this.options, optionMergeCustomizer);
    }
  }
};

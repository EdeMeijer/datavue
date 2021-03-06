import * as components from './components';

import '@/assets/global.scss';
export { BarChart, StackedBarChart, PieChart, Gauge } from './components';
export { default as Scale } from './Scale';

const ComponentLibrary = {
  install (Vue, options = {}) {
    // components
    for (const componentName in components) {
      const component = components[componentName];
      Vue.component(component.name, component);
    }
  }
};

export default ComponentLibrary;

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(ComponentLibrary);
}

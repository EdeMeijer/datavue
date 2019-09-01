export default class Scale {
  constructor (inputMin, inputMax, outputMin, outputMax) {
    this.setInputRange(inputMin, inputMax);
    this.setOutputRange(outputMin, outputMax);
  }

  setInputRange (min, max) {
    this.inputMin = min;
    this.inputRange = max - min;
  }

  setOutputRange (min, max) {
    this.outputMin = min;
    this.outputRange = max - min;
  }

  scale (value) {
    return (value / this.inputRange) * this.outputRange;
  }

  project (value) {
    return this.scale(value - this.inputMin) + this.outputMin;
  }
}

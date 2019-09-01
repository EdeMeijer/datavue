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

  scaleForward (value) {
    return (value / this.inputRange) * this.outputRange;
  }

  scaleBackward (value) {
    return (value / this.outputRange) * this.inputRange;
  }

  projectForward (value) {
    return this.scaleForward(value - this.inputMin) + this.outputMin;
  }

  projectBackward (value) {
    return this.scaleBackward(value - this.outputMin) + this.inputMin;
  }
}

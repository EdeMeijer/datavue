export default class Scale {
  _reversed = null;

  constructor (inputMin, inputMax, outputMin, outputMax) {
    this.setInputRange(inputMin, inputMax);
    this.setOutputRange(outputMin, outputMax);
  }

  setInputRange (min, max) {
    this.inputMin = min;
    this.inputMax = max;
    this.inputRange = max - min;
    this._reversed = null;
  }

  setOutputRange (min, max) {
    this.outputMin = min;
    this.outputMax = max;
    this.outputRange = max - min;
    this._reversed = null;
  }

  scale (value) {
    return (value / this.inputRange) * this.outputRange;
  }

  project (value) {
    return this.scale(value - this.inputMin) + this.outputMin;
  }

  get reverse () {
    if (this._reversed === null) {
      this._reversed = new Scale(this.outputMin, this.outputMax, this.inputMin, this.inputMax);
    }
    return this._reversed;
  }
}

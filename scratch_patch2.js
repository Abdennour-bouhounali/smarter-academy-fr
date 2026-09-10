const range = { xMin: 2, xMax: 10, yMin: 0, yMax: 1800 };
const Math_max = Math.max;
const Math_min = Math.min;

const xAxisYVal = Math_max(range.yMin, Math_min(0, range.yMax));
const yAxisXVal = Math_max(range.xMin, Math_min(0, range.xMax));

console.log({ xAxisYVal, yAxisXVal });

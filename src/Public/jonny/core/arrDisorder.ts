/**
 * @param Array<T> 输入一个数组，返回一个同类型的乱序数组
 */
export var arrDisorder = function<T>(arr: Array<T>): Array<T> {
    let _arr = arr.map(v => v);
    _arr = _arr
      .filter((v, i) => i % 2 === 0)
      .concat(_arr.filter((v, i) => i % 2 !== 0))
      .reverse()
      .sort(v => Math.random() - 0.5)
    return _arr;
  };
/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

/**
 * @param {Array<any>} 输入一个数组，返回一个乱序数组
 */
export var arrDisorder = function(arr: Array<any>): Array<any> {
    let _arr = arr.map(v => v);
    _arr = _arr
      .filter((v, i) => i % 2 === 0)
      .concat(_arr.filter((v, i) => i % 2 !== 0))
      .reverse()
      .sort(v => Math.random() - 0.5)
    return _arr;
  };
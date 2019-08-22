import 'phaser';
import Button from './Button';

/**
  * 在加载文件同时，纹理key必须为 btnExit,注册点为中心,可以修改属性minAlpha
  * @param Phaser.Scene [scene]  
  * @param number [x] options
  * @param number [y] options
  * @param string [texture] options
  * @param any [shape] options
  * @param Function [callback] options 
 */

export default class ButtonExit extends Button {
    mountUpdate: Function;
    constructor(scene: Phaser.Scene, x: number = 25 + 60 * 0.5, y:number = 25 + 60 * 0.5,texture: string = "btnExit", shape: any = new Phaser.Geom.Circle(60 * 0.5, 60 * 0.5, 60), callback: Phaser.Types.Input.HitAreaCallback = Phaser.Geom.Circle.Contains) {
      super(scene, x, y, texture, shape, callback)
      this.pointerdownFunc = this.exitGame;
    }
  
    exitGame(): void {
        alert("Game Exit");
    }
  }
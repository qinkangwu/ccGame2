/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";

export class Terminal extends Phaser.GameObjects.Container{
    public bg:Phaser.GameObjects.Image;
    public text:Phaser.GameObjects.BitmapText;
    constructor(scene:Phaser.Scene,x:number,y:number,textContent:string){
      super(scene,x,y);
      this.bg = new Phaser.GameObjects.Image(scene,0,0,"terminal");
      this.text = new Phaser.GameObjects.BitmapText(scene, 0, 0-10, "ArialRoundedBold", textContent, 45, 1).setOrigin(0.5);
      this.add([this.bg,this.text]);
    }
}
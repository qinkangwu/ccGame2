import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import {game6DataItem,Rectangular} from '../../interface/Game6';

export class Game6PlayScene extends Phaser.Scene {
    private staticScene:Phaser.GameObjects.Container;
    private bg:Phaser.GameObjects.Image;

    constructor() {
      super({
        key: "Game6PlayScene"
      });
    }
  
    init(): void {
      
    }
  
    preload(): void {
    }
    
  
    create(): void {
       this.createStaticScene();
    }
  
    update(time: number , delta : number): void {
    }

    /* 搭建静态场景 */
    private createStaticScene():void{
      this.bg = new Phaser.GameObjects.Image(this,0,0,"bg").setOrigin(0);
      this.bg.displayWidth = this.coordTranslate(0,0,1024,552).width;
      this.bg.displayHeight = this.coordTranslate(0,0,1024,552).height;
      this.staticScene = new Phaser.GameObjects.Container(this,0,0,[this.bg]);
      this.add.existing(this.staticScene);
    }

    /* 将设计坐标转为屏幕坐标,返回一个矩形*/
    private coordTranslate(_x:number,_y:number,_width:number,_height:number):Rectangular{
      const WIDTH = window.innerWidth;
      const HIGHT = window.innerHeight;
      let w = 1024;
      let h = 552;
      let x = Math.floor((_x/w)*WIDTH);
      let y = Math.floor((_y/h)*HIGHT);
      let width = Math.floor((_width/w)*WIDTH);
      let height = Math.floor((_height/h)*HIGHT);
      return {
        x:x,
        y:y,
        width:width,
        height:height
      }
    }
  };
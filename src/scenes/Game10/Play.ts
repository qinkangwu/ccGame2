import "phaser";
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';

const W = 1024;
const H = 552;

export default class Game10PlayScene extends Phaser.Scene {
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    constructor() {
      super({
        key: "Game10PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      this.createBgi(); //背景
      this.createBgm(); //bgm
      new CreateBtnClass(this,{
        bgm : this.bgm,
        previewCallback : ()=>{},
        previewPosition : {
          y : H - 140,
          _s : true,
          alpha : 1
        }
      });
    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .3
      })
    }

    private createBgi () : void {
      //背景
      this.add.image(0,0,'bgi').setDisplaySize(W,H).setOrigin(0);
    }

    update(time: number , delta : number): void {
    }
  };
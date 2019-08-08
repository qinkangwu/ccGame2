import 'phaser';
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import {game6DataItem,Rectangular} from '../../interface/Game6';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const W = 1024;
const H = 552;


/**
 * 坐标根据画布进行重排
 */
var coordTranslate:Function = function (_x:number,_y:number):void{
  let x = Math.floor((_x/W)*WIDTH);
  let y = Math.floor((_y/H)*HEIGHT);
  this.x = x;
  this.y = y;
}

/**
 * 尺寸根据画布按照宽度进行重排
 */
 var scaleWidthTranslate:Function = function (_width:number){
    let width = Math.floor((_width/W)*WIDTH);
    let xRatio = width / _width;
    this.setScale(xRatio);
 }

export default class Game6PlayScene extends Phaser.Scene {
    private bgm:Phaser.Sound.BaseSound; //背景音乐

    private bg:Phaser.GameObjects.Image; //背景图片 
    private btn_exit:Phaser.GameObjects.Image;  //退出按钮
    private btn_sound:Phaser.GameObjects.Sprite; //音乐按钮
    private staticScene:Phaser.GameObjects.Container; // 静态组

    //private btns:Phaser.GameObjects.Container; 

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
       this.createBGM();
       this.createStaticScene();
    }
  
    update(time: number , delta : number): void {
      
    }

    /* 创建背景音乐 ，并设置为自动播放*/
    private createBGM():void{
      this.bgm = this.sound.add('bgm');
      this.bgm.addMarker({
        name:"start",
        start:0
      } as Phaser.Types.Sound.SoundMarker);
      let config:Phaser.Types.Sound.SoundConfig = {
        loop:true,
        volume:0.3
      }
      this.bgm.play("start",config);
    }

    /* 搭建静态场景 */
    private createStaticScene():void{
      this.bg = new Phaser.GameObjects.Image(this,0,0,"bg").setOrigin(0).setDisplaySize(WIDTH,HEIGHT);

      this.btn_exit = new Phaser.GameObjects.Image(this,0,0,"btn_exit").setOrigin(0);
      coordTranslate.call(this.btn_exit,25,25);
      scaleWidthTranslate.call(this.btn_exit,60);
      this.btn_exit.setInteractive();
      this.btn_exit.on("pointerup",this.exitGame);

      this.btn_sound = new Phaser.GameObjects.Sprite(this,0,0,"btn_sound_on").setOrigin(1,0);
      
      coordTranslate.call(this.btn_sound,999,25);
      scaleWidthTranslate.call(this.btn_sound,60);
      this.btn_sound.setInteractive();
      this.btn_sound.on("pointerup",this.onOffSound);
      this.staticScene = new Phaser.GameObjects.Container(this,0,0,[
        this.bg,
        this.btn_exit,
        this.btn_sound
      ]);
      this.add.existing(this.staticScene);
    }

    /* 退出游戏*/
    private exitGame():void{
        console.log("Game Over");
    }

    /* 关闭或播放音乐 */
    private onOffSound(this:any){
        let bgm = this.scene.bgm;
        if(bgm.isPlaying){
            this.setTexture("btn_sound_off");
            bgm.pause(); 
        }else{
          this.setTexture("btn_sound_on");
          bgm.play();  
        }
    }

  };
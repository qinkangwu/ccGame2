import "phaser";
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';

const W = 1024;
const H = 552;

export default class Game10PlayScene extends Phaser.Scene {
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private goldIcon : Phaser.GameObjects.Image; //金币数量
    private goldText : Phaser.GameObjects.Text; //金币文本
    private lifeIcon : Phaser.GameObjects.Image; //金币数量
    private lifeText : Phaser.GameObjects.Text; //金币文本
    private comment : Phaser.GameObjects.Image; //提示按钮
    private goldNumber : object = {
      n : 0,
      l : 0
    }; //金币数量文本
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
      this.createGold(); //金币
      new CreateBtnClass(this,{
        bgm : this.bgm,
        previewCallback : ()=>{},
        previewPosition : {
          y : H - 140,
          _s : true,
          alpha : 1
        }
      });
      new CreateMask(this,()=>{

      }); //遮罩层
    }

    private createGold () : void {
      //创建按钮
      this.goldIcon = this.add.image(55,H - 55,'game10icons2','gold.png')
        .setOrigin(.5)
        .setDisplaySize(60,60)
        .setInteractive()
      //@ts-ignore
      this.goldText = this.add.text(this.goldIcon.x + 14,this.goldIcon.y + 17,this.goldNumber.n + '',{
        fontSize: "14px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#fff',
      }).setOrigin(.5);

      this.lifeIcon = this.add.image(55 , H - 147.5 , 'game10icons2' , 'life.png');
      //@ts-ignore
      this.lifeText = this.add.text(this.lifeIcon.x + 14,this.lifeIcon.y + 12,this.goldNumber.l + '',{
        fontSize: "14px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#fff',
      }).setOrigin(.5);

      // this.comment = this.add.image()

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
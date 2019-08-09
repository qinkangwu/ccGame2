import 'phaser';
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';

const scaleX : number = window.innerWidth / 1024;
const scaleY : number = window.innerHeight / 552;

export default class Game7PlayScene extends Phaser.Scene {
    private machine : Phaser.GameObjects.Image ; //机器主体
    private handle : Phaser.GameObjects.Sprite ; //手柄
    private backToListBtn : Phaser.GameObjects.Image; //返回列表按钮
    private musicBtn : Phaser.GameObjects.Image; //背景音乐按钮
    private goldIcon : Phaser.GameObjects.Image; //金币数量
    constructor() {
      super({
        key: "Game7PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      this.createBgi(); //背景图
      this.createMachine(); //创建机器
      this.createBtn(); //创建按钮
    }

    private createBtn () : void {
      this.backToListBtn = this.add.image(25 + (30 * scaleX), 25 + (30 * scaleY),'icons2','btn_exit.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60,60)
        .setInteractive()
        .setScale(scaleX,scaleY)
        .setData('isBtn',true);
      this.musicBtn = this.add.image(window.innerWidth - 30 - (30 * scaleX),25 + (30 * scaleY),'icons2','btn_play2.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60,60)
        .setInteractive()
        .setScale(scaleX,scaleY)
        .setData('isBtn',true);
      this.goldIcon = this.add.image(25 + (30 * scaleX),window.innerHeight - 25 - (30 * scaleY),'icons2','civa_gold.png')
        .setOrigin(.5)
        .setDisplaySize(60,60)
        .setScale(scaleX,scaleY)
        .setInteractive()
    }

    private createBgi () : void {
      //背景
      this.add.image(0,0,'game7Bgi').setDisplaySize(window.innerWidth,window.innerHeight).setOrigin(0);
    }

    private createMachine () : void {
      //创建机器
      this.machine = this.add.image(window.innerWidth / 2 , 0 , 'machine').setOrigin(.5,0).setDisplaySize(794,513).setScale(scaleX,scaleY);
      this.handle = this.add.sprite(
        this.machine.x + (this.machine.width * scaleX / 2) - (window.innerWidth * 0.08) , 
        this.machine.y + (this.machine.height * scaleY / 2 ),
        'icons',
        'anims1.png'
      ).setDisplaySize(123,336).setScale(scaleX,scaleY);
    }

    update(time: number , delta : number): void {
    }
  };
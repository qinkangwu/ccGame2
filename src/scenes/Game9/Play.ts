import 'phaser';
import { Game9DataItem } from '../../interface/Game9';
import apiPath from '../../lib/apiPath';
import { post } from '../../lib/http';
import { StaticAni } from '../../public/jonny/animate';
import {Cover} from '../../Public/jonny/core';
import {Button,ButtonMusic,ButtonExit} from '../../Public/jonny/components'; 

const vol = 0.3; //背景音乐的音量
var index: number; //题目的指针，默认为0

export default class Game9PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态

  private ccData: Array<Game9DataItem> = [];
  private cover:Phaser.GameObjects.Container;

  private clickSound: Phaser.Sound.BaseSound;
  private correctSound: Phaser.Sound.BaseSound;
  private wrongSound: Phaser.Sound.BaseSound;

  private bg: Phaser.GameObjects.Image; //背景图片
//   private btn_exit:Button;  //退出按钮
//   private btn_sound:ButtonMusic; //音乐按钮
  private stage: Phaser.GameObjects.Container; // 舞台

  private cookie: Phaser.GameObjects.Container; //药品序列
  private nullCookie: Phaser.GameObjects.Container; //空圆序列
  private cloudWord: Phaser.GameObjects.Container; //单词容器
  private voiceBtns: Phaser.GameObjects.Container; //语音按钮组
  private wordSpeaker: Phaser.Sound.BaseSound;   //单词播放器

  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager; // 粒子控制器
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter;  //粒子发射器

  constructor() {
    super({
      key: "Game6PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    index = res.index;
    this.ccData = res.data;
  }

  preload(): void {

  }

  create(): void {
    if (index === 0) {
      this.createStage();
    //   this.cover = new Cover(this,"cover");
    //   this.add.existing(this.cover);
    }
    // this.createAudio();
    // this.createDynamicScene();
    // this.createEmitter();
    // this.gameStart();
  }

  update(time: number, delta: number): void {
    //this.btn_sound.mountUpdate();
  }

  private createStage(){
     //this.stage = new 
    
     //let bg = this.add.image(0,0,"bg").setOrigin(0);
     //let btn_exit = new ButtonExit(this);

  }



}
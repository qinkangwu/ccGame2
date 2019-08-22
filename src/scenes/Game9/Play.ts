import 'phaser';
import { Game9DataItem } from '../../interface/Game9';
import {Cover} from '../../Public/jonny/core';
import {Button,ButtonMusic,ButtonExit} from '../../Public/jonny/components'; 

const vol = 0.3; //背景音乐的音量
var index: number; //题目的指针，默认为0

export default class Game9PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态

  private ccData: Array<Game9DataItem> = [];
  private cover:Phaser.GameObjects.Container;

  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private clickSound: Phaser.Sound.BaseSound;
  private correctSound: Phaser.Sound.BaseSound;
  private wrongSound: Phaser.Sound.BaseSound;


  private bg: Phaser.GameObjects.Image; //背景图片
  private btnExit:Button;  //退出按钮
  private btnSound:ButtonMusic; //音乐按钮
  private originalSoundBtn:Button; //原音按钮
  private tryAginListenBtn:Button; //在听一次按钮

  private stage: Phaser.GameObjects.Container; // 舞台

  private cookie: Phaser.GameObjects.Container; //药品序列
  private nullCookie: Phaser.GameObjects.Container; //空圆序列
  // private cloudWord: Phaser.GameObjects.Container; //单词容器
  private voiceBtns: Phaser.GameObjects.Container; //语音按钮组
  private wordSpeaker: Phaser.Sound.BaseSound;   //单词播放器

  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager; // 粒子控制器
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter;  //粒子发射器

  constructor() {
    super({
      key: "Game9PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    index = res.index;
    this.ccData = res.data;
    console.log(2);
  }

  preload(): void {

  }

  create(): void {
    if (index === 0) {
      this.createBgm();
      this.createStage();
       this.cover = new Cover(this,"cover");
       this.add.existing(this.cover);
    }
    // this.createAudio();
    // this.createDynamicScene();
    // this.createEmitter();
    // this.gameStart();
  }

  update(time: number, delta: number): void {
    this.btnSound.mountUpdate();
  }

  /* 背景音乐 */
  private createBgm(): void {
    this.bgm = this.sound.add('bgm');
    this.bgm.addMarker({
      name: "start",
      start: 0
    } as Phaser.Types.Sound.SoundMarker);
    let config: Phaser.Types.Sound.SoundConfig = {
      loop: true,
      volume: vol
    }

    this.bgm.play("start", config);
    this.clickSound = this.sound.add('click');
    this.correctSound = this.sound.add('correct');
    this.wrongSound = this.sound.add('wrong');
  }
  /**
   * 创建静态场景
   */
  private createStage(){
     this.stage = new Phaser.GameObjects.Container(this);
     this.add.existing(this.stage);
     let bg = this.add.image(0,0,"bg").setOrigin(0);
     this.btnExit = new ButtonExit(this);
     this.btnSound = new ButtonMusic(this);
     this.originalSoundBtn = new Button(this,25+60*0.5,467+60*0.5,"originalSoundBtn");
     this.tryAginListenBtn = new Button(this,89,435+50,"try-agin-btn");
     this.tryAginListenBtn.setOrigin(0,1);
     this.stage.add([bg,this.btnExit,this.btnSound,this.originalSoundBtn,this.tryAginListenBtn])
  }



}
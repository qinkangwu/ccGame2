import 'phaser';
import { Game9DataItem } from '../../interface/Game9';
import { Cover } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit } from '../../Public/jonny/components';

const vol = 0.3; //背景音乐的音量
var index: number; //题目的指针，默认为0

export default class Game9PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态

  private ccData: Array<Game9DataItem> = [];

  //静态开始
  private stage: Phaser.GameObjects.Container; // 舞台
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private clickSound: Phaser.Sound.BaseSound; //点击音效
  private correctSound: Phaser.Sound.BaseSound; //正确音效
  private wrongSound: Phaser.Sound.BaseSound; //错误音效
  private cover: Phaser.GameObjects.Container;  //封面
  private bg: Phaser.GameObjects.Image; //背景图片
  private btnExit: Button;  //退出按钮
  private btnSound: ButtonMusic; //音乐按钮
  private originalSoundBtn: Button; //原音按钮
  private tryAginListenBtn: Button; //在听一次按钮
  //静态结束

  //动态开始
  private actors: Phaser.GameObjects.Container; // 演员序列
  private wordSpeaker: Phaser.Sound.BaseSound;   //单词播放器
  private cookies: Phaser.GameObjects.Container[]=[]; //饼干
  private nullCookies: Phaser.GameObjects.Container; //空饼干
  //动态开始

  constructor() {
    super({
      key: "Game9PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    index = res.index;
    this.ccData = res.data;
    console.log(this.ccData);
  }

  preload(): void {

  }

  create(): void {
    if (index === 0) {
      this.createStage();
      this.cover = new Cover(this, "cover");
      this.add.existing(this.cover);
    }
    this.createActors();
  }

  update(time: number, delta: number): void {
    this.btnSound.mountUpdate();
  }

  /**
   * 创建静态场景
   */
  createStage() {
    let that = this;

    this.stage = new Phaser.GameObjects.Container(this);
    this.add.existing(this.stage);
    let bg = this.add.image(0, 0, "bg").setOrigin(0);
    this.btnExit = new ButtonExit(this);
    this.btnSound = new ButtonMusic(this);
    this.originalSoundBtn = new Button(this, 25 + 60 * 0.5, 467 + 60 * 0.5, "originalSoundBtn");
    this.tryAginListenBtn = new Button(this, 89, 435 + 50, "try-agin-btn");
    this.tryAginListenBtn.setOrigin(0, 1);
    this.stage.add([bg, this.btnExit, this.btnSound, this.originalSoundBtn, this.tryAginListenBtn]);
    this.originalSoundBtn.on("pointerdown", this.playWord.bind(that));

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
   * 创建演员们
   */
  createActors(): void {
    this.actors = new Phaser.GameObjects.Container(this);
    this.add.existing(this.actors);

    //单词发生器
    let wordSound = this.ccData[index].name;
    this.wordSpeaker = this.sound.add(wordSound);

    //音标发生器
    //this.phonetic = new Audio();

    //饼干－－－－
    let cookiesPool = this.ccData[index].phoneticSymbols.concat(this.ccData[index].uselessPhoneticSymbols);
    cookiesPool.sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5);//两次乱序

    let cookieImgs:Phaser.GameObjects.Sprite[] = [];

    cookiesPool.forEach((v, i) => {
      let _ix = i;
      _ix = _ix % 4;
      let _iy = Math.floor(i / 4);
      let _x = 227 + 120 * 0.5 + 158 * _ix;
      let _y = 25 + 91 * 0.5 + 112 * _iy;
      let _cookieImg = new Button(this, _x, _y, "cookie");
      _cookieImg.name = v.name;
      _cookieImg.setAlpha(1);
      _cookieImg.minAlpha = 1;
      _cookieImg.pointerupFunc = () => {
        let _phonetic:Phaser.Sound.BaseSound  = this.sound.add(_cookieImg.name);
        _phonetic.play();
        _phonetic.on("complete", function () {
          _phonetic.destroy();
        });
      }
      let _cookieText = new Phaser.GameObjects.Text(this, _cookieImg.x, _cookieImg.y, v.name, <Phaser.Types.GameObjects.Text.TextSyle>{ align: "center", fontSize: "35px", stroke: "#fff", strokeThickness: 2 }).setOrigin(0.5);
      let _cookies = new Phaser.GameObjects.Container(this);
      _cookies.add([_cookieImg, _cookieText]);
      cookieImgs.push(_cookieImg);
      this.actors.add(_cookies);
      this.cookies.push(_cookies);
    })

    this.physics.world.enable(cookieImgs);

    //空饼干--------
    this.nullCookies = new Phaser.GameObjects.Container(this);
    this.add.existing(this.nullCookies);
    let phoneticSymbols = this.ccData[index].phoneticSymbols;  
    let offsetX:number=0;
    phoneticSymbols.forEach((v,i,arr)=>{
        switch(arr.length){
          case 1:
              offsetX = (cookieImgs[i].x+cookieImgs[i+3].x)>>1;
            break;
          case 2:
              offsetX = (cookieImgs[i*2].x+cookieImgs[i*2+1].x)>>1;
           break;
           case 3:
              offsetX = (cookieImgs[i].x+cookieImgs[i+1].x)>>1;
           break;
           case 4:
              offsetX = cookieImgs[i].x;
           break;
        }
        let _nullCookieImg = new Phaser.GameObjects.Image(this,offsetX,472,"null-cookie");
        this.nullCookies.add(_nullCookieImg);
        this.physics.world.enable(_nullCookieImg);
        (<Phaser.Physics.Arcade.Body>_nullCookieImg.body).setSize(_nullCookieImg.width*0.5,_nullCookieImg.height*0.5);
    });
    console.log(this.nullCookies.list[0]);



  }

  /**
   * 播放目前的单词
   */
  private playWord(): void {
    this.wordSpeaker.play();
  }





}
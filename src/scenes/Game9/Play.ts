import 'phaser';
import { Game9DataItem } from '../../interface/Game9';
import { cover,rotateTips } from '../../Public/jonny/core';
import { Button,ButtonContainer, ButtonMusic, ButtonExit } from '../../Public/jonny/components';

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
  private cookies: Phaser.GameObjects.Container[] = []; //饼干包含文字
  private nullCookies: Phaser.GameObjects.Image[] = []; //空饼干
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
      //this.scene.pause();
      this.createStage();
      //this.cover = new Cover(this, "cover");
      //this.add.existing(this.cover);
      rotateTips.init();
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
    cookiesPool.forEach((v, i) => {
      let _ix = i;
      _ix = _ix % 4;
      let _iy = Math.floor(i / 4);
      let _x = 287 + 158*_ix; 
      let _y = 70.05 + 183*_iy;
      let _cookieImg = new Phaser.GameObjects.Image(this,0,0,"cookie");
      _cookieImg.setAlpha(1);
      let _cookieText = new Phaser.GameObjects.BitmapText(this,0,0+5,"GenJyuuGothic47",v.name,35,0).setOrigin(0.5);
     let _cookie = new ButtonContainer(this,new Phaser.Geom.Rectangle(-60,-47,120,91),Phaser.Geom.Rectangle.Contains).setAlpha(1);
      _cookie.name = v.name;
      _cookie.minAlpha = 1;
      _cookie.pointerdownFunc = this.playPhonetic.bind(this,_cookie.name);
      _cookie.add([_cookieImg, _cookieText]);
      _cookie.x = _x;
      _cookie.y = _y;
      _cookie.setData("initPosition",{x:_cookie.x,y:_cookie.y});
      _cookie.setData("hit",0);
      //this.cookieImgs.push(_cookieImg);
      this.actors.add(_cookie);
      this.cookies.push(_cookie);
    })


    //饼干动画 开始--------------
    this.cookies.forEach((cookie,index)=>{
      let i = index;
      i = i % 4;
      cookie.y+= (50 + i*50);
      cookie.setAlpha(0);
    })

    let cookieIndex = 0;

    let bounceAni = ()=>{
      let that = this;
      this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
        targets:this.cookies[cookieIndex],
        duration:300,
        alpha:1,
        y:this.cookies[cookieIndex].getData("initPosition").y,
        ease:"Bounce.easeOut",
        onComplete:function (){
          cookieIndex+=1;
          if(cookieIndex===2){
            that.wordSpeaker.play();
          }
          if(cookieIndex>cookiesPool.length-1){
            that.dragEvent();
            return false;
          }else{
            bounceAni();
          }
        }
      })
    };
    bounceAni();

    //饼干动画 结束

    //空饼干--------
    let phoneticSymbols = this.ccData[index].phoneticSymbols;
    let offsetX: number = 0;
    let cookies = this.cookies;
    phoneticSymbols.forEach((v, i, arr) => {
      switch (arr.length) {
        case 1:
          offsetX = (cookies[i].x + cookies[i + 3].x) >> 1;
          break;
        case 2:
          offsetX = (cookies[i * 2].x + cookies[i * 2 + 1].x) >> 1;
          break;
        case 3:
          offsetX = (cookies[i].x + cookies[i + 1].x) >> 1;
          break;
        case 4:
          offsetX = cookies[i].x;
          break;
      }
      let _nullCookieImg = new Phaser.GameObjects.Image(this, offsetX, 472, "null-cookie");
      _nullCookieImg.name = v.name;
      _nullCookieImg.setAlpha(0);
      this.actors.add(_nullCookieImg);
      this.nullCookies.push(_nullCookieImg);
      this.physics.world.enable(_nullCookieImg);
      (<Phaser.Physics.Arcade.Body>_nullCookieImg.body).setSize(_nullCookieImg.width * 0.5, _nullCookieImg.height * 0.5);
    });

    //空饼干动画
    this.nullCookies.forEach((nullcookie,i)=>{
        this.tweens.add({
          targets:nullcookie,
          alpha:1,
          delay:1000*i,
          duration:500
        })
    }) 


  }

  /**
   * 播放目前的单词
   */
  private playWord(): void {
    this.wordSpeaker.play();
  }

  /**
   * 播放饼干上的音标
   */
  private playPhonetic(key):void{
    let _phonetic: Phaser.Sound.BaseSound = this.sound.add(key);
    _phonetic.play();
    _phonetic.on("complete", function () {
      _phonetic.destroy();
    });
  }


  /**
   * 执行拖拽的互动 
   */
  private dragEvent(): void {
    let that = this;

    let hits:number = 0; //碰撞次数
    this.physics.world.enable(this.cookies);
    this.cookies.forEach(cookieEvent);

    function cookieEvent(cookie:ButtonContainer) {
      (cookie.body as Phaser.Physics.Arcade.Body)
        .setCollideWorldBounds(true)
        .setSize(cookie.shape.width,cookie.shape.height)
        .setOffset(cookie.shape.x,cookie.shape.y);
      that.input.setDraggable(cookie,true);
      cookie.on("dragstart", cookieOnDragStart);
      cookie.on("drag", cookieOnDrag);
      cookie.on("dragend", cookieOnDragEnd);
    }

    function cookieOnDrag(pointer,dragX,dragY) {
      this.x = dragX;
      this.y = dragY;
    }

    function cookieOnDragStart(pointer,startX,startY) {
      that.clickSound.play();
    }


    function cookieOnDragEnd() {
      that.clickSound.play();
      if(this.getData("hit")===0){
        this.setPosition(
          this.getData("initPosition").x,
          this.getData("initPosition").y
        );
      }
    }


    let collider = that.physics.add.overlap(that.cookies,that.nullCookies, overlapHandler, null, this);
    function overlapHandler(...args){
        args[0].setData("hit",1);
        args[0].setPosition(args[1].x,args[1].y);
        args[0].off("dragstart");
        args[0].off("drag");
        args[0].off("dragend");
        args[0].body.destroy();
        args[1].destroy();
        that.playPhonetic(args[0].name);
        hits+=1;
        if(hits===that.ccData[index].phoneticSymbols.length){
          dragEnd(args[0]);
        }
    }

    function dragEnd(cookie){
        console.log("拖拽结束");
        that.cookies.forEach(v=>{
        v.off("dragstart");
        v.off("drag");
        v.off("dragend");
        })
        that.playPhonetic(cookie.name);
        /**init work */
    }

  }

}
import 'phaser';
import { Game6DataItem } from '../../interface/Game6';
import apiPath from '../../lib/apiPath';
import { post } from '../../lib/http';
import {Cover} from '../../Public/jonny/core';
import {Button,ButtonMusic,ButtonExit} from '../../Public/jonny/components'; 


const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const W = 1024;
const H = 552;
const vol = 0.3; //背景音乐的音量
var ableStop:number = 0;  //0=>不能停止，1=>能停止,2=>已经停止
var index: number; //题目的指针，默认为0

var arrowUpObj: any = null;
var arrowUpAni: any = null;
var arrowLRAni: any = null;
var arrowLObj: any = null;
var arrowRObj: any = null;

const initPosition = {
  x:1024 * 0.5 + 10,
  y:410
}

declare var Recorder: any; //声音录音

/**
 * 坐标根据画布进行重排
 */
var coordTranslate: Function = function (_x: number, _y: number): void {
  let x = Math.floor((_x / W) * WIDTH);
  let y = Math.floor((_y / H) * HEIGHT);
  this.x = x;
  this.y = y;
}

/**
 * 根据画布宽高返回一组相对宽高及坐标
 */

var reactangleTranslate = function (_width: number, _height: number): any {
  return {
    width: Math.floor((_width / W) * WIDTH),
    height: Math.floor((_height / H) * HEIGHT)
  }
}

/**
 * 尺寸根据画布按照宽度进行重排
 */
var scaleWidthTranslate: Function = function (_width: number) {
  let width = Math.floor((_width / W) * WIDTH);
  let xRatio = width / _width;
  this.setScale(xRatio);
}

export default class Game6PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态
  private recordTimes: number;

  private cover:Phaser.GameObjects.Container;
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private clickSound: Phaser.Sound.BaseSound;
  private correctSound: Phaser.Sound.BaseSound;
  private wrongSound: Phaser.Sound.BaseSound;


  private phoneticData: Game6DataItem[] = []; //音标数据
  private bg: Phaser.GameObjects.Image; //背景图片
  private btn_exit:Button;  //退出按钮
  private btn_sound:ButtonMusic; //音乐按钮
  private staticScene: Phaser.GameObjects.Container; // 静态组

  private balls: Phaser.GameObjects.Container; //药品序列
  private nullballs: Phaser.GameObjects.Container; //空圆序列
  private arrows: Phaser.GameObjects.Container; //箭头序列
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
    //this.resize();
    index = res.index;
    this.recordTimes = 0;
    this.phoneticData = res.data.map(function (v) {
      delete v.uselessPhoneticSymbols;
      return v;
    });
  }

  preload(): void {

  }

  create(): void {
    if (index === 0) {
      this.createBgm();
      this.cover = new Cover(this,"cover");
      this.add.existing(this.cover);
    }
    //index = 6; //test

    this.createStaticScene();
    this.createAudio();
    this.createDynamicScene();
    this.createEmitter();
    this.gameStart();
  }

  update(time: number, delta: number): void {
    this.btn_sound.mountUpdate();
  }

  /** * 游戏开始 */
  public gameStart(): void {
    this.createBalls();
  }

  /* 建立动态场景 */
  private createDynamicScene(): void {
    this.balls = new Phaser.GameObjects.Container(this);
    this.nullballs = new Phaser.GameObjects.Container(this);
    this.arrows = new Phaser.GameObjects.Container(this);
    this.cloudWord = new Phaser.GameObjects.Container(this);
    this.voiceBtns = new Phaser.GameObjects.Container(this);
    this.add.existing(this.balls);
    this.add.existing(this.nullballs);
    this.add.existing(this.arrows);
    this.add.existing(this.cloudWord);
    this.add.existing(this.voiceBtns);
  }

  /**
   * 创建粒子效果发射器
   */
  private createEmitter(): void {
    this.particles = this.add.particles('particles');
    this.emitters = this.particles.createEmitter({
      lifespan: 1000,
      speed: { min: 300, max: 400 },
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.7, end: 0 },
      rotate: { start: 0, end: 360, ease: 'Power2' },
      blendMode: 'ADD',
      on: false
    })
  }

  /**
   * 注册事件
   */
  private boom(): void {
    (<Phaser.GameObjects.Particles.ParticleEmitter>this.emitters).explode(40, 242 + 521 * 0.5, 0 + 338 * 0.5);
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

  /* 创建药瓶 */
  private createBalls(): void {
    /**
     * 测试接口
     */
    //index = 6;
    let ballImgTexures: Array<string> = ["img_ballgreen", "img_ballpurple", "img_ballyellow"];
    let phoneticSymbols = this.phoneticData[index].phoneticSymbols.reverse();
    let ballIndex = phoneticSymbols.length - 1;
    let nullballIndex = 0;
    phoneticSymbols.forEach((v, i) => {
      let ballImg = this.physics.add.image(initPosition.x, initPosition.y, `${ballImgTexures[i]}`).setCircle(71.5, 71.5 * 0.5 + 15, 71.5 * 0.5 + 23);
      ballImg.setData("name", v.name);
      ballImg.setData("arrowIndex", i);
      let ballText = new Phaser.GameObjects.Text(this, 1024 * 0.5 + 10, 410, v.name, { align: "center", fontSize: "45px" ,fontFamily:"monospace"}).setOrigin(0.5);
      let ball = new Phaser.GameObjects.Container(this, 0, 0, [ballImg, ballText]);
      this.balls.add(ball);
    });
    this.createUpArrow();
    this.ballEvents(ballIndex, nullballIndex);
  }

  /**
   * 单个药品的上下交互
   */
  private ballEvents(ballIndex: number, nullballIndex: number): void {
    console.log(nullballIndex);
    let that = this;
    let nullBallOffsetX = 241;
    let nullball = this.physics.add.image(201 + nullballIndex * nullBallOffsetX, 67, "img_ballnull").setOrigin(0).setCircle(71.5 * 0.5, 71.5 * 0.5, 71.5 * 0.5);

    this.tweens.add({
      targets:nullball,
      alpha:0,
      duration:300,
      repeat:3,
      yoyo:true
    })

    this.nullballs.add(nullball);

    let ball: Phaser.GameObjects.Container = (<Phaser.GameObjects.Container>this.balls.list[ballIndex]);
    let speaker: Phaser.Sound.BaseSound = that.sound.add(ball.list[0].getData("name"));
    speaker.on("complete", function () {
      speaker.destroy();  //播放一次就销毁
    })
    ball.list[0].setInteractive({ pixelPerfect: true, alphaTolerance: 120, draggable: true });
    ball.list[0].on("drag", ballImgOnDrag);
    ball.list[0].on("dragstart", ballOnDragStart);
    ball.list[0].on("dragend", ballOnDragEnd);
    function ballImgOnDrag(pointer, dragX, dragY): void {
      (<Phaser.GameObjects.Image>ball.list[0]).setPosition(dragX, dragY);
      (<Phaser.GameObjects.Text>ball.list[1]).setPosition(dragX, dragY);
    }

    that.arrowRotateAni(nullballIndex,nullball);
    that.arrowAgainShow();

    function ballOnDragStart() {
      that.clickSound.play();
      that.status = "一轮上下拖拽开始";
      that.scaleMaxAni(this);
      that.arrowAgainHide();
    }

    function ballOnDragEnd() {
      console.log(that.status);
      if (that.status === "一轮上下拖拽结束") {
        return false;
      }
      that.arrowAgainShow();
      if (that.status !== "一个上下拖拽结束") {
        (<Phaser.GameObjects.Image>ball.list[0]).setPosition(1024 * 0.5 + 10, 410);
        (<Phaser.GameObjects.Text>ball.list[1]).setPosition(1024 * 0.5 + 10, 410);
      }
    }

    let collider = this.physics.add.overlap(ball.list[0], nullball, overlapHandler, null, this);


    function overlapHandler() {
      that.status = "一个上下拖拽结束";
      that.clickSound.play();
      ball.list[0].off("drag", ballImgOnDrag);
      ball.list[0].off("dragstart", ballOnDragStart);
      ball.list[0].off("dragend", ballOnDragEnd);
      (<Phaser.GameObjects.Image>ball.list[0]).setPosition(nullball.x + 71.5 * 0.5 + 40, nullball.y + 71.5 * 0.5 + 25);
      (<Phaser.GameObjects.Text>ball.list[1]).setPosition(nullball.x + 71.5 * 0.5 + 35, nullball.y + 71.5 * 0.5 + 35);
      nullball.destroy();  //直接销毁空球体
      speaker.play();
      collider.destroy();
      if (ballIndex === 0) {
        /**
         * 一轮拖拽结束
         */
        that.status = "一轮上下拖拽结束";
        clearArrows();
        that.createLeftRightArrow();
        that.ballLeftRightDrag();
        return false;
      }
      goOnWheelDrag();
    }

    function goOnWheelDrag() {
      ballIndex -= 1;
      nullballIndex += 1;
      that.ballEvents(ballIndex, nullballIndex);
    }

    function clearArrows() {
      arrowUpAni.stop(); //暂停动画
      that.arrows.removeAll();
    }
  }

  /**
   * 创建左右拖拽
   */
  private ballLeftRightDrag(): void {
    var that = this;
    var hits = 0;

    this.balls.list = this.balls.list.reverse(); //反向排序
    (this.balls.list[0] as Phaser.GameObjects.Container).list[0].setData("listIndex", 0);
    (this.balls.list[1] as Phaser.GameObjects.Container).list[0].setData("listIndex", 1);
    if (this.balls.list.length > 2) {
      (this.balls.list[2] as Phaser.GameObjects.Container).list[0].setData("listIndex", 2);
    }
    setTimeout(() => {
      this.balls.list.forEach((v, i) => {
        if (i !== 1) {
          (<Phaser.GameObjects.Container>v).list[0].on("dragstart", onLeftRightDragStart);
          (<Phaser.GameObjects.Container>v).list[0].on("drag", onLeftRightDrag);
          (<Phaser.GameObjects.Container>v).list[0].on("dragend", onLeftRightDragEnd);
        }
      })
    }, 1000);

    function onLeftRightDragStart() {
      that.status = "一个左或右拖拽开始";
      that.scaleMaxAni(this);
      this.setData("ox", this.x);
      this.setData("oy", this.y);
      this.parentContainer.list[1].setData("ox", this.parentContainer.list[1].x);
      this.parentContainer.list[1].setData("oy", this.parentContainer.list[1].y);
      that.arrowLRHide();  //隐藏箭头
    }

    /**
     * 在3个药品的情况下,检查并清除多余的箭头
     */
    function onLeftRightDragEnd() {
      if (that.status === "一轮左或右拖拽结束") {
        let arrowIndex: number = this.getData("arrowIndex");
        arrowIndex = arrowIndex === 2 ? 1 : arrowIndex;
        if (hits === 1 && that.balls.list.length > 2) {
          that.arrows.list[arrowIndex].destroy();
        }
      }
      if (that.status === "一个左或右拖拽开始") {
        /**在非镜像的情况下运行 */
        //  (<Phaser.GameObjects.Image>this).setPosition(this.getData("ox"), this.getData("oy"));
        //  (<Phaser.GameObjects.Text>this.parentContainer.list[1]).setPosition(
        //   this.parentContainer.list[1].getData("ox"),
        //   this.parentContainer.list[1].getData("oy")
        //   );
      }
      if (that.status !== "一轮左右拖拽结束") {
        that.arrowLRShow();
      }
    }

    function onLeftRightDrag(pointer, dragX, dragY): void {
      (<Phaser.GameObjects.Image>this).setPosition(dragX, dragY);
      (<Phaser.GameObjects.Text>this.parentContainer.list[1]).setPosition(dragX, dragY);
      if(that.balls.list.length > 2){
        setMirror.call(this, dragX, dragY);
      }
    }

    /* 镜像制作 */
    function setMirror(dragX, dragY): boolean | void {
      if (that.status === "一轮左右拖拽结束") {
        return false;
      }
      // @ts-ignore
      let x = that.balls.list[1].list[0].x + (that.balls.list[1].list[0].x - dragX);
      // @ts-ignore
      let y = that.balls.list[1].list[0].y + (that.balls.list[1].list[0].y - dragY);
      // @ts-ignore
      that.balls.list[(that.balls.list.length - 1) - this.getData("listIndex")].list[0].setPosition(x, y);
      // @ts-ignore
      that.balls.list[(that.balls.list.length - 1) - this.getData("listIndex")].list[1].setPosition(x, y);
    }

    let collider: Phaser.Physics.Arcade.Collider;   //声明一个碰撞器
    let collisoins: Array<Phaser.GameObjects.Image> = [];   //碰撞物序列
    let hitObject = (<Phaser.GameObjects.Container>this.balls.list[1]).list[0];  //被碰撞物
    // @ts-ignore
    const hitObjectX = <Phaser.Physics.Arcade.Image>hitObject.x;
    // @ts-ignore
    const hitObjectY = <Phaser.Physics.Arcade.Image>hitObject.y;

    this.balls.list.forEach(v => {
      // @ts-ignore
      collisoins.push(v.list[0]);
    })

    collider = this.physics.add.overlap(collisoins, hitObject, hitFuc, null, this);

    function hitFuc(...args) {
      that.correctSound.play();
      args[0].alpha = 0;
      args[0].parentContainer.list[1].alpha = 0;
      <Phaser.Physics.Arcade.Image>args[0].disableBody(true, true);
      hits += 1;
      that.status = "一轮左或右拖拽结束";
      that.scaleMaxAni(args[1]);
      if (hits === that.balls.list.length - 1) {
        that.boom();
        that.status = "一轮左右拖拽结束";
        args[0].off("drag", onLeftRightDrag);
        args[0].off("dragend", onLeftRightDragEnd);
        that.wordSpeaker.play();
        that.balls.removeAll();
        that.arrows.removeAll();
        collider.destroy();
        that.createCloudWord();
        that.createVoiceBtns();
      }
    }
  }

  /**
   * 创建云朵与单词
   */
  private createCloudWord(): void {
    let that = this;
    let cloud = new Phaser.GameObjects.Image(this, 242 + 521 * 0.5, 0 + 338 * 0.5, "img_cloud").setOrigin(0.5);
    cloud.displayWidth = 521;
    cloud.displayHeight = 338;
    let word = new Phaser.GameObjects.Text(this, 1024 * 0.5, 150, `${this.phoneticData[index].name}`, {
      align: "center",
      color: "rgb(178,90,176)",
      fontFamily: "monospace",
      fontSize: "120px"
    } as Phaser.Types.GameObjects.Text.TextSyle).setOrigin(0.5);
    this.cloudWord.add([cloud, word]);
    this.scaleMaxAni(cloud);
    this.scaleMaxAni(word);

    

    //cloud.input.cursor = 'pointer';
    word.setInteractive();
    word.on("pointerover",()=>{
      this.input.setDefaultCursor('url(assets/Game6/pointer.png), pointer');
    });
    word.on("pointerout",()=>{
      this.input.setDefaultCursor('');
    });
    cloud.setInteractive();
    cloud.on("pointerdown", () => {
      that.wordSpeaker.play();
      that.scaleMaxAni(word);
    });
  }

  /**
   * 创建语音按钮组
   */
  private createVoiceBtns(): void {
    let that = this;

    let luyinBtn = new Phaser.GameObjects.Sprite(this, 457 + 110 * 0.5, 417 + 110 * 0.5, "btn_luyin");
    let backplayBtn = new Button(this, 632 + 60 * 0.5, 442 + 60 * 0.5, "btn_last_1",new Phaser.Geom.Circle(60 * 0.5, 60 * 0.5, 60),Phaser.Geom.Circle.Contains).setOrigin(0.5).setAlpha(0);
    let originalBtn = new Button(this, 332 + 60 * 0.5, 442 + 60 * 0.5, "btn_last_2",new Phaser.Geom.Circle(60 * 0.5, 60 * 0.5, 60),Phaser.Geom.Circle.Contains).setOrigin(0.5).setAlpha(0);
    
    backplayBtn.minAlpha = 1;
    originalBtn.minAlpha = 1;


    let userRecoder: HTMLAudioElement = new Audio();
    let rec = Recorder({
      type: "wav",
      bitRate: 16,
      sampleRate: 16000
    });


    let cir = new Phaser.GameObjects.Graphics(this);
    cir.fillStyle(0xffffff, 1);
    let radius = 110 * 0.5 - 4;
    let ox = luyinBtn.x;
    let oy = luyinBtn.y;
    let radian = {
      value: 0
    }

    this.voiceBtns.add([luyinBtn, backplayBtn, originalBtn, cir]);

    let luyinTipsAni = this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets:luyinBtn,
      scale:1.1,
      yoyo:true,
      repeat:-1,
      duration:300
    })

    luyinBtn.setInteractive();
    luyinBtn.on("pointerover",()=>{
      luyinTipsAni.remove();
    });

    luyinBtn.on("pointerdown", recordReady);

    backplayBtn.setInteractive();
    backplayBtn.setData("haveRecord", "no");

    backplayBtn.pointerdownFunc = backplayBtnDown;

    function backplayBtnDown() {
      let haveRecord = backplayBtn.getData("haveRecord");
      if (haveRecord === "no") {
        return false;
      }
      that.clickSound.play();
      userRecoder.play();
    }


    originalBtn.setInteractive();
    originalBtn.pointerdownFunc = originalBtnDown;

    function originalBtnDown() {
      that.clickSound.play();
      that.wordSpeaker.play();
    }

    let cirAni = this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: radian,
      value: 2 * Math.PI,
      duration: 3000,   //录音时间3秒钟
      paused: true,
      onStart: recordStartFuc,
      onUpdate: aniPlay,
      onComplete: recordEndFuc
    }))

    function recordStartFuc() {
      originalBtn.setAlpha(0);
      backplayBtn.setAlpha(0);
      that.cloudWord.setAlpha(0);
      rec.start();
    }

    function aniPlay() {
      let dx = ox + radius * Math.cos(radian.value);
      let dy = oy + radius * Math.sin(radian.value);
      cir.fillCircle(dx, dy, 4)
    }

    function recordEndFuc() {
      if(ableStop===1){
        luyinBtn.off("pointerdown", recordReady);
      }
      resetStart();
      let analysisMask:Phaser.GameObjects.Container = createMaskAnalysis();
      that.bgm.resume();
      backplayBtn.setData("haveRecord", "yes");
      rec.stop((blob:any) => {
        rec.close();
        userRecoder.src = URL.createObjectURL(blob);
        userRecoder.play();
        let file:File = new File([blob],'aaa.wav',{
          type : blob.type
        });
        post(apiPath.uploadRecord, {file}, 'json', true)
          .then(res => {
            analysisMask.destroy();
            luyinBtn.setTexture("btn_luyin");
            analysisMask.destroy();
            originalBtn.setAlpha(1);
            backplayBtn.setAlpha(1);
            let correctAnswer = that.phoneticData[index].name;
            let result = res.result;
            checkoutResult(correctAnswer, result);
          });
      });
    }

    function createMaskAnalysis():Phaser.GameObjects.Container{
      let bgShape = new Phaser.GameObjects.Graphics(that);
      bgShape.fillStyle(0x000000,0.6);
      bgShape.fillRect(0,0,W,H);
      let analysis = new Phaser.GameObjects.Image(that,W*0.5,H*0.5,"analysis").setOrigin(0.5);
      let maskAnalysis = new Phaser.GameObjects.Container(that);
      maskAnalysis.add([bgShape,analysis]);
      that.add.existing(maskAnalysis);
      return maskAnalysis;
    }

    function checkoutResult(correctAnswer, result) {
      console.log(that.recordTimes);
      if (correctAnswer === result) {
        alertBarEl("tips_goodjob", that.nextLevel.bind(that));
      } else {
        if (that.recordTimes === 2) {
          alertBarEl("tips_no", that.nextLevel.bind(that));
        } else {
          alertBarEl("tips_tryagain", () => {
            that.cloudWord.setAlpha(1);
            if(ableStop===2||ableStop===1){
            luyinBtn.on("pointerdown", recordReady);
            }
            ableStop = 0;
          });
        }
      }
    }

    function alertBarEl(texture: string, callBack) {
      if (texture === "tips_goodjob") {
        that.correctSound.play();
      }
      if (texture === "tips_tryagain" || texture === "tips_no") {
        that.wrongSound.play();
      }
      let alertBar = that.add.image(242 + 521 * 0.5, 0 + 338 * 0.5, texture);
      that.boom();
      that.scaleMaxAni(alertBar);
      that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
        targets: alertBar,
        scale: 0.5,
        alpha: 0,
        duration: 1000,
        delay: 1000,
        onComplete: () => {
          alertBar.destroy();
          callBack();
        }
      });
    }

    function resetStart() {
      radian.value = 0;
      cir.clear();
      cir.fillStyle(0xffffff, 1);
    }


    function recordReady() {
      luyinTipsAni.remove();
      if(ableStop===1){
          luyinBtn.off("pointerdown", recordReady);
          ableStop = 2;
          console.log("已经停止");
          cirAni.complete();
          //radian.value = Math.PI*1.9;
          return false;
      }
      rec.open(() => {
        ableStop = 1;
        that.recordTimes += 1;
        that.bgm.pause();
        luyinBtn.setTexture("btn_luyin_progress");
        backplayBtn.setData("haveRecord", "no");
        cirAni.play();
      }, (errMsg, isUserNotAllow) => {
        if (isUserNotAllow) {
          alert("您拒绝赋予本应用录音的权限");
          return false;
        }
        if (errMsg) {
          console.log(errMsg);
        }
      });
    }
  }

  /**
   * 下一关
   */
  private nextLevel(): void {
    this.recordTimes = 0;
    this.status = null;
    ableStop = 0;
    index += 1;
    index = index % this.phoneticData.length;
    this.scene.start('Game6PlayScene', {
      data: this.phoneticData,
      index: index
    });
  }

  /**
   * 箭头旋转角度，位置重置，目标方向的改变
   */
  private arrowRotateAni(_nullballIndex:number,_nullball:Phaser.GameObjects.Image):void{
    arrowUpObj.setPosition(initPosition.x,initPosition.y);
    arrowUpObj.rotation = Phaser.Math.DegToRad(-45 + _nullballIndex*45);
    arrowUpObj.alpha = 0.7;
    arrowUpAni = this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: arrowUpObj,
      x: _nullball.x + _nullball.width*0.5,
      y: _nullball.y + _nullball.height*0.5,
      alpha: 0,
      duration: 750,
      repeat: -1,
      ease:'Sine.easeOut'
    }))
  }

  /**
   * 箭头再现
   */
  private arrowAgainShow(): void {
    this.arrows.add(arrowUpObj);
    (arrowUpAni as Phaser.Tweens.Tween).play();
  }

  /**
   * 箭头再次隐藏
   */
  private arrowAgainHide(): void {
    this.arrows.remove(arrowUpObj);
    //(arrowUpAni as Phaser.Tweens.Tween).duration = 2000;
    (arrowUpAni as Phaser.Tweens.Tween).stop();
  }

  /**
   * 销毁所有的药品
   */
  private destroyBalls(): void {
    this.balls.destroy();
    this.arrows.removeAll();
  }

  /**
   * 创建上下循环的箭头及动画
   */
  private createUpArrow(): void {
    let arrowUp = new Phaser.GameObjects.Image(this, initPosition.x, initPosition.y, "tips_arrow_up").setOrigin(0.5).setAlpha(0);
    arrowUpObj = arrowUp;
    this.arrows.add(arrowUp);
  }

  /**
   * 创建左右循环的箭头及动画
   */
  private createLeftRightArrow(): void {
    arrowLObj = new Phaser.GameObjects.Image(this, 567 + 128 * 0.5 + 100, 65 + 168 * 0.5 - 10, "tips_arrow_left").setOrigin(0.5).setAlpha(1);   //在右边
    arrowRObj = new Phaser.GameObjects.Image(this, 331 + 128 * 0.5 - 100, 65 + 168 * 0.5 - 10, "tips_arrow_right").setOrigin(0.5).setAlpha(1);    //在左边
    this.arrows.add([arrowLObj, arrowRObj]);
    arrowLRAni = this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: [arrowLObj, arrowRObj],
      x: 1024 * 0.5,
      alpha: 0,
      duration: 800,
      repeat: -1
    }))

    if (this.balls.list.length < 3) {
      arrowLObj.alpha = 0;
    }
  }

  /**
   * 放大且Q弹的动效
   */
  private scaleMaxAni(obj): void {
    let ani: Phaser.Tweens.Tween = this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: obj,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      onComplete: function () {
        ani.remove();
      }
    })
  }

  /**
   * 缩小且Q弹的动效
   */
  private scaleMinAni(obj): void {
    let ani: Phaser.Tweens.Tween = this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: obj,
      scale: 0.6,
      duration: 100,
      yoyo: true,
      onComplete: function () {
        ani.remove();
      }
    })
  }

  /**
   * 显示左右箭头
   */
  private arrowLRShow() {
    arrowLRAni.play();
  }

  /**
   * 隐藏左右箭头
   */
  private arrowLRHide() {
    arrowLRAni.stop();
    arrowRObj.alpha = 0;
    arrowLObj.alpha = 0;
  }


  /* 创建背景音乐 ，并设置为自动播放*/
  private createAudio(): void {
    let audioKey = this.phoneticData[index].name;
    this.wordSpeaker = this.sound.add(audioKey);

  }

  /* 搭建静态场景 */
  private createStaticScene(): void {
    let that = this;
    this.bg = new Phaser.GameObjects.Image(this, 0, 0, "bg").setOrigin(0);

    this.btn_exit = new ButtonExit(this);
    this.btn_sound = new ButtonMusic(this);

    this.staticScene = new Phaser.GameObjects.Container(this, 0, 0, [
      this.bg,
      this.btn_exit,
      this.btn_sound,
    ]);

    this.add.existing(this.staticScene);

  }

};

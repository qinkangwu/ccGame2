/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';
import { Game6DataItem } from '../../interface/Game6';
import apiPath from '../../lib/apiPath';
import { post } from '../../lib/http';
import { EASE, StaticAni } from '../../Public/jonny/core/Animate';
import { cover, rotateTips,CONSTANT } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import { config } from '../../interface/TipsParticlesEmitter';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import PlanAnims from '../../Public/PlanAnims';


declare var Fr: any;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const W = 1024;
const H = 552;
const vol = 0.3; //背景音乐的音量

var ableStop: number = 0;  //0=>不能停止，1=>能停止,2=>已经停止
var index: number; //题目的指针，默认为0
var goldValue: number = 20; //金币的值
var isMicrophone: boolean = true; //查看是否有麦克风

var arrowUpObj: any = null;
var arrowUpAni: any = null;
var arrowLRAni: any = null;
var arrowLObj: any = null;
var arrowRObj: any = null;

const initPosition = {
  x:516.45, 
  y:417.15
}


export default class Game6PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态
  private recordTimes: number;

  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private clickSound: Phaser.Sound.BaseSound;
  private correctSound: Phaser.Sound.BaseSound;


  private phoneticData: Game6DataItem[] = []; //音标数据
  private bg: Phaser.GameObjects.Image; //背景图片
  private btn_exit: Button;  //退出按钮
  private btn_sound: ButtonMusic; //音乐按钮
  private gold: Gold; //金币
  private staticScene: Phaser.GameObjects.Container; // 静态组

  private balls: Phaser.GameObjects.Container; //药品序列
  private nullballs: Phaser.GameObjects.Container; //空圆序列
  private arrows: Phaser.GameObjects.Container; //箭头序列
  private cloudWord: Phaser.GameObjects.Container; //单词容器
  private voiceBtns: Phaser.GameObjects.Container; //语音按钮组
  private wordSpeaker: Phaser.Sound.BaseSound;   //单词播放器
  private userRecoder: HTMLAudioElement = document.createElement("audio");


  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager; // 粒子控制器
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter;  //粒子发射器
  //private tipsParticlesEmitterConfig: config;  //成功、失败触发器
  private tipsParticlesEmitter: TipsParticlesEmitter; //成功、失败触发器
  private planAnims: PlanAnims; //专场动画


  constructor() {
    super({
      key: "Game6PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
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
    //index = 6; //test
    this.createStaticScene();
    this.createAudio();
    this.createDynamicScene();
    this.createEmitter();
    this.gameStart();
    if (index === 0) {
      this.scene.pause();
      Fr.voice.init();
      this.createBgm();
      rotateTips.init();
      cover(this, "cover", () => {
        this.planAnims.show(index + 1)
      });
    }
  }


  update(time: number, delta: number): void {
    this.btn_sound.mountUpdate();
  }


  /** * 游戏开始 */
  public gameStart(): void {
    if (index !== 0) {
      this.planAnims.show(index + 1, this.createBalls);
    } else {
      this.createBalls();
    }
  }

  /* 建立动态场景 */
  private createDynamicScene(): void {
    this.balls = new Phaser.GameObjects.Container(this);
    this.nullballs = new Phaser.GameObjects.Container(this);
    this.arrows = new Phaser.GameObjects.Container(this);
    this.cloudWord = new Phaser.GameObjects.Container(this);
    this.voiceBtns = new Phaser.GameObjects.Container(this);
    this.planAnims = new PlanAnims(this, this.phoneticData.length);
    this.add.existing(this.balls);
    this.add.existing(this.nullballs);
    this.add.existing(this.arrows);
    this.add.existing(this.cloudWord);
    this.add.existing(this.voiceBtns);
  }

  /**
   * 创建粒子效果发射器
   * 创建成功失败触发器
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
  }

  /* 创建药瓶 */
  private createBalls(): void {
    /**
     * 测试接口
     */
    //index = 6;
    let that = this;
    let count = 0;
    let _delay = index === 0 ? 2300 : 0;

    let ballImgTexures: Array<string> = ["img_ballgreen", "img_ballpurple", "img_ballyellow"];
    let phoneticSymbols = this.phoneticData[index].phoneticSymbols.reverse();
    let ballIndex = phoneticSymbols.length - 1;
    let nullballIndex = 0;
    phoneticSymbols.forEach((v, i) => {
      let ballImg = this.add.image(-121,-129,`${ballImgTexures[i]}`).setOrigin(0);
      let ballText = new Phaser.GameObjects.BitmapText(this,-5,18, "GenJyuuGothic47", v.name, 47, 0.5).setOrigin(0.5);
      let ball = new Phaser.GameObjects.Container(this, initPosition.x, initPosition.y, [ballImg, ballText]).setScale(0);
      ball.setData("name",v.name);
      ball.name = v.name;
      ball.setData("arrowIndex", i);
      this.balls.add(ball);
      initAni(ball);
    });

    //@ts-ignore
    // setTimeout(initAni.bind(this,this.balls.list[2].list[0]),3000);
    function initAni(obj) {
      that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
        //@ts-ignore
        targets: obj,
        delay: _delay,
        scale: 1,
        duration: 1000,
        ease: EASE.spring,
        onComplete: () => {
           that.physics.world.enable(obj);
           obj.body.setCircle(72,-72,-72);
           obj.body.setCollideWorldBounds(true);
          if (count === 0) {
            count = 1;
            that.createUpArrow();
            that.ballEvents(ballIndex, nullballIndex);
          }
        }
      });
    }
  }

  /**
   * 单个药品的上下交互
   */
  private ballEvents(ballIndex: number, nullballIndex: number): void {
    let that = this;
    let nullBallOffsetX = 241;
    let nullball = this.physics.add.image(201 + nullballIndex * nullBallOffsetX, 67, "img_ballnull").setOrigin(0).setCircle(73.5*0.5,73.5*0.5,73.5*0.5);

    this.tweens.add({
      targets: nullball,
      alpha: 0,
      duration: 300,
      repeat: 3,
      yoyo: true
    })

    this.nullballs.add(nullball);

    let ball: Phaser.GameObjects.Container = (<Phaser.GameObjects.Container>this.balls.list[ballIndex]);
    let speaker: Phaser.Sound.BaseSound = that.sound.add(ball.getData("name"));
    speaker.on("complete", function () {
      speaker.destroy();  //播放一次就销毁
    })
    ball.setInteractive(new Phaser.Geom.Circle(0,0,72),Phaser.Geom.Circle.Contains,true);

    this.input.setDraggable(ball,true);

    ball.on("drag", ballOnDrag);
    ball.on("dragstart", ballOnDragStart);
    ball.on("dragend", ballOnDragEnd);

    function ballOnDrag(pointer,dragX, dragY): void {
      StaticAni.alphaScaleFuc(this,1, 1, 1);
      this.setPosition(dragX, dragY);
    }

    that.arrowRotateAni(nullballIndex, nullball);
    that.arrowAgainShow();

    function ballOnDragStart() {
      that.clickSound.play();
      that.status = "一轮上下拖拽开始";
      StaticAni.alphaScaleFuc(this, 1.2, 1.2, 1);
      that.arrowAgainHide();
    }

    function ballOnDragEnd() {
      StaticAni.alphaScaleFuc(this, 1, 1, 1);
      if (that.status === "一轮上下拖拽结束") {
        return false;
      }
      that.arrowAgainShow();
      if (that.status !== "一个上下拖拽结束") {
        this.setPosition(initPosition.x, initPosition.y);
      }
    }

    let collider = this.physics.add.overlap(ball, nullball, overlapHandler, null, this);


    function overlapHandler() {
      that.status = "一个上下拖拽结束";
      that.clickSound.play();
      //that.input.setDraggable(ball,false);
       ball.off("drag", ballOnDrag);
       ball.off("dragstart", ballOnDragStart);
       ball.off("dragend", ballOnDragEnd);
      ball.setPosition(nullball.x + 71.5 * 0.5 + 40, nullball.y + 71.5 * 0.5 + 25);
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
    this.balls.list[0].setData("listIndex", 0);
    this.balls.list[1].setData("listIndex", 1);
    if (this.balls.list.length > 2) {
      (this.balls.list[2] as Phaser.GameObjects.Container).setData("listIndex", 2);
    }
    setTimeout(() => {
      this.balls.list.forEach((v, i) => {
        if (i !== 1) {
          v.setData("initPosition",{
            //@ts-ignore
            x:v.x,
            //@ts-ignore
            y:v.y
          });
          v.on("dragstart", onLeftRightDragStart);
          v.on("drag", onLeftRightDrag);
          v.on("dragend", onLeftRightDragEnd);
        }
      })
    }, 1000);

    function onLeftRightDragStart() {
     this.body.setCollideWorldBounds(true);
      that.status = "一个左或右拖拽开始";
      that.scaleMaxAni(this);
      this.setData("ox", this.x);
      this.setData("oy", this.y);
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
        that.balls.list.forEach((ball,i)=>{
          if(i!==1){
            (ball as Phaser.GameObjects.Container).setPosition(
              ball.getData("initPosition").x,
              ball.getData("initPosition").y,
            )
          }
        })
        that.arrowLRShow();
      }
    }

    function onLeftRightDrag(pointer, dragX, dragY): void {
      this.setPosition(dragX, dragY);
      if (that.balls.list.length > 2) {
       setMirror.call(this, dragX, dragY);   
      }
    }

    /* 镜像制作 */
    function setMirror(dragX, dragY): boolean | void {
      if (that.status === "一轮左右拖拽结束") {
        return false;
      }
      // @ts-ignore
      let x = that.balls.list[1].x + (that.balls.list[1].x - dragX);
      // @ts-ignore
      let y = that.balls.list[1].y + (that.balls.list[1].y - dragY);
      // @ts-ignore
      let mirrorBall = that.balls.list[(that.balls.list.length - 1) - this.getData("listIndex")].setPosition(x, y);
      mirrorBall.body.setCollideWorldBounds(false);
      // @ts-ignore
    }

    let collider: Phaser.Physics.Arcade.Collider;   //声明一个碰撞器
    let collisoins: Array<Phaser.GameObjects.Container> = [];   //碰撞物序列
    let hitObject = this.balls.list[1];  //被碰撞物
    // @ts-ignore
    const hitObjectX = <Phaser.Physics.Arcade.Image>hitObject.x;
    // @ts-ignore
    const hitObjectY = <Phaser.Physics.Arcade.Image>hitObject.y;

    this.balls.list.forEach(v => {
      // @ts-ignore
      collisoins.push(v);
    })

    collider = this.physics.add.overlap(collisoins, hitObject, hitFuc, null, this);

    function hitFuc(...args) {
      that.correctSound.play();
      args[0].alpha = 0;
      args[0].parentContainer.list[1].alpha = 0;
      args[0].body.destroy();
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
    let word = new Phaser.GameObjects.BitmapText(this, 1024 * 0.5, 150, "GenJyuuGothic", `${this.phoneticData[index].name}`, 120, 0.5).setOrigin(0.5);
    word.tint = 0xb25ab0;
    this.cloudWord.add([cloud, word]);
    this.scaleMaxAni(cloud);
    this.scaleMaxAni(word);
    word.setInteractive();
    word.on("pointerover", () => {
      this.input.setDefaultCursor('url(assets/Game6/pointer.png), pointer');
    });
    word.on("pointerout", () => {
      this.input.setDefaultCursor('');
    });
    word.on("pointerdown", () => {
      that.wordSpeaker.play();
      StaticAni.alphaScaleFuc(word, 1.2, 1.2, 1);
    });
    word.on("pointerup", () => {
      StaticAni.alphaScaleFuc(word, 1, 1, 1);
    });
  }

  /**
   * 创建语音按钮组
   */
  private createVoiceBtns(): void {
    let that = this;

    let luyinBtn = new Phaser.GameObjects.Sprite(this, 457 + 110 * 0.5, 417 + 110 * 0.5, "btn_luyin");
    let backplayBtn = new Button(this, 632 + 60 * 0.5, 442 + 60 * 0.5, "btn_last_1", new Phaser.Geom.Circle(60 * 0.5, 60 * 0.5, 60), Phaser.Geom.Circle.Contains).setOrigin(0.5).setAlpha(0);
    let originalBtn = new Button(this, 332 + 60 * 0.5, 442 + 60 * 0.5, "btn_last_2", new Phaser.Geom.Circle(60 * 0.5, 60 * 0.5, 60), Phaser.Geom.Circle.Contains).setOrigin(0.5).setAlpha(0);

    backplayBtn.minAlpha = 1;
    originalBtn.minAlpha = 1;



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
      targets: luyinBtn,
      scale: 1.1,
      yoyo: true,
      repeat: -1,
      duration: 300
    })

    luyinBtn.setInteractive();
    luyinBtn.on("pointerover", () => {
      luyinBtn.scale = 1;
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
      that.userRecoder.play();
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
      // originalBtn.setAlpha(0);
      // backplayBtn.setAlpha(0);
      //Fr.voice.record();
    }

    function aniPlay() {
      let dx = ox + radius * Math.cos(radian.value);
      let dy = oy + radius * Math.sin(radian.value);
      cir.fillCircle(dx, dy, 4)
    }

    function recordEndFuc() {
      that.cloudWord.setAlpha(0);
      //that.voiceBtns.setAlpha(0);
      if (ableStop === 1) {
        luyinBtn.off("pointerdown", recordReady);
      }
      resetStart();
      let analysisMask: Phaser.GameObjects.Container = createMaskAnalysis();
      that.bgm.resume();
      backplayBtn.setData("haveRecord", "yes");
      Fr.voice.export(function (blob) {
        Fr.voice.stop();
        let file: File = new File([blob], 'aaa.wav', {
          type: blob.type
        });
        post(apiPath.uploadRecord, { file }, 'json', true)
          .then(res => {
            analysisMask.destroy();
            luyinBtn.setTexture("btn_luyin");
            originalBtn.setAlpha(1); backplayBtn.setAlpha(1);
            originalBtn.interactive = false; backplayBtn.interactive = false;
            let correctAnswer = that.phoneticData[index].name;
            let result = res.result;
            checkoutResult(correctAnswer, result);
          })
          .then(()=>{
            let reader = new (window as any).FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
              let base64data = reader.result;
              that.userRecoder.setAttribute("src",base64data);
            };
          })
          .catch(error => {
            console.log(error);
            checkoutResult("error", "err");
          })
      })
    }

    function createMaskAnalysis(): Phaser.GameObjects.Container {
      let bgShape = new Phaser.GameObjects.Graphics(that);
      bgShape.fillStyle(0x000000, 0.6);
      bgShape.fillRect(0, 0, W, H);
      let analysis = new Phaser.GameObjects.Image(that, W * 0.5, H * 0.5, "analysis").setOrigin(0.5);
      let maskAnalysis = new Phaser.GameObjects.Container(that);
      maskAnalysis.add([bgShape, analysis]);
      that.add.existing(maskAnalysis);
      return maskAnalysis;
    }

    function checkoutResult(correctAnswer, result) {
      let tipsParticlesEmitterConfig = {   //反馈触发器的配置
        nextCb: that.nextLevel.bind(that, "next"),
        successCb: that.nextLevel.bind(that, "success"),
        tryAgainCb: () => {
            originalBtn.interactive = true;
            backplayBtn.interactive = true;
          that.voiceBtns.setAlpha(1);
          that.cloudWord.setAlpha(1);
          if (ableStop === 2 || ableStop === 1) {
            luyinBtn.on("pointerdown", recordReady);
          }
          ableStop = 0;
        }
      }

      that.tipsParticlesEmitter = new TipsParticlesEmitter(that);


      //correctAnswer = result; //test 
      if (correctAnswer === result) {     //正确
        that.tipsParticlesEmitter.success(tipsParticlesEmitterConfig.successCb);
      } else {
        if (goldValue === 0) {
          alert("啊哦，你又错啦！金币不足，一起去赚金币吧");
          that.scene.pause();
          return false;
        }
        if (that.recordTimes >= 2) {    //没有机会
          that.tipsParticlesEmitter.error(tipsParticlesEmitterConfig.nextCb,tipsParticlesEmitterConfig.tryAgainCb);
        } else {
          that.tipsParticlesEmitter.tryAgain(tipsParticlesEmitterConfig.tryAgainCb);   //再试一次
        }

      }
    }



    function resetStart() {
      radian.value = 0;
      cir.clear();
      cir.fillStyle(0xffffff, 1);
    }


    function recordReady() {
      if (!isMicrophone) {
        errCallback();
        return false;
      }

      luyinTipsAni.remove();
      luyinBtn.scale = 1;
      // if(ableStop===1){
      luyinBtn.off("pointerdown", recordReady);
      ableStop = 2;
      //     console.log("已经停止");
      //     cirAni.complete();
      //     return false;
      // }

      Fr.voice.record(
        false,  //非直播，false
        finishCallback,  //成功打开录音功能的回调
        recordingCallback,  //录音过程中的更新回调
        errCallback    //错误回调
      );

      function finishCallback() {
        // setTimeout(()=>{     =>暂时关闭停止功能
        //   ableStop = 1;
        // },1500)
        that.recordTimes += 1;
        that.setGoldValue(-1);
        console.log("this.recordTimes", that.recordTimes);
        that.bgm.pause();
        luyinBtn.setTexture("btn_luyin_progress");
        backplayBtn.setData("haveRecord", "no");
        cirAni.play();
      }

      function recordingCallback() {
        console.log("音频正在录制中");
      }

      function errCallback() {
        alert("没有麦克风输入或已被拒绝授权,插入麦克风后，请刷新页面继续游戏");
        isMicrophone = false;
        luyinBtn.on("pointerdown", recordReady);
      }


    }
  }

  /**
   * 设置金币的动作
   */
  private setGoldValue(value: number) {
    goldValue += value;
    this.gold.setText(goldValue);
  }

  /**
   * 检查金币是否为0
   */
  private checkoutGoldValue(): boolean {
    return goldValue < 0 ? true : false;
  }

  /**
   * 下一关
   */
  private nextLevel(keyword): void {
    let _config = {
      callback: () => {
        this.setGoldValue(3);
        setTimeout(() => {
          this.scene.start('Game6PlayScene', {
            data: this.phoneticData,
            index: index
          });
        }, 1000)
        /** work init */

      }
    }
    let sellingGold = new SellingGold(this, _config);

    this.recordTimes = 0;
    this.status = null;
    ableStop = 0;
    index += 1;
    if (index > this.phoneticData.length - 1) {
      window.location.href = CONSTANT.INDEX_URL;
    }
    //index = index % this.phoneticData.length;
    if (keyword === "success") {
      sellingGold.goodJob(3);
    }
    if (keyword === "next") {
      this.scene.start('Game6PlayScene', {
        data: this.phoneticData,
        index: index
      });
    }


  }

  /**
   * 箭头旋转角度，位置重置，目标方向的改变
   */
  private arrowRotateAni(_nullballIndex: number, _nullball: Phaser.GameObjects.Image): void {
    //console.log(arrowUpObj.x,arrowUpObj.y,_nullball.x,_nullball.y);
    arrowUpObj.setPosition(initPosition.x, initPosition.y);
    arrowUpObj.rotation = Phaser.Math.DegToRad(-45 + _nullballIndex * 45);
    arrowUpObj.alpha = 0.7;
    arrowUpAni = this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: arrowUpObj,
      x: _nullball.x + _nullball.width * 0.5,
      y: _nullball.y + _nullball.height * 0.5,
      alpha: 0,
      duration: 1000,
      repeat: -1,
      ease: 'Sine.easeOut',
      paused:true
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
    let ani: Phaser.Tweens.Tween;
    if (ani !== undefined) {
      ani.remove();
    }
    ani = this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
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

    this.gold = new Gold(this, goldValue);   //设置金币

    this.staticScene = new Phaser.GameObjects.Container(this, 0, 0, [
      this.bg,
      this.btn_exit,
      this.btn_sound,
      this.gold
    ]);

    this.add.existing(this.staticScene);

  }

};

import 'phaser';
import { Game6DataItem } from '../../interface/Game6';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0

var arrowUpObj: any = null;
var arrowUpAni: any = null;

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
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private phoneticData: Game6DataItem[] = []; //音标数据
  private bg: Phaser.GameObjects.Image; //背景图片 
  private btn_exit: Phaser.GameObjects.Image;  //退出按钮
  private btn_sound: Phaser.GameObjects.Sprite; //音乐按钮
  private staticScene: Phaser.GameObjects.Container; // 静态组

  private balls: Phaser.GameObjects.Container; //药品序列
  private nullballs: Phaser.GameObjects.Container; //空圆序列
  private arrows: Phaser.GameObjects.Container; //箭头序列
  private cloudWord: Phaser.GameObjects.Container; //单词容器
  private voiceBtns: Phaser.GameObjects.Container; //语音按钮组
  private wordSpeaker: Phaser.Sound.BaseSound;   //单词播放器
  //private btns:Phaser.GameObjects.Container; 

  constructor() {
    super({
      key: "Game6PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    this.resize();
    index = res.index;
    this.phoneticData = res.data.map(function (v) {
      delete v.uselessPhoneticSymbols;
      return v;
    });
  }

  preload(): void {
    let currentPhoneticData = this.phoneticData[index];
    this.load.audio(currentPhoneticData.name, currentPhoneticData.audioKey);
    currentPhoneticData.phoneticSymbols.forEach(_v => {
      this.load.audio(_v.name, _v.audioKey);
    })
  }

  create(): void {
    this.createAudio();
    this.createStaticScene();
    this.createDynamicScene();
    this.gameStart();
  }

  update(time: number, delta: number): void {
  }


  /**
   * 重置画布尺寸与定位
   */
  private resize(): void {
    var content: HTMLElement = document.querySelector("#content");
    content.style.backgroundColor = "#000000";
    var canvas = document.querySelector("canvas");
    canvas.className = "obj-cover-center";
    this.scale.resize(1024, 552);
    canvas.setAttribute("style", `
      width: 100% !important;
      height: 100% !important;
      object-fit: contain;
      object-position: center;
      `)
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
      let ballImg = this.physics.add.image(1024 * 0.5 + 10, 410, `${ballImgTexures[i]}`).setCircle(71.5, 71.5 * 0.5 + 15, 71.5 * 0.5 + 23);
      ballImg.setData("name", v.name);
      ballImg.setData("arrowIndex", i);
      let ballText = new Phaser.GameObjects.Text(this, 1024 * 0.5 + 10, 410, v.name, { align: "center", fontSize: "45px" }).setOrigin(0.5);
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
    let that = this;
    let nullBallOffsetX = 241;
    let nullball = this.physics.add.image(201 + nullballIndex * nullBallOffsetX, 67, "img_ballnull").setOrigin(0).setCircle(71.5 * 0.5, 71.5 * 0.5, 71.5 * 0.5);
    this.nullballs.add(nullball);

    let ball: Phaser.GameObjects.Container = (<Phaser.GameObjects.Container>this.balls.list[ballIndex]);
    let speaker: Phaser.Sound.BaseSound = that.sound.add(ball.list[0].getData("name"));
    speaker.on("complete", function () {
      speaker.destroy();  //播放一次就销毁
    })
    ball.list[0].setInteractive({ pixelPerfect: true, alphaTolerance: 120, draggable: true });
    ball.list[0].on("drag", ballImgOnDrag);
    function ballImgOnDrag(pointer, dragX, dragY): void {
      (<Phaser.GameObjects.Image>ball.list[0]).setPosition(dragX, dragY);
      (<Phaser.GameObjects.Text>ball.list[1]).setPosition(dragX, dragY);
    }

    let collider = this.physics.add.overlap(ball.list[0], nullball, overlapHandler, null, this);


    function overlapHandler() {
      ball.list[0].off("drag", ballImgOnDrag);
      (<Phaser.GameObjects.Image>ball.list[0]).setPosition(nullball.x + 71.5 * 0.5 + 40, nullball.y + 71.5 * 0.5 + 25);
      (<Phaser.GameObjects.Text>ball.list[1]).setPosition(nullball.x + 71.5 * 0.5 + 35, nullball.y + 71.5 * 0.5 + 35);
      nullball.destroy();  //直接销毁空球体
      speaker.play();
      collider.destroy();
      if (ballIndex === 0) {
        /**
         * 一轮拖拽结束
         */
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
      //that.tweens.killAll();
      // (that.arrows.list[0] as Phaser.GameObjects.Image).alpha = 0;
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
    setTimeout(() => {
      this.balls.list.forEach((v, i) => {
        if (i !== 1) {
          (<Phaser.GameObjects.Container>v).list[0].on("drag", onLeftRightDrag);
          //(<Phaser.GameObjects.Container>v).list[0].on("dragstart", onLeftRightDragStart);
          (<Phaser.GameObjects.Container>v).list[0].on("dragend", onLeftRightDragEnd);
        }
      })
    }, 1000);

    /**
     * 在3个药品的情况下,检查并清除多余的箭头
     */
    function onLeftRightDragEnd() {
      let arrowIndex: number = this.getData("arrowIndex");
      arrowIndex = arrowIndex === 2 ? 1 : arrowIndex;
      if (hits === 1 && that.balls.list.length > 2) {
        that.arrows.list[arrowIndex].destroy();
      }
    }

    function onLeftRightDrag(pointer, dragX, dragY): void {
      (<Phaser.GameObjects.Image>this).setPosition(dragX, dragY);
      (<Phaser.GameObjects.Text>this.parentContainer.list[1]).setPosition(dragX, dragY);
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
      args[0].alpha = 0;
      args[0].parentContainer.list[1].alpha = 0;
      <Phaser.Physics.Arcade.Image>args[0].disableBody(true, true);
      hits += 1;
      if (hits === that.balls.list.length - 1) {
        args[0].off("drag", onLeftRightDrag);
        args[0].off("dragend", onLeftRightDragEnd);
        that.balls.removeAll();
        that.arrows.removeAll();
        collider.destroy();
        that.createCloudWord();
        that.createVoiceBtns();
        that.arrowAgainShow();
      }
    }
  }

  /**
   * 创建云朵与单词
   */
  private createCloudWord(): void {
    let cloud = new Phaser.GameObjects.Image(this, 242, 0, "img_cloud").setOrigin(0);
    cloud.displayWidth = 521;
    cloud.displayHeight = 338;
    let word = new Phaser.GameObjects.Text(this, 1024 * 0.5, 150, `${this.phoneticData[index].name}`, {
      align: "center",
      color: "rgb(178,90,176)",
      fontFamily: "ArialRoundedMTBold",
      fontSize: "120px"
    } as Phaser.Types.GameObjects.Text.TextSyle).setOrigin(0.5);
    this.cloudWord.add([cloud, word]);

  }

  /**
   * 创建语音按钮组
   */
  private createVoiceBtns(): void {
    let that = this;

    let luyinBtn = new Phaser.GameObjects.Sprite(this, 457 + 110 * 0.5, 417 + 110 * 0.5, "btn_luyin");
    let backplayBtn = new Phaser.GameObjects.Image(this, 632 + 60 * 0.5, 442 + 60 * 0.5, "btn_last_1").setOrigin(0.5).setAlpha(0.7);
    let originalBtn = new Phaser.GameObjects.Image(this, 332 + 60 * 0.5, 442 + 60 * 0.5, "btn_last_2").setOrigin(0.5).setAlpha(0.7);

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

    luyinBtn.setInteractive();
    luyinBtn.on("pointerdown", recordReady);

    backplayBtn.setInteractive();
    backplayBtn.setData("haveRecord", "no");

    backplayBtn.on("pointerdown",backplayBtnDown);
    backplayBtn.on("pointerup",backplayBtnUp);

    function backplayBtnDown(){
      let haveRecord = backplayBtn.getData("haveRecord");
      if (haveRecord === "no") {
        return false;
      }
      alphaScaleMax.call(this);
      userRecoder.play();
    }

    function backplayBtnUp(){
      alphaScaleMin.call(this);
    }


    originalBtn.setInteractive();
    originalBtn.on("pointerdown",originalBtnDown);
    originalBtn.on("pointerup",originalBtnUp);

    function originalBtnDown(){
      alphaScaleMax.call(this);
    }

    function originalBtnUp(){
      alphaScaleMin.call(this);
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
      rec.start();
    }

    function alphaScaleMax() {
      alphaScaleFuc(this, 1.2, 1.2, 1);
    }

    function alphaScaleMin() {
      alphaScaleFuc(this, 1, 1, 0.7);
    }

    function alphaScaleFuc(obj, _scaleX: number, _scaleY: number, _alpha: number) {
      obj.scaleX = _scaleX;
      obj.scaleY = _scaleY;
      obj.alpha = _alpha;
    }


    function aniPlay() {
      let dx = ox + radius * Math.cos(radian.value);
      let dy = oy + radius * Math.sin(radian.value);
      cir.fillCircle(dx, dy, 4)
    }

    function recordEndFuc() {
      resetStart();
      //that.bgm.play(null, { volume: 0.1 } as Phaser.Types.Sound.SoundConfig);
      that.bgm.resume();
      luyinBtn.on("pointerdown", recordReady);
      backplayBtn.setData("haveRecord", "yes");
      rec.stop((blob: string) => {
        rec.close();
        userRecoder.src = URL.createObjectURL(blob);
      });
    }

    function resetStart() {
      luyinBtn.setTexture("btn_luyin");
      radian.value = 0;
      cir.clear();
      cir.fillStyle(0xffffff, 1);
    }

    function recordReady() {
      rec.open(() => {
        that.bgm.pause();
        luyinBtn.off("pointerdown", recordReady);
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
   * 箭头再现
   */
  private arrowAgainShow(): void {
    this.arrows.add(arrowUpObj);
    //(arrowUpAni as Phaser.Tweens.Tween).duration = 2000;
    (arrowUpAni as Phaser.Tweens.Tween).play();
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
    let arrowUp = new Phaser.GameObjects.Image(this, 1024 * 0.5 + 5, 386, "tips_arrow_up").setOrigin(0.5).setAlpha(0);
    arrowUpObj = arrowUp;
    this.arrows.add(arrowUp);
    arrowUpAni = this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: arrowUp,
      y: 386 - 20,
      alpha: 1,
      duration: 1000,
      repeat: -1
    }))
  }

  /**
   * 创建左右循环的箭头及动画
   */
  private createLeftRightArrow(): void {
    let arrowLeft = new Phaser.GameObjects.Image(this, 567 + 128 * 0.5 + 100, 65 + 168 * 0.5 - 10, "tips_arrow_left").setOrigin(0.5).setAlpha(1);   //在右边
    let arrowRight = new Phaser.GameObjects.Image(this, 331 + 128 * 0.5 - 100, 65 + 168 * 0.5 - 10, "tips_arrow_right").setOrigin(0.5).setAlpha(1);    //在左边
    this.arrows.add([arrowLeft, arrowRight]);
    this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: [arrowLeft, arrowRight],
      x: 1024 * 0.5,
      alpha: 0,
      duration: 800,
      repeat: -1
    }))

    if (this.balls.list.length < 3) {
      arrowLeft.alpha = 0;
    }

  }

  /* 创建背景音乐 ，并设置为自动播放*/
  private createAudio(): void {
    this.bgm = this.sound.add('bgm');
    this.bgm.addMarker({
      name: "start",
      start: 0
    } as Phaser.Types.Sound.SoundMarker);
    let config: Phaser.Types.Sound.SoundConfig = {
      loop: true,
      volume: 0.2
    }
    this.bgm.play("start", config);

    let audioKey = this.phoneticData[index].name;
    this.wordSpeaker = this.sound.add(audioKey);
  }

  /* 搭建静态场景 */
  private createStaticScene(): void {
    this.bg = new Phaser.GameObjects.Image(this, 0, 0, "bg").setOrigin(0);

    this.btn_exit = new Phaser.GameObjects.Image(this, 25, 25, "btn_exit").setOrigin(0);
    this.btn_exit.setInteractive();
    this.btn_exit.on("pointerdown", this.exitGame);

    this.btn_sound = new Phaser.GameObjects.Sprite(this, 939, 25, "btn_sound_on").setOrigin(0);
    this.btn_sound.setInteractive();
    this.btn_sound.on("pointerdown", this.onOffSound);
    this.staticScene = new Phaser.GameObjects.Container(this, 0, 0, [
      this.bg,
      this.btn_exit,
      this.btn_sound
    ]);
    this.add.existing(this.staticScene);
  }

  /* 退出游戏*/
  private exitGame(): void {
    console.log("Game Over");
  }

  /* 关闭或播放音乐 */
  private onOffSound(this: any) {
    let bgm = this.scene.bgm;
    if (bgm.isPlaying) {
      this.setTexture("btn_sound_off");
      bgm.pause();
    } else {
      this.setTexture("btn_sound_on");
      bgm.play();
    }
  }

};
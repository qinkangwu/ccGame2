import 'phaser';
import { Game11DataItem, } from '../../interface/Game11';
import { cover, rotateTips, isHit, Vec2 } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold, SuccessBtn, TryAginListenBtn } from '../../Public/jonny/components';
import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Locomotive, TrainBox, TrackCircle, NullTrainBox } from '../../Public/jonny/game11';

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值

class DrogEvent {
  public static onDragStart: Function;
  public static onDragEnd: Function;
  public static onDrag: Function;
}

export default class Game11PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态

  private ccData: Array<Game11DataItem> = [];
  private oneWheel: boolean = false;  //一轮是否结束
  private times: number = 0;  //次数
  private layer3Coords: Vec2[] = [];  //layer3的初始化坐标点
  private layer2Coords: Vec2[] = [];  //layer2的初始化坐标点
  private layer2InitX: number;
  private layer3InitX: number;
  private layer3andInitX: number;

  //静态开始
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private clickSound: Phaser.Sound.BaseSound; //点击音效
  private bgFull1: Phaser.GameObjects.Image; //背景图片 
  private bgFull2: Phaser.GameObjects.Image; //背景图片 
  private bg1: Phaser.GameObjects.Image; //背景图片
  private bg2: Phaser.GameObjects.Image; //背景图片
  private bg3: Phaser.GameObjects.Image; //背景图片
  private bg4: Phaser.GameObjects.Image; //背景图片
  private btnExit: Button;  //退出按钮
  private btnSound: ButtonMusic; //音乐按钮
  private originalSoundBtn: Button; //原音按钮
  private tryAginListenBtn: TryAginListenBtn; //在听一次按钮
  private planAnims: PlanAnims;
  private gold: Gold;
  private successBtn: SuccessBtn;  //成功提交的按钮
  //静态结束

  //动态开始
  private sentenceSpeaker: Phaser.Sound.BaseSound;   //句子播放器
  private trainboxs: TrainBox[]; //车厢序列
  private nullTrainboxs: NullTrainBox[] = []; //空车厢序列
  private locomotivel: Locomotive; //火车头
  private tipsParticlesEmitter: TipsParticlesEmitter;
  private sellingGold: SellingGold;
  //private trackCircle: TrackCircle; //轨迹球

  /**
   * 云背景
   */
  private layer0: Phaser.GameObjects.Container;

  /**
   * 铁轨背景
   */
  private layer1: Phaser.GameObjects.Container;

  /**
   * 空车厢
   */
  private layer1and: Phaser.GameObjects.Container;

  /**
   * 火车头与上面的火车车厢
   */
  private layer2: Phaser.GameObjects.Container;

  /**
   * 下面的火车车厢
   */
  private layer3: Phaser.GameObjects.Container;

  /**
   * 火车头
   */
  private layer3and: Phaser.GameObjects.Container;

  /**
   * UI
   */
  private layer4: Phaser.GameObjects.Container;

  constructor() {
    super({
      key: "Game11PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    index = res.index;
    this.ccData = res.data;
    console.log("正确答案", this.ccData[index].name);
  }

  preload(): void {

  }

  create(): void {
    this.trainboxs = [];
    this.createStage();
    this.createActors();
    //this.firstCreate();  //test
    if (index === 0) {
      this.scene.pause();
      rotateTips.init();
      this.firstCreate();
      cover(this, "Game11", () => {
        this.planAnims.show(index + 1, this.gameStart)
      });
    } else {
      this.planAnims.show(index + 1, this.gameStart);
    }
  }

  update(time: number, delta: number): void {
    this.btnSound.mountUpdate();
    // if (!this.oneWheel) {
    this.eliminateJitter();
    // }
  }

  /**
   * 消除抖动,可选
   */
  eliminateJitter() {
    if (this.layer0.x > 0) {
      this.layer0.x = 0;
    }
    // this.trainboxs.forEach(v => {
    //   if (v.body.bounds.min.x <= 0 + v.shape.radius) {
    //     v.body.isStatic = true;
    //     v.x = v.body.bounds.max.x * 0.5;
    //   } else if (v.body.bounds.max.y >= this.well[0].bounds.min.y) {
    //     v.body.isStatic = true;
    //     v.y = v.initPosition.y;
    //   } else if (v.body.bounds.max.y >= this.well[2].bounds.min.y && v.body.bounds.max.y <= this.well[2].bounds.max.y) {
    //     v.body.isStatic = true;
    //     v.y = this.well[2].bounds.min.y - v.shape.radius;
    //   } else if (v.x + v.shape.radius >= W * 4) {
    //     v.x = W * 4 - v.shape.radius;
    //   }
    // });
  }

  /**
   * 首次才创建
   */
  firstCreate(): void {
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
  }

  /**
   * 创建静态场景
   */
  createStage() {
    let that = this;

    this.layer0 = new Phaser.GameObjects.Container(this).setDepth(0);
    this.layer1 = new Phaser.GameObjects.Container(this).setDepth(1);
    this.layer1and = new Phaser.GameObjects.Container(this).setDepth(2);
    this.layer2 = new Phaser.GameObjects.Container(this).setDepth(3);
    this.layer3 = new Phaser.GameObjects.Container(this).setDepth(4);
    this.layer3and = new Phaser.GameObjects.Container(this).setDepth(5);
    this.layer4 = new Phaser.GameObjects.Container(this).setDepth(6);

    this.add.existing(this.layer0);
    this.add.existing(this.layer1);
    this.add.existing(this.layer1and);
    this.add.existing(this.layer2);
    this.add.existing(this.layer3);
    this.add.existing(this.layer3and);
    this.add.existing(this.layer4);

    this.bgFull1 = new Phaser.GameObjects.Image(this, 0, 0, "bgFull").setOrigin(0);
    this.bgFull2 = new Phaser.GameObjects.Image(this, 1024, 0, "bgFull").setOrigin(0).setFlipX(true);
    this.layer0.add([this.bgFull1, this.bgFull2]).setDepth(0);

    this.bg1 = new Phaser.GameObjects.Image(this, 0, 0, "bg").setOrigin(0);
    this.bg2 = new Phaser.GameObjects.Image(this, 1024, 0, "bg").setOrigin(0).setFlipX(true);
    this.bg3 = new Phaser.GameObjects.Image(this, 1024 * 2, 0, "bg").setOrigin(0);
    this.bg4 = new Phaser.GameObjects.Image(this, 1024 * 3, 0, "bg").setOrigin(0).setFlipX(true);
    this.layer1.add([this.bg1, this.bg2, this.bg3, this.bg4]);

    this.btnExit = new ButtonExit(this);
    this.btnSound = new ButtonMusic(this);
    this.originalSoundBtn = new Button(this, 25 + 60 * 0.5, 467 + 60 * 0.5, "originalSoundBtn").setAlpha(1);
    this.tryAginListenBtn = new TryAginListenBtn(this, 89, 435 + 50);
    this.layer4.add([this.btnExit, this.btnSound, this.originalSoundBtn, this.tryAginListenBtn]);

    this.originalSoundBtn.on("pointerdown", this.playSentence.bind(that));

    this.clickSound = this.sound.add('click');
    this.planAnims = new PlanAnims(this, this.ccData.length);
    this.gold = new Gold(this, goldValue);   //设置金币
    this.successBtn = new SuccessBtn(this, 939 + 60 * 0.5, 552 * 0.5);
    this.successBtn.on("pointerdown", this.successBtnPointerdown.bind(this));
    this.layer4.add([this.successBtn, this.gold]);

  }

  /**
   * 创建演员们
   */
  createActors(): void {
    //句子发声器
    let sentenceName = this.ccData[index].name;
    this.sentenceSpeaker = this.sound.add(sentenceName);

    let _shape = this.cache.json.get("trainboxShape");

    //火车头
    this.locomotivel = new Locomotive(this, _shape.locomotive);
    this.locomotivel.x = 0 + 1000;
    this.locomotivel.y = 127.05;
    this.layer3and.add(this.locomotivel);
    this.layer3and.setPosition(175, 142);
    this.layer3andInitX = this.layer3and.x;

    let vocabularies = this.ccData[index].vocabularies.sort(() => Math.random() - 0.5);

    //火车序列－－－－
    //let _y = 430;
    let _y = 0;
    let offsetX = 220 + 5; // 5 是缝隙

    this.layer3.setPosition(210, 430);
    vocabularies.forEach((data, i) => {
      let _x = offsetX * i;
      let trainBox = new TrainBox(this, _x, _y, "trainBox", data.name, _shape.trainBox);
      trainBox.name = data.name;
      this.trainboxs.push(trainBox);
      this.layer3.add(trainBox);
    })

    //符号车厢--------
    let symbolRegExp = /[?!,.]/g;
    let symbols = sentenceName.match(symbolRegExp);
    symbols.forEach(v => {
      let lastTrainbox: TrainBox = this.trainboxs[this.trainboxs.length - 1];
      let _tx = lastTrainbox.initPosition.x + offsetX;
      let symbolsTrainBox = new TrainBox(this, _tx, _y, "symbolTrainBox", v, _shape.trainBox);
      symbolsTrainBox.name = v;
      this.trainboxs.push(symbolsTrainBox);
      this.layer3.add(symbolsTrainBox);
    })

    //坐标点layer3 集合
    this.layer3Coords = (this.layer3.list as TrainBox[])
      .map(v => {
        v.startPosition = v.initPosition;
        return v.initPosition;
      })
      .map(v => new Vec2(v.x, v.y));

    //空车厢-------
    let nullTrainboxLength: number = vocabularies.length + symbols.length;
    for (let i = 0; i < nullTrainboxLength; i++) {
      let _x = offsetX * i;
      let nullTrainbox = new NullTrainBox(this, _x, 0, "trainBox");
      nullTrainbox.visible = false;
      this.nullTrainboxs.push(nullTrainbox);
    }
    this.layer1and.add(this.nullTrainboxs);
    this.layer1and.setPosition(426, 177);
    this.layer2.setPosition(426, 177);

    //坐标点layer2 集合
    this.layer2Coords = (this.layer1and.list as Phaser.GameObjects.Container[]).map(v => {
      return new Vec2(v.x, v.y)
    });

    //创建用户反馈
    this.tipsParticlesEmitter = new TipsParticlesEmitter(this);

  }

  /**
   * 游戏开始
   */
  private gameStart(): void {
    console.log("game start");

    var nextFuc = () => {
      this.scrollEvent();
      this.dragEvent();
      this.tryAginListenBtn.animate.play();
      //this.matterCollision();   //可选
    }

    this.locomotivel.admission()
      .then(() => {
        let trainboxAnimates: Promise<any>[] = this.trainboxs.map(trainbox => trainbox.admission());
        Promise.all(trainboxAnimates).then(() => {
          nextFuc();
        })
        this.trainboxs.forEach(trainbox => {
          trainbox.admission();
        })
      })
  }

  /**
   * 播放目前的单词
   */
  private playSentence(): void {
    this.sentenceSpeaker.play();
  }

  /**
   * 播放车厢上的单词
   */
  private playWord(key): void {
    let _word: Phaser.Sound.BaseSound = this.sound.add(key);
    _word.play();
    _word.on("complete", function () {
      _word.destroy();
    });
  }

  /**
   * 移动程序
   */
  public moveTo(obj, x: number, y: number, callback: any = () => { }, duration: number = 500) {
    this.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: obj,
      x: x,
      y: y,
      duration: duration,
      ease: "Sine.easeOut",
      onComplete: callback
    })
  }


  /**
   * 执行滚动条的互动
   */
  private scrollEvent(): void {
    let that = this;

    let trainBoxsLength = this.trainboxs.map(v => (v.list[0] as Phaser.GameObjects.Image).width).reduce((a, b) => a + b + 5);

    let stageShape = new Phaser.Geom.Rectangle(0, 240 * 0.5 * -1, trainBoxsLength, 240);


    this.layer2.setInteractive(stageShape, Phaser.Geom.Rectangle.Contains);
    this.layer2.setData("bounds", this.layer3.getBounds());

    this.layer3.setInteractive(stageShape, Phaser.Geom.Rectangle.Contains);
    this.layer3.setData("bounds", this.layer3.getBounds());

    this.input.setDraggable([this.layer2, this.layer3], true);

    this.layer2InitX = this.layer2.x;
    this.layer3InitX = this.layer3.x;

    let layer3LimitX = (trainBoxsLength * -1 + 1024 - (<Phaser.GameObjects.Image>that.trainboxs[that.trainboxs.length - 1].list[0]).width * 0.5) - 200;
    let layer2LimitX = layer3LimitX - 200;

    this.layer2.on("drag", layerMove2);
    this.layer3.on("drag", layerMove3);

    let offsetX = that.layer2.x - that.layer3and.x;
    function layerMove2(this: Phaser.GameObjects.Container, pointer, dragX) {
      that.layer3and.x = dragX - offsetX;
      this.x = dragX;
      if (this.x >= that.layer2InitX) {
        this.x = that.layer2InitX;
        that.layer3and.x = that.layer3andInitX;
      } else if (this.x <= layer2LimitX) {
        this.x = layer2LimitX;
      } else {
        that.layer0.x = dragX * 0.04;
      }
    }

    function layerMove3(this: Phaser.GameObjects.Container, pointer, dragX) {
      this.x = dragX;
      if (this.x >= that.layer3InitX) {
        this.x = that.layer3InitX;
      } else if (this.x <= layer3LimitX) {
        this.x = layer3LimitX;
      }
    }
  }

  /**
   * 重新排序
   */
  private sort(): { up: Function, down: Function } {
    return {
      up: (box: TrainBox = null) => {
        if (this.layer2.list, this.layer2.list[0] === undefined) {
          return false;
        }
        for (let i = 0; i < this.layer2.list.length; i++) {
          let trainbox = (this.layer2.list[i] as TrainBox);
          let duration = trainbox === box ? 0 : 500;
          this.moveTo(trainbox, this.layer2Coords[i].x, this.layer2Coords[i].y, () => {
            trainbox.initPosition = new Vec2(trainbox.x, trainbox.y);
            this.layer2.sort("x");
          }, duration)
        }
      },
      down: () => {
        for (let i = 0; i < this.layer3.list.length; i++) {
          let trainbox = (this.layer3.list[i] as TrainBox);
          this.moveTo(trainbox, this.layer3Coords[i].x, this.layer3Coords[i].y, () => {
            trainbox.initPosition = new Vec2(trainbox.x, trainbox.y);
            this.layer3.sort("x");
          }, 500);
        }
      }
    }
  }

  /**
   * 执行拖拽的互动 
   */
  private dragEvent(): void {
    let that = this;
    let working: boolean = false;   //碰撞器是否在工作

    DrogEvent.onDrag = function (this: TrainBox, pointer, dragX, dragY) {
      if (!this.interactive) {
        return false;
      }
      this.movePosition = new Vec2(dragX, dragY);
      console.log("drag", dragX, dragY);
      this.x = dragX;
      this.y = dragY;
      console.log(this.x, this.y);
    }

    DrogEvent.onDragStart = function (this: TrainBox, pointer, startX, startY) {
      if (/\w/.test(this.name)) {
        that.playWord(this.name);
      }
      if (!this.interactive) {
        return false;
      }
      this.isDroging = true;
      this.startPosition = new Vec2(pointer.x, pointer.y);
    }


    DrogEvent.onDragEnd = function (this: TrainBox) {
      if (!this.interactive) {
        return false;
      }
      this.isDroging = false;
      //console.log(this.getWorldTransformMatrix());
      if (this.parentContainer === that.layer3 && this.y < -265) {    // down => up
        that.layer3.remove(this);
        that.layer2.add(this);

        that.sort().up(this);
        that.sort().down();
        this.isDrogUp = 1;

        this.initPosition = new Vec2(
          this.x,
          this.y
        );

        if (that.layer2.list.length > 2) {
          that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
            duration: 200,
            targets: [that.layer2, that.layer3and],
            x: `-=225`,
          });
        }


        that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
          duration: 200,
          targets: that.layer0,
          x: `-=5`,
        });


      } else if (this.parentContainer === that.layer2 && this.y > 216) {   // up => down
        that.layer2.remove(this);
        that.layer3.add(this);

        that.sort().down();
        that.sort().up();

        this.initPosition = new Vec2(
          this.x,
          this.y
        );
        this.isDrogUp = 0;
      } else if (this.parentContainer === that.layer3 && this.y > -265) {   // up => up
        this.setPosition(
          this.initPosition.x,
          this.initPosition.y
        );
      } else if (this.parentContainer === that.layer2 && this.y < 216) {   // down => down
        this.setPosition(
          this.initPosition.x,
          this.initPosition.y
        );
      }

      if (that.checkoutDragEnd() === that.trainboxs.length) {     // drog end
        that.dragEnd();
      }
    }

    this.trainboxs.forEach(trainboxEvent);
    function trainboxEvent(trainbox: TrainBox) {
      trainbox.on("dragstart", DrogEvent.onDragStart);
      trainbox.on("drag", DrogEvent.onDrag);
      trainbox.on("dragend", DrogEvent.onDragEnd);
    }

    var replace = (objA: TrainBox, objB: TrainBox) => {
      let objAX = objA.initPosition.x;
      let objAY = objA.initPosition.y;

      objA.interactive = false;
      objB.interactive = false;

      objA.isHit = true;
      objB.isHit = true;

      objA.initPosition.x = objA.x = objB.initPosition.x;
      objA.initPosition.y = objA.y = objB.initPosition.y;
      objB.initPosition.x = objB.x = objAX;
      objB.initPosition.y = objB.y = objAY;


      setTimeout(() => {
        objA.interactive = true;
        objB.interactive = true;
        objA.isHit = false;
        objB.isHit = false;
      }, 1000)
    }

    var downUpReplace = (upObj: TrainBox, downObj: TrainBox) => {
      upObj.isDrogUp = 0;
      downObj.isDrogUp = 1;
      replace(upObj, downObj);
    }

    var bbHandler = (obj1: TrainBox, obj2: TrainBox) => {
      if (obj1.isHit === false && obj2.isHit === false) {
        if (obj1.parentContainer === that.layer3 && obj2.parentContainer === that.layer2) {   //上下替换
          let obj1Index = that.layer3.list.indexOf(obj1);
          let obj2Index = that.layer2.list.indexOf(obj2);
          that.layer2.remove(obj2); that.layer2.addAt(obj1, obj2Index);
          that.layer3.remove(obj1); that.layer3.addAt(obj2, obj1Index);
          downUpReplace(obj2, obj1);
        } else if (obj1.parentContainer === that.layer2 && obj2.parentContainer === that.layer3) {   //上下替换
          let obj1Index = that.layer2.list.indexOf(obj1);
          let obj2Index = that.layer3.list.indexOf(obj2);
          that.layer3.remove(obj2); that.layer3.addAt(obj1, obj2Index);
          that.layer2.remove(obj1); that.layer2.addAt(obj2, obj1Index);
          downUpReplace(obj1, obj2);
        } else {
          let layer = obj1.parentContainer;
          let obj1Index = layer.list.indexOf(obj1);
          let obj2Index = layer.list.indexOf(obj2);
          layer.remove(obj2); layer.addAt(obj2, obj1Index);
          layer.remove(obj1); layer.addAt(obj1, obj2Index);
          replace(obj1, obj2);
        }
      }
    }
    var collider = this.physics.add.overlap(this.trainboxs, this.trainboxs, bbHandler, null, this);
  }


  /**
   * 检查拖拽是否已经结束
   */
  private checkoutDragEnd(): number {
    var length: number = 0;
    length = this.trainboxs.map(v => v.isDrogUp).reduce((a, b) => a + b);
    return length;
  }

  /**
   * 拖拽结束
   */
  private dragEnd(): void {
    // console.log("拖拽结束");
    this.successBtn.setAlpha(1);
    this.successBtn.animate.play();
  }

  /**
   *  successBtnPointerdown 
   */
  private successBtnPointerdown() {
    if (!this.successBtn.interactive) {
      return false;
    }
    this.successBtn.interactive = false;
    this.successBtn.animate.stop();
    this.checkoutResult()
      .then(msg => {    //正确
        console.log(msg)
        this.isRight();
      })
      .catch(err => {   //错误
        console.log(err)
        this.isWrong();
      });
  }

  /**
   * 正确的结果处理
   */
  private isRight(): void {
    this.trainboxGetOut().then(() => {
      this.sellingGold = new SellingGold(this, {
        callback: () => {
          this.sellingGold.golds.destroy();
          this.setGoldValue(3);
          this.nextRound();
        }
      });
      this.sellingGold.golds.setDepth(6);
      this.tipsParticlesEmitter.success(() => {
        this.sellingGold.goodJob(3);
      })
    })

  }

  /**
   * 火车开走
   */
  private trainboxGetOut(): Promise<any> {
    var animate = {
      then: resolve => {
        this.oneWheel = true;
        this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
          duration: 500,
          targets: this.layer3and,
          x: this.layer3andInitX
        })
        this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
          duration: 500,
          targets: this.layer2,
          x: this.layer2InitX
        })
        setTimeout(() => {
          this.playSentence();
        }, 1000);
        this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
          duration: 3000,
          delay: 3000,
          targets: [this.layer3and, this.layer2],
          x: `-=${this.layer2.getBounds().width + this.layer3and.getBounds().width}`,
          onComplete: () => {
            resolve("ok");
          }
        })
      }
    }

    return Promise.resolve(animate);

  }

  /**
   * 错误的结果处理
   */
  private isWrong(): void {
    this.times += 1;
    if (this.times === 1) {
      this.tryAgin();
    } else if (this.times === 2) {
      this.ohNo();
    }
  }

  /**
   * 再玩一次
   */
  private tryAgin() {
    this.tipsParticlesEmitter.tryAgain(this.resetStart);
  }

  /**
   * 重置开始状态
   */
  private resetStart() {
    this.trainboxs.forEach(box => {
      if (box.parentContainer === this.layer2) {
        this.layer2.remove(box);
        this.layer3.add(box);
        box.isDrogUp = 0;
        box.isTrack = false;
      }
    })
    this.sort().down();
    this.layer2.x = this.layer2InitX;
    this.layer3.x = this.layer3InitX;
    this.layer3and.x = this.layer3andInitX;
    this.successBtn.setAlpha(0);
    this.successBtn.interactive = true;
  }

  /**
   * 再次错误
   */
  private ohNo() {
    this.setGoldValue(-1);
    this.tipsParticlesEmitter.error(
      this.nextRound,
      this.resetStart
    )
    if (goldValue === 0) {
      setTimeout(() => {
        this.scene.pause();
        alert("啊哦，你又错啦！金币不足，一起去赚金币吧");
      }, 1300)
    }
  }

  /**
   * 下一道题
   */
  private nextRound(): void {
    index += 1;
    this.oneWheel = false;
    this.scene.start('Game11PlayScene', {
      data: this.ccData,
      index: index
    });
  }

  /**
   * 判断拖拽的结果，是否准确
   */
  private checkoutResult(): Promise<string> {
    let answer: string = "";
    return new Promise((resolve, reject) => {
      this.layer2.sort("x");
      this.layer2.list.forEach(box => {
        answer += box.name;
      })
      console.log(answer);
      if (answer === this.ccData[index].name) {
        resolve("this is ok!");
      } else {
        reject("this is wrong");
      }
    });
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

}
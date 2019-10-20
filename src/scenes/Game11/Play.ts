import 'phaser';
import { Game11DataItem, } from '../../interface/Game11';
import { cover, rotateTips, isHit, Vec2, CONSTANT } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold, SuccessBtn, TryAginListenBtn } from '../../Public/jonny/components';
import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Locomotive, TrainBox, NullTrainBox } from '../../Public/jonny/game11';

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
    this.resize();
  }



  /**
   * 重置尺寸
   */
  resize() {
    if (this.layer0.x > 0) {
      this.layer0.x = 0;
    }
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

    this.layer1and.setPosition(426, 177);
    this.layer2.setPosition(426, 177);
    this.layer3and.setPosition(175, 142);
    this.layer3.setPosition(210, 430);

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
    this.layer3andInitX = this.layer3and.x;

    let vocabularies = this.ccData[index].vocabularies.sort(() => Math.random() - 0.5);

    //火车序列－－－－
    //let _y = 430;
    let _y = 0;
    let offsetX = 220 + 5; // 5 是缝隙

    vocabularies.forEach((data, i) => {
      let _x = offsetX * i;
      let trainBox = new TrainBox(this, _x, _y, "trainBox", data.name, _shape.trainBox);
      trainBox.name = data.name;
      trainBox.tipsArrowUp.setAlpha(0);
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
      symbolsTrainBox.tipsArrowUp.setAlpha(0);
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
      this.tryAginListenBtn.checkout(1);
      this.tipsArrowUpAnimateFuc(this.trainboxs, true);
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
   * 箭头动画的显示与隐藏
   */
  private tipsArrowUpAnimateFuc(list: TrainBox[], display: boolean): void {
    list.forEach(box => {
      if (display) {
        box.tipsArrowUp.setAlpha(1);
        box.tipsArrowAnimate.resume();
      } else {
        box.tipsArrowUp.setAlpha(0);
        box.tipsArrowAnimate.pause();
      }
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
  public moveTo(obj, x: number, y: number, duration: number = 500, callback: any = () => { }): Phaser.Tweens.Tween {
    let _tween = this.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: obj,
      x: x,
      y: y,
      duration: duration,
      ease: "Sine.easeOut",
      onComplete: callback
    })
    return _tween;
  }

  /**
   * 实时刷新容器layer2,layer3的交互区域
   */
  private syncHitArea(): void {
    const TrainboxWIDTH = 319;
    let layers = [this.layer2, this.layer3];
    let trainBoxsLength = this.layer3.list.length * TrainboxWIDTH;
    layers.forEach(layer => {
      let stageShape = new Phaser.Geom.Rectangle(0, 240 * 0.5 * -1, trainBoxsLength, 240);
      layer.setInteractive(stageShape, Phaser.Geom.Rectangle.Contains);
    })
  }

  /**
   * 计算火车的长度
   */
  private layerLimitXFuc(layer: Phaser.GameObjects.Container): number {
    let _list = (layer.list as TrainBox[]);
    let _length = _list.length === 0 ? 0 : 225 * (_list.length - 1);
    _length = (_length - 225) * -1;
    return _length;
  }

  /**
   * 执行滚动条的互动
   */
  private scrollEvent(): void {
    let that = this;

    let trainBoxsLength = this.trainboxs.map(v => (v.list[0] as Phaser.GameObjects.Image).width).reduce((a, b) => a + b + 100);

    let stageShape = new Phaser.Geom.Rectangle(0, 240 * 0.5 * -1, trainBoxsLength, 240);

    this.syncHitArea();
    this.input.setDraggable([this.layer2, this.layer3], true);

    this.layer2InitX = this.layer2.x;
    this.layer3InitX = this.layer3.x;

    let offsetX = that.layer2.x - that.layer3and.x;

    this.layer2.on("dragstart", layerMoveStart);
    this.layer2.on("drag", layerMove2);
    this.layer2.on("dragend", layerMoveEnd);
    this.layer3.on("dragstart", layerMoveStart);
    this.layer3.on("drag", layerMove3);

    function layerMoveStart(this: Phaser.GameObjects.Container, pointer, dragX) {
      this.setData("limitX", that.layerLimitXFuc(this));
    }

    function layerMove2(this: Phaser.GameObjects.Container, pointer, dragX) {
      if (that.layer2.list.length === 0) {
        return false;
      }
      this.x = dragX;
      console.log(this.x);
      if (this.x >= that.layer2InitX) {
        this.x = that.layer2InitX;
        that.layer3and.x = that.layer3andInitX;
      } else if (this.x <= this.getData("limitX")) {
        this.x = this.getData("limitX");
      } else {
        that.layer0.x = dragX * 0.04;
        that.layer3and.x = dragX - offsetX;
      }
    }

    function layerMove3(this: Phaser.GameObjects.Container, pointer, dragX) {
      this.x = dragX;
      if (this.x >= that.layer3InitX) {
        this.x = that.layer3InitX;
      } else if (this.x <= this.getData("limitX")) {
        this.x = this.getData("limitX");
      }
    }

    function layerMoveEnd() {
      console.log(this.x);
    }

  }

  /**
   * 重新排序
   */
  private sort(): { up: Function, down: Function } {

    let sortExe = (layer: Phaser.GameObjects.Container, layerCoords: Vec2[], box: TrainBox) => {
      for (let i = 0; i < layer.list.length; i++) {
        let trainbox = (layer.list[i] as TrainBox);
        let duration = trainbox === box ? 0 : 500;
        this.moveTo(trainbox, layerCoords[i].x, layerCoords[i].y, duration, () => {
          trainbox.initPosition = new Vec2(trainbox.x, trainbox.y);
          layer.sort("x");
        })
      }
    }

    return {
      up: (box: TrainBox = null) => {
        if (this.layer2.list, this.layer2.list[0] === undefined) {
          return false;
        }
        sortExe(this.layer2, this.layer2Coords, box);
      },
      down: (box: TrainBox = null) => {
        sortExe(this.layer3, this.layer3Coords, box);
      }
    }
  }

  /**
   * 执行拖拽的互动 
   */
  private dragEvent(): void {
    let that = this;
    let working: boolean = false;   //碰撞器是否在工作

    let collision = {
      //replace: (myBox: TrainBox, layerSource: Phaser.GameObjects.Container, layerTarget: Phaser.GameObjects.Container) => {
      // (layerTarget.list as TrainBox[]).forEach(box => {
      //   if (isHit(myBox.syncBodyBounds(), box.syncBodyBounds())) {
      //     if (!myBox.isHit) {
      //       myBox.interactive = false;
      //       myBox.isHit = true;
      //       let boxX = box.getWorldTransformMatrix().tx - layerSource.x;
      //       let boxY = box.getWorldTransformMatrix().ty - layerSource.y;
      //       myBox.x = boxX;
      //       myBox.y = boxY;
      //       that.moveTo(box, myBox.worldTransformMatrix.tx - layerTarget.x, myBox.worldTransformMatrix.ty - layerTarget.y, 500, () => {
      //         layerTarget.remove(box); layerSource.add(box);
      //         layerSource.remove(myBox); layerTarget.add(myBox);
      //         let _boxX = box.initPosition.x;
      //         let _boxY = box.initPosition.y;
      //         box.initPosition.x = box.x = myBox.initPosition.x;
      //         box.initPosition.y = box.y = myBox.initPosition.y;
      //         myBox.initPosition.x = myBox.x = _boxX;
      //         myBox.initPosition.y = myBox.y = _boxY;
      //         layerSource.sort("x"); layerTarget.sort("x");
      //         myBox.isHit = false;
      //         myBox.interactive = true;
      //         that.tipsArrowUpAnimateFuc(<TrainBox[]>(that.layer3.list), true);
      //       }
      //       );
      //     }
      //   }
      // })
      //},
      // downToUp: (myBox: TrainBox) => {
      //   //collision.replace(myBox, this.layer3, this.layer2);
      // },
      // upToDown: (myBox: TrainBox) => {
      //   //collision.replace(myBox, this.layer2, this.layer3);
      // },
      leftToRight: (myBox: TrainBox, layer: Phaser.GameObjects.Container) => {
        let _layerList = layer.list.filter(v => {
          if (v !== myBox) {
            return v;
          }
        });

        (_layerList as TrainBox[]).forEach(box => {
          if (isHit(myBox.syncBodyBounds(), box.syncBodyBounds())) {
            if (!myBox.isHit) {
              console.log("碰撞");
              myBox.isHit = true;
              let _myBoxInitPosition = Object.assign({}, myBox.initPosition);
              myBox.initPosition.x = box.initPosition.x;
              myBox.initPosition.y = box.initPosition.y;
              that.moveTo(box, _myBoxInitPosition.x, _myBoxInitPosition.y, 500, () => {
                myBox.initPosition.x = box.initPosition.x;
                myBox.initPosition.y = box.initPosition.y;
                box.initPosition.x = box.x;
                box.initPosition.y = box.y;
                myBox.isHit = false;
                layer.sort("x");
              });
            }
          }
        })

      }
    }

    let insert = {
      upToDown: (myBox: TrainBox) => {
        (this.layer3.list as TrainBox[]).forEach(box => {
          if (isHit(myBox.syncBodyBounds(), box.syncBodyBounds())) {
            if (myBox.getWorldTransformMatrix().tx < box.getWorldTransformMatrix().tx && !myBox.isHit) {
              console.log(box.name);
              myBox.isHit = true;
              if (myBox.insertObj === null) {
                myBox.insertObj = box;
                that.moveTo(box, box.x + 225 * 0.5, box.y);
              }
            }
          }
        })
      },
      downToUp: (myBox: TrainBox) => {
        (this.layer2.list as TrainBox[]).forEach(box => {
          if (isHit(myBox.syncBodyBounds(), box.syncBodyBounds())) {
            if (myBox.getWorldTransformMatrix().tx < box.getWorldTransformMatrix().tx && !myBox.isHit) {
              console.log(box.name);
              myBox.isHit = true;
              if (myBox.insertObj === null) {
                myBox.insertObj = box;
                that.moveTo(box, box.x + 225 * 0.5, box.y);
              }
            }
          }
        })
      }
    }

    let drogEndFuc = {
      UpDown: (parentLayer: Phaser.GameObjects.Container, targetLayer: Phaser.GameObjects.Container, box: TrainBox) => {
        /**
         * 暂时保留
         */
      },
      leftRight: (box: TrainBox, layer: Phaser.GameObjects.Container) => {
        box.setPosition(
          box.initPosition.x,
          box.initPosition.y
        );

        if (box.insertObj !== null) {
          box.isHit = false;
          layer.sort("x");
          that.sort().up();
          that.sort().down();
          box.insertObj = null;
        }

        that.tipsArrowUpAnimateFuc(<TrainBox[]>(that.layer3.list), true);
      }
    }


    DrogEvent.onDrag = function (this: TrainBox, pointer, dragX, dragY) {
      if (!this.interactive) {
        return false;
      }
      console.log("拖拽中...");
      this.setPosition(dragX, dragY);
      this.movePosition = new Vec2(this.x, this.y);
      // if (this.parentContainer === that.layer3 && this.y < -140) {    //down to up
      //   insert.downToUp(this);
      // } else if (this.parentContainer === that.layer2 && this.y > 140) {    //up to down
      //   insert.upToDown(this);
      // } else if (this.parentContainer === that.layer3 && this.y > -20) {   //down => left to right
      //   collision.leftToRight(this, that.layer3);
      // } else if (this.parentContainer === that.layer2 && this.y < 20) {    //up => left to right
      //   collision.leftToRight(this, that.layer2);
      // }
    }

    let ticker: any = (_myBox: TrainBox) => {   //实时监听
      let myBox: TrainBox = _myBox;
      if (myBox.parentContainer === that.layer3 && myBox.y < -140) {    //down to up
        insert.downToUp(myBox);
      } else if (myBox.parentContainer === that.layer2 && myBox.y > 140) {    //up to down
        insert.upToDown(myBox);
      } else if (myBox.parentContainer === that.layer3 && myBox.y > -20) {   //down => left to right
        collision.leftToRight(myBox, that.layer3);
      } else if (myBox.parentContainer === that.layer2 && myBox.y < 20) {    //up => left to right
        collision.leftToRight(myBox, that.layer2);
      }
      ticker.id = window.requestAnimationFrame(ticker.bind(null, myBox));
    }

    DrogEvent.onDragStart = function (this: TrainBox, pointer, startX, startY) {
      if (/\w/.test(this.name)) {
        that.playWord(this.name);
      }
      if (!this.interactive) {
        return false;
      }
      this.startPosition = new Vec2(pointer.x, pointer.y);
      this.worldTransformMatrix = this.getWorldTransformMatrix();
      that.tipsArrowUpAnimateFuc(that.trainboxs, false);
      that.layer2.setData("limitX", that.layerLimitXFuc(that.layer2));
      that.layer3.setData("limitX", that.layerLimitXFuc(that.layer3));
      console.log(that.layer2.getData("limitX"));
      ticker(this);
    }


    DrogEvent.onDragEnd = function (this: TrainBox) {
      if (!this.interactive) {
        return false;
      }
      window.cancelAnimationFrame(ticker.id);
      if (this.parentContainer === that.layer3 && this.y < -140) {    // down => up
        that.layer3.remove(this);
        that.layer2.add(this);
        if (this.insertObj !== null) {
          this.setPosition(
            (this.insertObj as TrainBox).initPosition.x,
            (this.insertObj as TrainBox).initPosition.y
          )
          this.isHit = false;
          this.insertObj = null;
          that.layer2.sort("x");
          that.layer3.sort("x");
        }

        that.sort().up(this);
        that.sort().down();

        that.tipsArrowUpAnimateFuc(<TrainBox[]>(that.layer3.list), true);

        this.initPosition = new Vec2(
          this.x,
          this.y
        );

        (function () {      //执行上下火车车厢的移动
          if (that.layer2.list.length > 0 && that.layer2.x > (that.layer2.getData("limitX"))) {
            that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
              duration: 200,
              targets: [that.layer2, that.layer3and],
              x: `-=225`,
              onComplete: () => {
                that.layer2.setData("limitX", that.layerLimitXFuc(that.layer2));
              }
            });
            that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
              duration: 200,
              targets: that.layer0,
              x: `-=5`,
            });
          }
          if (that.layer3.list.length > 0 && that.layer3.x < that.layer3InitX && (that.layer3.x - (that.layer3.getData("limitX")) <= 225)) {
            console.log("开始偏移");
            that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
              duration: 200,
              targets: that.layer3,
              x: `+=225`,
            });
          }
        })();


      } else if (this.parentContainer === that.layer2 && this.y > 140) {   // up => down
        that.layer2.remove(this);
        that.layer3.add(this);

        if (this.insertObj !== null) {
          this.setPosition(
            (this.insertObj as TrainBox).initPosition.x,
            (this.insertObj as TrainBox).initPosition.y
          )
          this.isHit = false;
          this.insertObj = null;
          that.layer3.sort("x");
        }

        that.sort().down(this);
        that.sort().up();

        that.tipsArrowUpAnimateFuc(<TrainBox[]>(that.layer3.list), true);
        this.initPosition = new Vec2(
          this.x,
          this.y
        );

        (function () {
          if (that.layer2.list.length > 0 && (that.layer2.x - (that.layer2.getData("limitX")) <= 225)) {
            console.log("开始偏移");
            that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
              duration: 200,
              targets: [that.layer2, that.layer3and],
              x: `+=225`,
            });
            that.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
              duration: 200,
              targets: that.layer0,
              x: `+=5`
            });
          }
        })();

      } else if (this.parentContainer === that.layer3 && this.y > -265) {   // down => down
        drogEndFuc.leftRight(this, that.layer3);
      } else if (this.parentContainer === that.layer2 && this.y < 216) {   // up => up
        drogEndFuc.leftRight(this, that.layer2);
      }

      if (that.checkoutDragEnd() === 0) {     // drog end
        that.dragEnd();
      } else {
        that.cancelDragEnd();
      }
    }

    this.trainboxs.forEach(trainboxEvent);
    function trainboxEvent(trainbox: TrainBox) {
      trainbox.on("dragstart", DrogEvent.onDragStart);
      trainbox.on("drag", DrogEvent.onDrag);
      trainbox.on("dragend", DrogEvent.onDragEnd);
    }

  }


  /**
   * 检查拖拽是否已经结束
   */
  private checkoutDragEnd(): number {
    var length: number = 0;
    length = this.layer3.list.length;
    return length;
  }

  /**
   * 退出拖拽结束的状态
   */
  private cancelDragEnd(): void {
    this.successBtn.setAlpha(0);
    this.successBtn.animate.pause();
  }

  /**
   * 拖拽结束
   */
  private dragEnd(): void {
    // console.log("拖拽结束");
    this.successBtn.setAlpha(1);
    this.successBtn.animate.play();
    //this.tryAginListenBtn.checkout(2);   //诡异，暂时关闭
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
          x: `-=${this.layer2.getBounds().width}`,
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
    } else if (this.times >= 2) {
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
    if (index > this.ccData.length - 1) {
      window.location.href = CONSTANT.INDEX_URL;
    }
    this.times = 0;
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
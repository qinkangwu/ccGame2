import 'phaser';
import { Game11DataItem, } from '../../interface/Game11';
import { cover, rotateTips, isHit } from '../../Public/jonny/core';
import { Button, ButtonContainer, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import { EASE } from '../../Public/jonny/Animate';
import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { SuccessBtn } from '../../Public/jonny/game9';
import { Locomotive, TrainBox ,Stage} from '../../Public/jonny/game11';

const vol = 0.3; //背景音乐的音量
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

  //静态开始
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private clickSound: Phaser.Sound.BaseSound; //点击音效
  private bg: Phaser.GameObjects.Image; //背景图片
  private btnExit: Button;  //退出按钮
  private btnSound: ButtonMusic; //音乐按钮
  private originalSoundBtn: Button; //原音按钮
  private tryAginListenBtn: Button; //在听一次按钮
  private planAnims: PlanAnims;
  private gold: Gold;
  private successBtn: SuccessBtn;  //成功提交的按钮
  private well:any[] = [];  //墙与地
  //静态结束

  //动态开始
  private sentenceSpeaker: Phaser.Sound.BaseSound;   //句子播放器
  private trainboxs: TrainBox[]; //车厢序列
  private locomotivel: Locomotive; //火车头
  private tipsParticlesEmitter: TipsParticlesEmitter;
  private sellingGold: SellingGold;

  /**
   * stage
   */
  private gameStage:Stage;
  /**
   * bg
   */
  private layer0: Phaser.GameObjects.Container;
  /**
   *trainbox 下,
   */
  private layer1: Phaser.GameObjects.Container;
  /**
   *trainbox 上,
   */
  private layer2: Phaser.GameObjects.Container;
  /**
   * 火车头
   */
  private layer3: Phaser.GameObjects.Container;

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
    //index = 2; //test
    this.ccData = res.data;

  }

  preload(): void {

  }

  create(): void {
    this.trainboxs = [];
    this.createStage();
    this.createActors();
    if (index === 0) {
      this.scene.pause();
      rotateTips.init();
      cover(this, "Game11", () => {
        this.planAnims.show(index + 1, this.gameStart)
      });
    } else {
      this.planAnims.show(index + 1, this.gameStart);
    }
  }

  update(time: number, delta: number): void {
    this.btnSound.mountUpdate();
    this.trainboxs.forEach(v=>{
      if(v.body.bounds.min.x <= 0){
        v.body.isStatic = true;
        v.x = v.body.bounds.max.x * 0.5;
      }else if(v.body.bounds.max.y >= this.well[0].bounds.min.y){
         v.body.isStatic = true;
         v.y =  v.initPosition.y;
      }else if(v.body.bounds.max.y >= this.well[2].bounds.min.y && v.body.bounds.max.y <= this.well[2].bounds.max.y){
        v.body.isStatic = true;
        v.y = this.well[2].bounds.min.y - v.shape.radius;
      }
    });
   }

  /**
   * 创建静态场景
   */
  createStage() {
    let that = this;

    this.gameStage = new Stage(this);

    for (let i = 0; i < 5; i++) {
      this[`layer${i}`] = new Phaser.GameObjects.Container(this);
      this[`layer${i}`].setDepth(1 + i)
    }
    this.gameStage.add([this.layer0,this.layer1,this.layer2,this.layer3]);
    this.add.existing(this.gameStage);
    this.add.existing(this.layer4);

   // this.matter.world.setBounds(100, 0, 1024*3, 520);

    let bg = new Phaser.GameObjects.Image(this, 0, 0, "bg").setOrigin(0);
    this.btnExit = new ButtonExit(this);
    this.btnSound = new ButtonMusic(this);
    this.originalSoundBtn = new Button(this, 25 + 60 * 0.5, 467 + 60 * 0.5, "originalSoundBtn").setAlpha(1);
    this.tryAginListenBtn = new Button(this, 89, 435 + 50, "try-agin-btn").setAlpha(1);
    this.tryAginListenBtn.minAlpha = 1;
    this.tryAginListenBtn.setOrigin(0, 1);
    this.tryAginListenBtn.setScale(0).setRotation((Math.PI / 180) * -30);
    this.layer0.add(bg);
    this.layer4.add([this.btnExit, this.btnSound, this.originalSoundBtn, this.tryAginListenBtn]);
    this.originalSoundBtn.on("pointerdown", this.playSentence.bind(that));

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

    this.planAnims = new PlanAnims(this, this.ccData.length);
    this.gold = new Gold(this, goldValue);   //设置金币
    this.successBtn = new SuccessBtn(this, 939 + 60 * 0.5, 552 * 0.5, "successBtn");
    //this.successBtn.on("pointerdown", this.successBtnPointerdown.bind(this));
    this.layer4.add([this.successBtn, this.gold]);

    //静止物体
    this.well [0]= this.matter.add.rectangle(1024*3*0.5,550,1024*3,50,{isStatic:true,density:100,restitution:0,frictionStatic:0,label:"ground"});  //地面
    this.well [1]= this.matter.add.rectangle(326.5,136.65,15,271.2,{isStatic:true,density:100,restitution:0,frictionStatic:0,label:"leftWell"});  //墙
    this.well [2]= this.matter.add.rectangle(1024*3*0.5,292,1024*3,20,{isStatic:true,density:100,restitution:0,frictionStatic:0,label:"rails"});  //铁轨
    //this.layer1.add(this.platforms[0]);
    //this.staticGroup = this.physics.add.staticGroup();
    //  this.staticGroup = new Phaser.Physics.Arcade.StaticGroup(this.physics.world,this);
    //  this.staticGroup.setDepth(0,1);
    //  this.platforms[0] = this.staticGroup.create(1024*0.5,295,"ground").refreshBody();
    //  this.platforms[0].name = "p0";
    //  this.platforms[1] = this.staticGroup.create(1024*0.5,550,"ground").refreshBody();
    //  this.platforms[1].name = "p1";
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
    this.locomotivel = new Locomotive(this,_shape.locomotive);
    this.layer2.add(this.locomotivel);

    let vocabularies = this.ccData[index].vocabularies.sort(() => Math.random() - 0.5);

    //火车序列－－－－
    let _y = 430;
    vocabularies.forEach((data, i) => {
      let _x = 211.5 + (232 + 5) * i;
      let trainBox = new TrainBox(this, _x, _y, "trainBox", data.name, _shape.trainBox);
       trainBox.name = data.name;
      this.trainboxs.push(trainBox);
      this.layer1.add(trainBox);
    })
    //this.matter.add.mouseSpring({});
    // let symbolRegExp = /[?!.]/g;
    // let symbols = sentenceName.match(symbolRegExp);
    // let lastTrainbox: TrainBox = this.trainboxs[this.trainboxs.length - 1];
    // symbols.forEach(v => {
    //   let _x = lastTrainbox.x + 232 + 5;
    //   let trainBox = new TrainBox(this, _x, _y, "symbolTrainBox", v,_shape);
    //   this.trainboxs.push(trainBox);
    //   this.layer1.add(trainBox);
    // })

    //创建用户反馈
    this.tipsParticlesEmitter = new TipsParticlesEmitter(this);

  }

  /**
   * 游戏开始
   */
  private gameStart(): void {
    console.log("game start");
    this.trainboxs.forEach(trainbox => {
      //trainbox.setScale(0.7);
      //trainbox.body.allowGravity = true;
    })
    this.locomotivel.admission();
    this.scrollEvent();
    this.dragEvent();
    this.matterCollision();
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
  public moveTo(obj, x: number, y: number, callback: any = () => { }) {
    this.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
      targets: obj,
      x: x,
      y: y,
      duration: 500,
      ease: "Sine.easeOut",
      onComplete: callback
    })
  }

  /**
   * 碰撞监听
   */
  public matterCollision(){
    this.matter.world.on("collisionstart",collisionStart);
    this.matter.world.on("collisionactive",collisionActive);
    this.matter.world.on("collisionend",collisionEnd);

    function collisionStart(e,obj1,obj2){
      console.log("start",obj1,obj2);
      // if(obj2.label===""){
      //   obj2.isSleeping = true;
      // }
      // args.forEach(obj=>{
      //   if(obj.label===""){
      //     console.log(1);
      //     obj.isSleeping = true;
      //   }
      // });
    }

    function collisionActive(e,obj1,obj2){
      //console.log('active',obj1,obj2);
      // if(obj2.label===""){
      //   obj2.gameObject.body.isStatic = true;
      // }
    }

    function collisionEnd(e,obj1,obj2){
      //console.log('end',obj1,obj2);

    }

  }

  /**
   * 执行滚动条的互动
   */
  private scrollEvent():void{
    let stageShape = new Phaser.Geom.Rectangle(0,0,1024*3,552);
    this.gameStage.setInteractive(stageShape,Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(this.gameStage,true);
    this.gameStage.on('dragstart',gameStageStart);
    this.gameStage.on("drag",gameStageMove);

    function gameStageStart(pointer,startX){
      this.startX = pointer.startX;
    }

    function gameStageMove(pointer,dragX){
      this.x = dragX;
      if(this.x>=0){
        this.x = 0;
      }       
      if(this.x<=1024*2*-1){
        this.x = 1024*2*-1;
      }
    }

    
  }

  /**
   * 执行拖拽的互动 
   */
  private dragEvent(): void {
    let that = this;
    let working: boolean = false;   //碰撞器是否在工作

   

    //this.matter.add.mouseSpring({});

    DrogEvent.onDrag = function (pointer, dragX, dragY) {
      if (!this.interactive) {
        return false;
      }
      this.movePosition = new Phaser.Math.Vector2(dragX, dragY);
      this.x = dragX;
      this.y = dragY;
      //  if(this.movePosition.y>=this.initPosition.y){
      //   this.movePosition.y = this.initPosition.y 
      //  }else{
       //}
      // if(this.blockedDown&&this.platform.name === "p1"&&this.movePosition.y>this.startPosition.y){
      //  // this.y = that.platforms[1].y - that.platforms[1].body.halfHeight;
      // }else if(this.movePosition.y<this.startPosition.y){
      //   this.blockedDown = false;
      //   this.y = dragY;
      // }
    }

    DrogEvent.onDragStart = function (pointer, startX, startY) {
      if (this.name) {
        that.playWord(this.name);
      }
      if (!this.interactive) {
        return false;
      }
      this.startPosition = new Phaser.Math.Vector2(pointer.x, pointer.y);
      this.body.isStatic = true;
      //this.scene.matter.world.setGravity(0);
    }


    DrogEvent.onDragEnd = function () {
      if (!this.interactive) {
        return false;
      }
      //this.body.allowGravity = true;
      this.body.gravity = new Phaser.Math.Vector2(0, 500);
      this.body.isStatic = false;
    }

    this.trainboxs.forEach(trainboxEvent);

    function trainboxEvent(trainbox: TrainBox) {
      trainbox.on("dragstart", DrogEvent.onDragStart);
      trainbox.on("drag", DrogEvent.onDrag);
      trainbox.on("dragend", DrogEvent.onDragEnd);
    }

      
     //this.colliders[0] = that.physics.add.collider(that.trainboxs,that.trainboxs);   //火车箱之间的碰撞器
    // this.colliders[1] = this.physics.add.collider(this.trainboxs,this.platforms[0],TPC1Handler);   //火车箱与铁轨的碰撞器
    // this.colliders[2] = this.physics.add.collider(this.trainboxs,this.platforms[1],TPC2Handler);   //火车箱与地面的碰撞器
    // this.colliders[3] = this.physics.add.collider(this.trainboxs,this.locomotivel);   //火车箱与火车头的碰撞器

    // this.colliders[0].name = "TTC";
    // this.colliders[1].name = "TPC1";
    // this.colliders[2].name = "TPC2";

    // function TPC1Handler(t:TrainBox,p){
    //   t.blockedDown = true;
    //   t.platform = p;
    //   t.body.setGravityY(0);
    // }

    // function TPC2Handler(t:TrainBox,p:Phaser.Physics.Arcade.Sprite){
    //   t.blockedDown = true;
    //   t.platform = p;
    //   t.body.setGravityY(0);
    // }
  }

  /**
   * 拖拽结束
   */
  // private dragEnd(): void {
  //   console.log("拖拽结束");
  //   this.cookies.forEach(cookie => {
  //     cookie.off("dragstart");
  //     cookie.off("drag");
  //     cookie.off("dragend");
  //   })
  //   this.civaMen.round.times += 1;
  //   this.successBtn.setAlpha(1);
  //   this.successBtn.animate.play();
  // }

  // /**
  //  *  successBtnPointerdown 
  //  */
  // private successBtnPointerdown() {
  //   if (!this.successBtn.interactive) {
  //     return false;
  //   }
  //   this.successBtn.interactive = false;
  //   this.successBtn.animate.stop();
  //   this.checkoutResult()
  //     .then(msg => {    //正确
  //       console.log(msg)
  //       this.isRight();
  //     })
  //     .catch(err => {   //错误
  //       console.log(err)
  //       this.isWrong();
  //     });
  // }

  /**
   * 正确的结果处理
   */
  // private isRight(): void {
  //   this.sellingGold = new SellingGold(this, {
  //     callback: () => {
  //       this.sellingGold.golds.destroy();
  //       this.civaJump.call(this);
  //       this.setGoldValue(3);
  //     }
  //   });
  //   this.civaMen.round.result = 1;
  //   this.tipsParticlesEmitter.success(() => {
  //     this.sellingGold.goodJob(3);
  //   })
  // }

  /**
   * 错误的结果处理
   */
  // private isWrong(): void {
  //   this.civaMen.round.result = 0;
  //   if (this.civaMen.round.times === 1) {
  //     this.tryAgin();
  //   } else if (this.civaMen.round.times >= 2) {
  //     this.ohNo();
  //   }
  // }

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
    // this.layer1.list.forEach(obj => {
    //   if (obj instanceof Cookie) {
    //     this.layer1.remove(obj);
    //     this.layer2.add(obj);
    //   };
    // })
    // this.layer2.list.forEach(obj => {
    //   if (obj instanceof NullCookie) {
    //     this.layer2.remove(obj);
    //     this.layer1.add(obj);
    //   };
    // })
    // this.nullCookies.forEach(nullCookie => {
    //   nullCookie.collision = 0;
    //   nullCookie.cookie = null;
    // })
    // this.cookies.forEach(cookie => {
    //   this.physics.world.enable(cookie);
    //   cookie.setPosition(
    //     cookie.initPosition.x,
    //     cookie.initPosition.y
    //   )
    //   cookie.on("dragstart", DrogEvent.cookieOnDragStart);
    //   cookie.on("drag", DrogEvent.cookieOnDrag);
    //   cookie.on("dragend", DrogEvent.cookieOnDragEnd);
    //   cookie.hit = 0;
    //   cookie.interactive = true;
    //   cookie.nullCookie = null;
    // });
    // this.successBtn.setAlpha(0);
    // this.successBtn.interactive = true;
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
    // this.layer1.destroy();
    // this.layer2.destroy();
    // this.layer3.destroy();
    // index += 1;
    // this.scene.start('Game9PlayScene', {
    //   data: this.ccData,
    //   index: index
    // });
  }

  /**
   * 判断拖拽的结果，是否准确
   */
  // private checkoutResult(): Promise<string> {
  // return new Promise((resolve, reject) => {
  //   this.nullCookies.forEach(nullCookie => {
  //     if (nullCookie.name !== nullCookie.cookie.name) {
  //       reject("结果错误");
  //     }
  //   })
  //   resolve("结果正确");
  // })
  //}

  /**
   * civa 开始跳跃
   */
  private civaJump(): void {
    // this.civaMen.animateEnd = this.nextRound.bind(this);
    // switch (this.nullCookies.length) {
    //   case 2:
    //     this.civaMen.startJumpIn(3, [365, 680, 928]);
    //     break;
    //   case 3:
    //     this.civaMen.startJumpIn(4, [365, 528, 680, 928]);
    //     break;
    //   case 4:
    //     this.civaMen.startJumpIn(5, [288, 446, 600, 762, 928]);
    //     break;
    // }
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
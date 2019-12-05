/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';
import * as io from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { QueryTopic, AnswerConfig } from '../../interface/SelectTopic';
import { rotateTips, isHit, Vec2, CONSTANT, EASE, cover } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold, CoverDoublePlayer } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Topic, Answer, CivaWorker } from '../../Public/jonny/selectTopic';

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue = {
  bee: 3,
  wizard: 3
}  //金币的值


interface socketInterface {
  event: string;
  num?: number;
  career?: string;
  msg?: string;
  herName?: string;
  goldValue?: number;
}


export default class Game24PlayScene extends Phaser.Scene {
  //socket 
  private socket: SocketIOClient.Socket;
  private num: number;
  private career: string;
  private myNameValue: string;
  private herNameValue: string;

  //数据层
  private ccData: QueryTopic[] = [];
  private times: number = 0;  //次数
  private socket$: Subject<socketInterface> = new Subject();

  //静态开始
  private cover: CoverDoublePlayer; //封面
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private bg: Phaser.GameObjects.Image; //背景图片 
  private btnExit: Button;  //退出按钮
  private btnSound: ButtonMusic; //音乐按钮
  private beeGold: Gold;   //蜜蜂的金币
  private wizardGold: Gold;   //魔法师的金币
  private civaBee: CivaWorker;
  private civaWizard: CivaWorker;
  //静态结束

  //动态开始
  private myName: Phaser.GameObjects.Text;
  private herName: Phaser.GameObjects.Text;
  private topic: Topic;
  private answers: Array<Answer> = [];
  private prevAnswer: Answer = null;
  //private mouth: Phaser.GameObjects.Sprite;
  private tipsParticlesEmitter: TipsParticlesEmitter;
  private sellingGold: SellingGold;


  /**
   * 背景
   */
  private layer0: Phaser.GameObjects.Container;

  /**
   * 答题板
   */
  private layer3: Phaser.GameObjects.Container;

  /**
   * UI
   */
  private layer4: Phaser.GameObjects.Container;

  constructor() {
    super({
      key: "Game24PlayScene"
    });
  }

  init(res: { data: any[], index: number, name: string }) {
    index = res.index;
    this.ccData = res.data;
    this.myNameValue = res.name;
    //console.log(res);
  }

  preload(): void {

  }

  create(): void {
    this.createStage();
    this.createActors();
    if (index === 0) {
      this.scene.pause();
      rotateTips.init();
      this.firstCreate();
      cover(this, "Game24", () => {
        this.createSocket();
        //this.gameStart();
      });
      this.createObservable();
    } else {
      this.gameStart();
    }
  }

  update(time: number, delta: number): void {
    this.btnSound.mountUpdate();
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
   * 创建观察者对象
   */
  createObservable() {
    this.socket$.subscribe(async res => {
      console.log(res);
      switch (res.event) {
        case "waiting":
          if (res.career === "bee") {
            this.num = res.num;
            this.career = res.career;
            this.civaBee.admission();
            this.resetCivaScale();
          }
          break;
        case "join":
          if (res.career === "wizard") {
            this.civaBee.setPosition(
              this.civaBee.initVec2.x,
              this.civaBee.initVec2.y
            );
            this.num = res.num;
            this.career = res.career;
            this.socket.emit("ready");
            this.resetCivaScale();
          }
          break;
        case "start":
          await this.civaWizard.admission();
          this.cover.setAlpha(0);
          this.topic.alpha = 1;
          this.answers.forEach(answer => {
            answer.alpha = 1;
          })
          this.herNameValue = res.herName;
          this.gameStart();
          break;
        case "herRight":
          this[`civa${res.career.replace(/^\w/, res.career.match(/^\w/)[0].toUpperCase())}`].isRight();
          this[res.career + "Gold"].setText(res.goldValue);  //179
          goldValue[res.career] = res.goldValue;
          break;
        case "herWrong":
          this[`civa${res.career.replace(/^\w/, res.career.match(/^\w/)[0].toUpperCase())}`].isWrong();
          this[res.career + "Gold"].setText(res.goldValue);
          goldValue[res.career] = res.goldValue;
          break;
        case "leave":
          if (res.career === "bee") {
            this.civaBee.leave();
          } else if (res.career === "wizard") {
            this.civaWizard.leave();
          }
          alert("对方已经离场");
          window.location.reload();
          break;
        case "absence":
          alert("你的对手已经离开，系统将自动刷新");
          window.location.reload();
          break;
        case "herEnd":
          alert("对方已经结束");
          break;
      }
    })
  }

  /**
   * 创建socket客户端
   */
  createSocket() {
    let that = this;
    //console.log(th.name);
    that.socket = io.connect("https://www.jonnypeng.com:4003");
    that.socket.emit("hello", { name: that.myNameValue });

    that.socket.on("waiting", function (value: socketInterface) {
      value.event = "waiting";
      that.socket$.next(value);
    });

    that.socket.on("join", function (value: socketInterface) {
      value.event = "join";
      that.socket$.next(value);
    });

    that.socket.on("start", function (value: socketInterface) {
      value.event = "start";
      that.socket$.next(value);
    });

    that.socket.on("herRight", function (value: socketInterface) {
      value.event = "herRight";
      console.log(value);
      that.socket$.next(value);
    });

    that.socket.on("herWrong", function (value: socketInterface) {
      value.event = "herWrong";
      that.socket$.next(value);
    });

    that.socket.on("leave", function (value: socketInterface) {
      value.event = "leave";
      that.socket$.next(value);
    });

    that.socket.on("herEnd", function (value: socketInterface) {
      value.event = "herEnd";
      that.socket$.next(value);
    });

    that.socket.on("absence", function (value: socketInterface) {
      value.event = "absence";
      that.socket$.next(value);
    });

  }


  /**
   * 创建静态场景
   */
  createStage() {
    let that = this;

    this.layer0 = new Phaser.GameObjects.Container(this).setDepth(0);
    this.layer3 = new Phaser.GameObjects.Container(this).setDepth(3);
    this.layer4 = new Phaser.GameObjects.Container(this).setDepth(5);

    this.add.existing(this.layer0);
    this.add.existing(this.layer3);
    this.add.existing(this.layer4);

    this.bg = new Phaser.GameObjects.Image(this, 0, 0, "bg").setOrigin(0);
    this.layer0.add(this.bg);

    this.cover = new CoverDoublePlayer(this, "Game24");
    this.cover.alpha = index === 0 ? 1 : 0;
    this.btnExit = new ButtonExit(this);
    this.btnSound = new ButtonMusic(this);
    this.layer4.add([this.btnExit, this.btnSound]);
    this.layer4.add([this.cover]);
  }

  /**
   * 单次播放的音频播放器
   */
  private audioPlay(key: string): Promise<number> {
    return new Promise<number>(resolve => {
      let _tempSound: Phaser.Sound.BaseSound = this.sound.add(key);
      _tempSound.on("complete", function (this: Phaser.Sound.BaseSound) {
        this.destroy();
        resolve(1);
      });
      _tempSound.play();
    })
  }

  /**
   * 创建演员们
   */
  private createActors(): void {
    //创建用户反馈
    this.tipsParticlesEmitter = new TipsParticlesEmitter(this);

    //创建题板
    this.topic = new Topic(this, this.ccData[index].questionContent);
    this.topic.alpha = index === 0 ? 0 : 1;
    this.ccData[index].answers.forEach(answer => {
      let _answer: Answer = new Answer(this, {
        position: { x: answer.position.x, y: answer.position.y },
        bgTexture: "daan",
        serial: answer.serial,
        answerContent: answer.answerContent,
        isRight: answer.isRight
      });
      _answer.answerContent.y -= 50;
      _answer.alpha = index === 0 ? 0 : 1;
      this.answers.push(_answer);
    });

    this.layer3.add([this.topic]);
    this.layer3.add(this.answers);
    this.anims.create({
      key: "small",
      frames: this.anims.generateFrameNames('mouth', { prefix: 'mouthKey', start: 0, end: 19 }),
      frameRate: 24,
      repeat: 2
    });
    // this.mouth = this.add.sprite(0, 0, "mouth", "mouthKey00").setDepth(3).setVisible(false).setAlpha(0.7);
    // this.mouth.on("animationcomplete", () => { this.mouth.visible = false; });

    this.civaBee = new CivaWorker(this, 150, 34.5 + 116 * 0.5, "civaBee").setDepth(4).asBee().staticLeave(-400);
    this.civaWizard = new CivaWorker(this, 1024 - 150, 34.5 + 116 * 0.5, "civaBee").setDepth(4).asBee().staticLeave(400);


    if (index === 0) {
      this.civaBee.staticLeave(-400);
      this.civaWizard.staticLeave(400);
    } else {
      this.civaBee.setPosition(this.civaBee.initVec2.x, this.civaBee.initVec2.y);
      this.civaWizard.setPosition(this.civaWizard.initVec2.x, this.civaWizard.initVec2.y);
    }

    this.add.existing(this.civaBee);
    this.add.existing(this.civaWizard);

    //goldValue = window.sessionStorage.getItem("goldValue") !== null ? JSON.parse(window.sessionStorage.getItem("goldValue")) : goldValue;

    this.beeGold = new Gold(this, goldValue.bee);   //设置金币
    this.wizardGold = new Gold(this, goldValue.wizard);

    this.beeGold.setPosition(this.civaBee.initVec2.x, this.civaBee.initVec2.y + 100);
    this.wizardGold.setPosition(this.civaWizard.initVec2.x, this.civaWizard.initVec2.y + 100);

    this.layer4.addAt([this.beeGold, this.wizardGold, this.cover], 0);

    // this.beeGold.alpha = this.civaBee.alpha = this.career === "bee" ? 1 : 0.5;
    // this.wizardGold.alpha = this.civaWizard.alpha = this.career === "wizard" ? 1 : 0.5;
    this.resetCivaScale();

  }

  /**
   * 创建自己名字
   * 
   */
  private createMyName(name: string) {
    this.myName = new Phaser.GameObjects.Text(this, this[`${this.career}Gold`].x, this[`${this.career}Gold`].y + 50, name, { color: "#ff7f3a", align: "center" }).setOrigin(0.5);
    this.layer4.add(this.myName);
  }

  /**
   * 创建别人的名字
   */
  private createHerName(name: string) {
    let herCareer: string = this.career === "bee" ? "wizard" : "bee";
    this.herName = new Phaser.GameObjects.Text(this, this[`${herCareer}Gold`].x, this[`${herCareer}Gold`].y + 50, name, { color: "#ff7f3a", align: "center" }).setOrigin(0.5);
    this.layer4.add(this.herName);
  }


  /**
   * 游戏开始
   */
  private gameStart(): void {
    let ready = async () => {
      this.createMyName(this.myNameValue);
      this.createHerName(this.herNameValue);
      this.answers.forEach(answer => {
        answer.on("pointerdown", this.touchAnswer.bind(this, answer));
      });
    };
    ready();
  }

  /**
   * 重试 civa的放大率
   * 
   */
  private resetCivaScale() {
    this.civaBee.scale = this.career === "bee" ? 1 : 0.6;
    this.civaWizard.scale = this.career === "wizard" ? 1 : 0.6;
  }

  /**
    * 点击答案
    */
  public touchAnswer(answer: Answer) {
    if (!answer.interactive) {
      return false;
    }
    this.answers.forEach(_answer => {
      _answer.interactive = false;
    });

    this.audioPlay("clickMp3");
    this.prevAnswer = answer;
    this.testEnd();
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
   *  已经选择题目，并执行结果
   */
  private testEnd() {

    this.checkoutResult().subscribe(value => {
      if (value) {
        this.isRight();
      } else {
        this.isWrong();
      }
    })
  }

  /**
   * 正确的结果处理
   */
  private isRight(): void {
    let nextFuc = () => {
      this.sellingGold = new SellingGold(this, {
        callback: () => {
          this.sellingGold.golds.destroy();
          this.setGoldValue(this.career, 3);
          this.socket.emit("isRight", { num: this.num, career: this.career, goldValue: goldValue[this.career] })
          this.nextRound();
        }
      });
      this.sellingGold.golds.setDepth(6);
      this.tipsParticlesEmitter.success(() => {
        this.sellingGold.goodJob(3);
      })
    }

    let animate = async () => {
      this.audioPlay("right");
      if (this.career === "bee") {
        this.civaBee.asBeeWorking(this.prevAnswer.x, this.prevAnswer.y);
      } else if (this.career === "wizard") {
        this.civaWizard.asBeeWorking(this.prevAnswer.x, this.prevAnswer.y);
      }
      await this.prevAnswer.bounceAni();
      this.audioPlay("successMp3");
      setTimeout(nextFuc, 1000);
    }

    animate();
  }

  /**
   * 错误的结果处理
   */
  private async isWrong() {

    await this.prevAnswer.shakingAni();
    await this.audioPlay("wrong");
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
    this.answers.forEach(answer => {
      answer.interactive = true;
    });
  }

  /**
   * 再次错误
   */
  private ohNo() {
    this.setGoldValue(this.career, -1);
    this.socket.emit("isWrong", { num: this.num, career: this.career, goldValue: goldValue[this.career] });
    this.tipsParticlesEmitter.error(
      this.nextRound,
      this.resetStart
    )
    if (this.career === "bee" && goldValue.bee === 0 || this.career === "wizard" && goldValue.wizard === 0) {
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
    //index = 7; //test
    this.prevAnswer = null;
    /**
     * 结束机制
     */
    if (index > this.ccData.length - 1) {
      alert("你的题目已经做完");
      this.socket.emit("end", { num: this.num, career: this.career, goldValue: goldValue[this.career] });
    }else {
      this.times = 0;
      this.scene.start('Game24PlayScene', {
        data: this.ccData,
        index: index,
        name: this.myNameValue
      });
    }
   
  }

  /**
   * 判断做题结果是否正确
   */
  private checkoutResult(): Observable<boolean> {
    console.log(this.prevAnswer);
    let isRightValue: number = this.prevAnswer.isRight;
    return Observable.create(subscriber => {
      if (isRightValue === 1) {
        subscriber.next(true);
      } else {
        subscriber.next(false);
      }
    });
  }

  /**
   * 设置金币的动作
   */
  private setGoldValue(career: string, value: number) {
    goldValue[career] += value;
    console.log(goldValue);
    //window.sessionStorage.setItem("goldValue",JSON.stringify(goldValue));
    this[career + "Gold"].setText(goldValue[career]);
  }

  /**
   * 检查金币是否为0
   */
  private checkoutGoldValue(): boolean {
    return goldValue[this.career] < 0 ? true : false;
  }

}
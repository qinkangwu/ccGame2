import 'phaser';
import { Observable } from 'rxjs';
import { QueryTopic, AnswerConfig } from '../../interface/SelectTopic';
import { cover, rotateTips, isHit, Vec2, CONSTANT,EASE} from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Topic, Answer,CivaWorker } from '../../Public/jonny/selectTopic';

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值


export default class Game18PlayScene extends Phaser.Scene {
  private ccData: QueryTopic[] = [];
  private times: number = 0;  //次数

  //静态开始
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private bg: Phaser.GameObjects.Image; //背景图片 
  private btnExit: Button;  //退出按钮
  private btnSound: ButtonMusic; //音乐按钮
  private gold: Gold;
  private civa:CivaWorker;
  //静态结束

  //动态开始
  private topic: Topic;
  private answers: Array<Answer> = [];
  private prevAnswer: Answer = null;
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
      key: "Game18PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    index = res.index;
    this.ccData = res.data;
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
      cover(this, "Game18", () => {
        this.gameStart();
      });
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
   * 创建静态场景
   */
  createStage() {
    let that = this;

    this.layer0 = new Phaser.GameObjects.Container(this).setDepth(0);
    this.layer3 = new Phaser.GameObjects.Container(this).setDepth(3);
    this.layer4 = new Phaser.GameObjects.Container(this).setDepth(4);

    this.add.existing(this.layer0);
    this.add.existing(this.layer3);
    this.add.existing(this.layer4);

    this.bg = new Phaser.GameObjects.Image(this, 0, 0, "bg").setOrigin(0);
    this.layer0.add(this.bg);

    this.btnExit = new ButtonExit(this);
    this.btnSound = new ButtonMusic(this);
    this.layer4.add([this.btnExit, this.btnSound]);

    this.gold = new Gold(this, goldValue);   //设置金币
    this.layer4.add(this.gold);
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
    console.log(this.ccData);
    this.topic = new Topic(this, this.ccData[index].questionContent, "civa_02");
    this.ccData[index].answers.forEach(answer => {
      let _answer: Answer = new Answer(this, {
        position: { x: answer.position.x, y: answer.position.y },
        bgTexture: "daan",
        serial: answer.serial,
        answerContent: answer.answerContent,
        isRight: answer.isRight
      });
      _answer.answerContent.setFontSize(40).setPosition(0,0);
      this.answers.push(_answer);
    });

    this.layer3.add([this.topic]);
    this.layer3.add(this.answers);

    // create bee
    this.civa = new CivaWorker(this,820.5+116*0.5,34.5+116*0.5,"civaBee","civaBee0000").setDepth(4).asBee();
    this.add.existing(this.civa);

    this.civa.asBeeDance();
   
  }

  /**
   * 游戏开始
   */
  private gameStart(): void {
    let ready = async () => {
      this.answers.forEach(answer => {
        answer.on("pointerdown", this.touchAnswer.bind(this, answer));
      });
    };
    ready();
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
    this.add.tween(< Phaser.Types.Tweens.TweenBuilderConfig>{
      targets:answer.bg,
      scale:1.2,
      duration:200,
      yoyo:true,
      ease:"Sine.easeInOut"
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
          this.setGoldValue(3);
          this.nextRound();
        }
      });
      this.sellingGold.golds.setDepth(6);
      this.tipsParticlesEmitter.success(() => {
        this.sellingGold.goodJob(3);
      })
    }

    let animate = async () => {
      await this.audioPlay("right");
      await this.civa.asBeeWorking(this.prevAnswer.x,this.prevAnswer.y);
      this.audioPlay("successMp3");
      nextFuc();
    }

    animate();
  }

  /**
   * 错误的结果处理
   */
  private async isWrong() {
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
    //index = 7; //test
    this.prevAnswer = null;
    if (index > this.ccData.length - 1) {
      window.location.href = CONSTANT.INDEX_URL;
    }
    this.times = 0;
    this.scene.start('Game18PlayScene', {
      data: this.ccData,
      index: index
    });
  }

  /**
   * 判断做题结果是否正确
   */
  private checkoutResult(): Observable<boolean> {
    console.log(this.prevAnswer);
    let isRightValue: number= this.prevAnswer.isRight;
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
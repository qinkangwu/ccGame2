/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn/guiyang
 */

import 'phaser';
import { Observable } from 'rxjs';
import { TrueFalseInterface } from '../../interface/TrueFalseInterface';
import { cover, rotateTips, isHit, Vec2, CONSTANT, EASE } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { CivaMen, Darts, TextDialog, Target } from '../../Public/jonny/trueFalse';
import * as dat from 'dat.gui';

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值


export default class Game22PlayScene extends Phaser.Scene {
  private datGui: dat.GUI;

  private ccData: TrueFalseInterface[] = [];
  private times: number = 0;  //次数

  //静态开始
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private bg: Phaser.GameObjects.Image; //背景图片 
  private btnExit: Button;  //退出按钮
  private btnSound: ButtonMusic; //音乐按钮
  private gold: Gold;
  //静态结束

  //动态开始
  private textDialog:TextDialog;
  private civa: CivaMen;
  private darts:Darts;
  private falseTarget:Target;
  private trueTarget:Target;
  private tipsParticlesEmitter: TipsParticlesEmitter;
  private sellingGold: SellingGold;


  /**
   * bg
   */
  private layer0: Phaser.GameObjects.Container;


  /**
   *  textDialog
   */
  private layer1: Phaser.GameObjects.Container;

  /**
   * darts,falseTarget,trueTarget 
   */
  private layer2: Phaser.GameObjects.Container;

  /**
   * civa
   */
  private layer3: Phaser.GameObjects.Container;

  /**
   * UI
   */
  private layer4: Phaser.GameObjects.Container;

  constructor() {
    super({
      key: "Game22PlayScene"
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
      cover(this, "Game22", () => {
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
    this.layer1 = new Phaser.GameObjects.Container(this).setDepth(1);
    this.layer2 = new Phaser.GameObjects.Container(this).setDepth(2);
    this.layer3 = new Phaser.GameObjects.Container(this).setDepth(3);
    this.layer4 = new Phaser.GameObjects.Container(this).setDepth(4);

    this.add.existing(this.layer0);
    this.add.existing(this.layer1);
    this.add.existing(this.layer2);
    this.add.existing(this.layer3);
    this.add.existing(this.layer4);

    this.bg = new Phaser.GameObjects.Image(this, 0, 0, "bg_all").setOrigin(0);
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
    this.textDialog = new TextDialog(this,146.45,295.85,this.ccData[index].questionContent);
    this.textDialog.init();
    this.layer1.add(this.textDialog);

    //创建飞镖，靶子
    this.falseTarget = new Target(this,855,258,"bg_f").init();
    this.trueTarget = new Target(this,596,258,"bg_t").init();
    this.darts = <Darts>(this.add.existing(new Darts(this)));
    this.layer2.add([this.falseTarget,this.trueTarget,this.darts]);

    //创建civa
    this.civa = new CivaMen(this, 152,425,"img_civa");
    this.civa.asArcherInit();
    this.layer3.add([this.civa]);
  }

  /**
   * 游戏开始
   */
  private gameStart(): void {
    let ready = async () => {
      await this.civa.asArcherAdmission();
      await this.textDialog.admission();
      await this.trueTarget.admission();
      await this.falseTarget.admission();
      //this.getGui();
    };
    ready();
  }

  /**
    * 点击答案
    */
  public touchAnswer() {

    this.audioPlay("clickMp3");
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
      this.audioPlay("right");
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
    if (index > this.ccData.length - 1) {
      window.location.href = CONSTANT.INDEX_URL;
    }
    this.times = 0;
    this.scene.start('Game22PlayScene', {
      data: this.ccData,
      index: index
    });
  }

  /**
   * 判断做题结果是否正确
   */
  private checkoutResult(): Observable<boolean> {
    // let isRightValue: number = this.prevAnswer.isRight;
    return Observable.create(subscriber => {
      // if (isRightValue === 1) {
      //   subscriber.next(true);
      // } else {
      //   subscriber.next(false);
      // }
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

  private getGui() {
    let guiData = {
      resolution: 1,
      fontFamily: "sans-serif"
    }

    this.datGui = new dat.GUI();

    this.datGui.add(guiData, "resolution", 1, 5, 1).onChange(value => {
      // this.topic.question.setResolution(value);
      // this.answers.forEach(answer => {
      //   answer.answerContent.setResolution(value);
      //   answer.serial.setResolution(value);
      // })
    })

    this.datGui.add(guiData, "fontFamily", ["sans-serif", "monospace", "Helvetica"]).onChange(value => {
      // this.topic.question.setFontFamily(value);
      // this.answers.forEach(answer => {
      //   answer.answerContent.setFontFamily(value);
      //   answer.serial.setFontFamily(value);
      // })
    })

  }

}
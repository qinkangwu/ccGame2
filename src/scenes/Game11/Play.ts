import 'phaser';
import { Game9DataItem, Game9PhoneticSymbol } from '../../interface/Game11';
import { cover, rotateTips, isHit } from '../../Public/jonny/core';
import { Button, ButtonContainer, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import { EASE } from '../../Public/jonny/Animate';
import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Locomotive,TrainBox } from '../../Public/jonny/game11';

const vol = 0.3; //背景音乐的音量
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值

class DrogEvent {
  public static cookieOnDragStart: Function;
  public static cookieOnDragEnd: Function;
  public static cookieOnDrag: Function;
}

export default class Game9PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态

  private ccData: Array<Game9DataItem> = [];
  private cookiesPool: Array<Game9PhoneticSymbol>;

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
  private planAnims: PlanAnims;
  private gold: Gold;
  private successBtn: SuccessBtn;  //成功提交的按钮
  //静态结束

  //动态开始
  private wordSpeaker: Phaser.Sound.BaseSound;   //单词播放器
  private cookies: Cookie[]; //饼干包含文字
  private nullCookies: NullCookie[]; //空饼干
  private civaMen: CivaMen; //机器人 
  private tipsParticlesEmitter: TipsParticlesEmitter;
  private sellingGold: SellingGold;
  //动态开始

  //层次
  private layer0: Phaser.GameObjects.Container;  //bg,
  private layer1: Phaser.GameObjects.Container;  //nullcookie
  private layer2: Phaser.GameObjects.Container;  //cookie
  private layer3: Phaser.GameObjects.Container;  //civa
  private layer4: Phaser.GameObjects.Container;  //btnExit,btnSound

  constructor() {
    super({
      key: "Game9PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    index = res.index;
    //index = 2; //test
    this.ccData = res.data;

    console.log(this.ccData);
  }

  preload(): void {

  }

  create(): void {
    this.cookiesPool = [];
    this.cookies = [];
    this.nullCookies = [];
    this.createStage();
    this.createActors();
    if (index === 0) {
      this.scene.pause();
      rotateTips.init();
      cover(this, "cover", () => {
        this.planAnims.show(index + 1, this.gameStart)
      });
    } else {
      this.planAnims.show(index + 1, this.gameStart);
    }
  }

  update(time: number, delta: number): void {
    this.btnSound.mountUpdate();

  }

  /**
   * 创建静态场景
   */
  createStage() {
    let that = this;

    for (let i = 0; i < 5; i++) {
      this[`layer${i}`] = new Phaser.GameObjects.Container(this);
      this.add.existing(this[`layer${i}`]);
    }

    let bg = this.add.image(0, 0, "bg").setOrigin(0);
    this.btnExit = new ButtonExit(this);
    this.btnSound = new ButtonMusic(this);
    this.originalSoundBtn = new Button(this, 25 + 60 * 0.5, 467 + 60 * 0.5, "originalSoundBtn").setAlpha(1);
    this.tryAginListenBtn = new Button(this, 89, 435 + 50, "try-agin-btn").setAlpha(1);
    this.tryAginListenBtn.minAlpha = 1;
    this.tryAginListenBtn.setOrigin(0, 1);
    this.tryAginListenBtn.setScale(0).setRotation((Math.PI / 180) * -30);
    this.layer0.add(bg);
    this.layer4.add([this.btnExit, this.btnSound, this.originalSoundBtn, this.tryAginListenBtn]);
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

    this.planAnims = new PlanAnims(this, this.ccData.length);
    this.gold = new Gold(this, goldValue);   //设置金币
    this.successBtn = new SuccessBtn(this, 939 + 60 * 0.5, 552 * 0.5, "successBtn");
    this.successBtn.on("pointerdown", this.successBtnPointerdown.bind(this));
    this.layer4.add([this.successBtn, this.gold]);
  }

  /**
   * 创建演员们
   */
  createActors(): void {
    console.log("createActors");
    //单词发生器
    let wordSound = this.ccData[index].name;
    this.wordSpeaker = this.sound.add(wordSound);

    this.cookiesPool = this.ccData[index].phoneticSymbols.concat(this.ccData[index].uselessPhoneticSymbols);
    this.cookiesPool.sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5);//两次乱序

    //饼干－－－－
    this.cookiesPool.forEach((v, i) => {
      let _ix = i;
      _ix = _ix % 4;
      let _iy = Math.floor(i / 4);
      let _x = 287 + 158 * _ix;
      let _y = 70.05 + 183 * _iy;
      let _delay: number = 0;
      switch (i) {
        case 0:
          _delay = 0;
          break;
        case 1:
          _delay = 300;
          break;
        case 2:
          _delay = 600;
          break;
        case 3:
          _delay = 900;
          break;
        case 4:
          _delay = 300;
          break;
        case 5:
          _delay = 600;
          break;
        case 6:
          _delay = 900;
          break;
        case 7:
          _delay = 1200;
          break;
      }
      let _cookie = new Cookie(this, new Phaser.Geom.Rectangle(-60, -47, 120, 91), Phaser.Geom.Rectangle.Contains, v.name, _delay, _x, _y).setAlpha(1);
      _cookie.name = v.name;
      //_cookie.minAlpha = 1;
      _cookie.hit = 0;
      this.layer2.add(_cookie);
      this.cookies.push(_cookie);
    })


    //饼干 初始化--------------
    this.cookies.forEach((cookie, index) => {
      let i = index;
      i = i % 4;
      cookie.y += (50 + i * 50);
      cookie.setAlpha(0);
    })

    //空饼干--------
    let phoneticSymbols = this.ccData[index].phoneticSymbols;
    let offsetX: number = 0;
    let cookies = this.cookies;
    let debug: string = "";
    phoneticSymbols.forEach((v, i, arr) => {
      switch (arr.length) {
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
      let _nullCookieImg = new NullCookie(this, offsetX, 472, "null-cookie");
      _nullCookieImg.setDepth(1);
      _nullCookieImg.name = v.name;
      debug += `${v.name},`;
      _nullCookieImg.setAlpha(0);
      this.layer1.add(_nullCookieImg);
      this.nullCookies.push(_nullCookieImg);
      this.physics.world.enable(_nullCookieImg);
      (<Phaser.Physics.Arcade.Body>_nullCookieImg.body).setSize(_nullCookieImg.width * 0.2, _nullCookieImg.height * 0.2);
    });
    console.log("正确答案", debug)

    //创建 civa
    this.civaMen = new CivaMen(this, -136.05, 428.1, "civa");
    this.layer3.add(this.civaMen);


    //创建用户反馈
    this.tipsParticlesEmitter = new TipsParticlesEmitter(this);
  }

  /**
   * 游戏开始
   */
  private gameStart(): void {
    console.log("game start");
    var nullCookieAni = () => {
      this.nullCookies.forEach((nullcookie, i) => {
        this.tweens.add({
          targets: nullcookie,
          alpha: 1,
          delay: 500 * i,
          duration: 500,
          OnComplete: () => {
            if (i === this.nullCookies.length - 1) {
              this.dragEvent();
            }
          }
        })
      })
    }

    var taraginListenAni = this.tweens.timeline(<Phaser.Types.Tweens.TimelineBuilderConfig>{
      targets: this.tryAginListenBtn,
      paused: true,
      tweens: [
        {
          scale: 1,
          rotation: 0,
          duration: 500,
          ease: EASE.spring
        },
        {
          rotation: Phaser.Math.DegToRad(-30),
          yoyo: true,
          repeat: 3,
          duration: 500,
          repeatDelay: 300,
          ease: EASE.spring
        }
      ]
    });

    let cookiesAni = () => {
      let cookiesAnimate: Promise<number>[] = [];
      cookiesAnimate = this.cookies.map(cookie => cookie.animate);
      Promise.all(cookiesAnimate).then((value) => {
        nullCookieAni();
        this.wordSpeaker.play();
        taraginListenAni.play();
        this.civaMen.startJumpIn(1, [140]);
      })
      this.cookies.forEach(cookie => {
        cookie.tweenFunc.play();
      });
    }

    cookiesAni();

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
  private playPhonetic(key): void {
    let _phonetic: Phaser.Sound.BaseSound = this.sound.add(key);
    _phonetic.play();
    _phonetic.on("complete", function () {
      _phonetic.destroy();
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
   * 执行拖拽的互动 
   */
  private dragEvent(): void {
    let that = this;
    let working: boolean = false;   //碰撞器是否在工作
    //let hits: number = 0; //碰撞次数
    let hitB: boolean = false;
    this.physics.world.enable(this.cookies);

    DrogEvent.cookieOnDrag = function (pointer, dragX, dragY) {
      if (!this.interactive) {
        return false;
      }
      this.x = dragX;
      this.y = dragY;
      that.nullCookies.forEach(nullCookie => {
        if (isHit(this.syncBounds(), nullCookie.syncBounds())) {
          if (nullCookie.cookie && this.name !== nullCookie.cookie.name && this.hit === 0.5 && !hitB) {
            hitB = true;
            this.interactive = false;
            this.setPosition(
              nullCookie.x,
              nullCookie.y
            );
            that.moveTo(nullCookie.cookie, this.nullCookie.x, this.nullCookie.y, () => {
              this.nullCookie.cookie = nullCookie.cookie;  //我的男朋友的女朋友是他的女朋友
              nullCookie.cookie.nullCookie = this.nullCookie;   //他的女朋友的男朋友是我的男朋友
              nullCookie.cookie = this;    //他的女朋友是我
              nullCookie.cookie.nullCookie = nullCookie;     //他的女朋友的男朋友是他
              this.interactive = true;
              hitB = false;
              console.log("finsh");
            })
          }
        }
      })
      return true;
    }

    DrogEvent.cookieOnDragStart = function (pointer, startX, startY) {
      if (!this.interactive) {
        return false;
      }
      that.clickSound.play();
    }


    DrogEvent.cookieOnDragEnd = function (this: Cookie) {
      if (!this.interactive) {
        return false;
      }
      that.clickSound.play();
      if (this.hit === 0 || this.hit === 0.5) {
        that.moveTo(this, this.initPosition.x, this.initPosition.y, () => {
          if (this.hit === 0.5) {
            that.physics.world.enable(this);
            this.hit = 0;
            if (this.nullCookie !== undefined && this.nullCookie !== null) {
              console.log(this.nullCookie);
              this.nullCookie.collision = 0;
            }
            this.nullCookie.cookie = null;
            that.layer1.remove(this);
            that.layer2.add(this);
          }
        })
      }
    }



    this.cookies.forEach(cookieEvent);
    function cookieEvent(cookie: ButtonContainer) {
      (cookie.body as Phaser.Physics.Arcade.Body)
        .setCollideWorldBounds(true)
        .setSize(cookie.shape.width, cookie.shape.height)
        .setOffset(cookie.shape.x, cookie.shape.y);
      that.input.setDraggable(cookie, true);
      cookie.on("dragstart", DrogEvent.cookieOnDragStart);
      cookie.on("drag", DrogEvent.cookieOnDrag);
      cookie.on("dragend", DrogEvent.cookieOnDragEnd);
    }

    let collisionNullcookies: Phaser.GameObjects.Image[] = [];
    let collider_1 = that.physics.add.overlap(that.cookies, that.nullCookies, overlapHandler_1, null, this);

    function overlapHandler_1(...args) {
      if (working) {
        return false;
      }
      let hits: number = 0;

      working = true;
      args[0].setPosition(args[1].x, args[1].y);
      that.layer2.remove(args[0]);
      that.layer1.add(args[0]);
      args[0].interactive = false;
      args[0].setScale(1);
      args[0].nullCookie = args[1];
      that.physics.world.disable(args[0]);

      setTimeout(() => {
        args[0].interactive = true;
        args[0].hit = 0.5;
        working = false;
      }, 1000);

      let collideCookie = args[1].cookie;
      if (collideCookie !== null && collideCookie.hit === 0.5) {
        collideCookie.hit = 0;
        if (args[0].name !== collideCookie.name) {
          that.moveTo(collideCookie, collideCookie.initPosition.x, collideCookie.initPosition.y, () => {
            that.layer1.remove(collideCookie);
            that.layer2.add(collideCookie);
            collideCookie.interactive = true;
            that.physics.world.enable(collideCookie);
          });
        }
      }

      args[1].cookie = args[0];
      args[1].collision = 1;

      that.nullCookies.forEach((nullCookie, i) => {
        let result = nullCookie.collision;
        hits += result;
        if (hits === that.nullCookies.length) {
          that.dragEnd();
        }
      })
    }
  }

  /**
   * 拖拽结束
   */
  private dragEnd(): void {
    console.log("拖拽结束");
    this.cookies.forEach(cookie => {
      cookie.off("dragstart");
      cookie.off("drag");
      cookie.off("dragend");
    })
    this.civaMen.round.times += 1;
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
    this.sellingGold = new SellingGold(this, {
      callback: () => {
        this.sellingGold.golds.destroy();
        this.civaJump.call(this);
        this.setGoldValue(3);
      }
    });
    this.civaMen.round.result = 1;
    this.tipsParticlesEmitter.success(() => {
      this.sellingGold.goodJob(3);
    })
  }

  /**
   * 错误的结果处理
   */
  private isWrong(): void {
    this.civaMen.round.result = 0;
    if (this.civaMen.round.times === 1) {
      this.tryAgin();
    } else if (this.civaMen.round.times >= 2) {
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
    this.layer1.list.forEach(obj => {
      if (obj instanceof Cookie) {
        this.layer1.remove(obj);
        this.layer2.add(obj);
      };
    })
    this.layer2.list.forEach(obj => {
      if (obj instanceof NullCookie) {
        this.layer2.remove(obj);
        this.layer1.add(obj);
      };
    })
    this.nullCookies.forEach(nullCookie => {
      nullCookie.collision = 0;
      nullCookie.cookie = null;
    })
    this.cookies.forEach(cookie => {
      this.physics.world.enable(cookie);
      cookie.setPosition(
        cookie.initPosition.x,
        cookie.initPosition.y
      )
      cookie.on("dragstart", DrogEvent.cookieOnDragStart);
      cookie.on("drag", DrogEvent.cookieOnDrag);
      cookie.on("dragend", DrogEvent.cookieOnDragEnd);
      cookie.hit = 0;
      cookie.interactive = true;
      cookie.nullCookie = null;
    });
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
    this.layer1.destroy();
    this.layer2.destroy();
    this.layer3.destroy();
    index += 1;
    this.scene.start('Game9PlayScene', {
      data: this.ccData,
      index: index
    });
  }

  /**
   * 判断拖拽的结果，是否准确
   */
  private checkoutResult(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.nullCookies.forEach(nullCookie => {
        if (nullCookie.name !== nullCookie.cookie.name) {
          reject("结果错误");
        }
      })
      resolve("结果正确");
    })
  }

  /**
   * civa 开始跳跃
   */
  private civaJump(): void {
    this.civaMen.animateEnd = this.nextRound.bind(this);
    switch (this.nullCookies.length) {
      case 2:
        this.civaMen.startJumpIn(3, [365, 680, 928]);
        break;
      case 3:
        this.civaMen.startJumpIn(4, [365, 528, 680, 928]);
        break;
      case 4:
        this.civaMen.startJumpIn(5, [288, 446, 600, 762, 928]);
        break;
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

}
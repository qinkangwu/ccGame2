import "phaser";
import { get } from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import { item } from "../../interface/Game10";
import CreateMask from '../../Public/CreateMask';
import PlanAnims from "../../Public/PlanAnims";
import TipsParticlesEmitter from "../../Public/TipsParticlesEmitter";
import { Gold, SellingGold, GameEnd } from "../../Public/jonny/components";

const W = 1024;
const H = 552;

export default class Game10PlayScene extends Phaser.Scene {
  private ccData: item[] = [];
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private lifeIcon: Phaser.GameObjects.Image; //金币数量
  private lifeText: Phaser.GameObjects.Text; //金币文本
  private comment: Phaser.GameObjects.Image; //提示按钮
  private content: Phaser.GameObjects.Text; //内容
  private keywordsArr: Phaser.GameObjects.Sprite[] = []; // 键盘集合
  private keywordsArr2: Phaser.GameObjects.Text[] = [];//键盘文本集合
  private goldNumber: object = {
    n: 0,
    l: 0,
    c: 5
  }; //金币数量文本
  private sholdGetGold: Phaser.GameObjects.Text; //答对获取到的金币
  private wordsArr: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']; //基础单词随机组合数组
  private submitBtn: Phaser.GameObjects.Sprite; //提交键盘
  private wordGraphics: Phaser.GameObjects.Graphics; //字符末尾
  private graphicsTweens: Phaser.Tweens.Tween; //字符末尾动画引用
  private planAnims: PlanAnims; //飞机过长动画引用
  private currentIndex: number = 0; //当前的索引
  private imgObj: Phaser.GameObjects.Sprite; //图片
  private curData: string[]; //当前的对象
  private tips: TipsParticlesEmitter; //tip组件
  private goldObj: Gold; //金币组件引用
  private currentGoldNum: number = 0; //当前的金币数量
  private errorNum: number = 0; //错误的次数
  private contentOuter: Phaser.GameObjects.Image; //图片框
  private contentOuter2: Phaser.GameObjects.Image; //框夹子
  constructor() {
    super({
      key: "Game10PlayScene"
    });
  }

  init(data): void {
    data && data.data && (this.ccData = data.data);
  }

  preload(): void {
    PlanAnims.loadImg(this);
    this.ccData.map((r, i) => {
      this.load.image(r.name, r.img);
    });
    TipsParticlesEmitter.loadImg(this);
    SellingGold.loadImg(this); //全局组件加载Img
  }


  create(): void {
    this.createBgi(); //背景
    this.planAnims = new PlanAnims(this, 13);
    this.createBgm(); //bgm
    this.createGold(); //金币
    this.renderKeyBorad(); //渲染键盘
    this.renderImg(); //渲染图片
    this.loadMusic(this.ccData); //加载音频
    this.tips = new TipsParticlesEmitter(this, {
      renderBefore: () => {
        this.submitBtn.off('pointerdown');
        this.keywordsArr.map((r, i) => {
          r.off('pointerdown')
        });
      }
    }); //tip组件
    this.goldObj = new Gold(this, this.currentGoldNum);
    this.add.existing(this.goldObj);
    new CreateBtnClass(this, {
      bgm: this.bgm,
      previewCallback: () => {
        this.setContent('');
      },
      commentCallback: () => {
        this.playMusic(this.ccData[this.currentIndex].id);
      },
      previewPosition: {
        y: H - 140,
        _s: true,
        alpha: 1
      }
    }); //公共按钮组件
    new CreateMask(this, () => {
      this.planAnims.show(1, () => {
        this.initAnims();
        this.renderWordGraphics();
      })
    }); //遮罩层
  }

  private distanceHandle(arr: string[]): string[] {
    let obj = {};
    let result = [];
    for (let i of arr) {
      if (!obj[i]) {
        result.push(i)
        obj[i] = 1
      }
    }
    return result;
  }

  private playMusic(sourceKey: string): void {
    //播放音频
    let mp3: Phaser.Sound.BaseSound = this.sound.add(sourceKey);
    mp3.play();
  }

  private loadMusic(data: Array<item>): void {
    //加载音频
    data && data.map((r: item, i: number) => {
      this.load.audio(r.id, r.audioKey);
    })
    this.load.start(); //preload自动运行，其他地方加载资源必须手动启动，不然加载失效
  }

  private renderImg(): void {
    this.imgObj = this.add.sprite(411.5, 277.5, this.ccData[this.currentIndex].name)
      .setOrigin(1)
      .setDisplaySize(233, 191)
      .setAngle(-8);
  }

  private initAnims(): void {
    //入场动画
    this.keywordsArr.map((r, i) => {
      this.tweens.add({
        targets: [r, this.keywordsArr2[i]],
        ease: 'Power3',
        delay: i * 100,
        duration: 500,
        y: `+=${H}`
      })
    })
    this.tweens.add({
      targets: this.submitBtn,
      ease: 'Power3',
      delay: 1000,
      duration: 500,
      y: `+=${H}`
    });
    this.anims.create({
      key: 'submit',
      frames: this.anims.generateFrameNames('game10icons1', { start: 0, end: 2, zeroPad: 0, prefix: 'btn_submit', suffix: '.png' }),
      frameRate: 10,
      repeat: 0,
      yoyo: true
    });
    this.anims.create({
      key: 'keydown',
      frames: this.anims.generateFrameNames('game10icons3', { start: 0, end: 2, zeroPad: 0, prefix: 'btn_keybord', suffix: '.png' }),
      frameRate: 10,
      repeat: 0,
      yoyo: true
    });
    this.playContentOuterAnims();
  }

  private createGold(): void {
    this.lifeIcon = this.add.image(55, H - 55, 'game10icons2', 'life.png');
    //@ts-ignore
    this.lifeText = this.add.text(this.lifeIcon.x + 14, this.lifeIcon.y + 12, this.goldNumber.l + '', {
      fontSize: "14px",
      fontFamily: "Arial Rounded MT Bold",
      fill: '#fff',
    }).setOrigin(.5);
    //@ts-ignore
    this.sholdGetGold = this.add.text(326, 430, this.goldNumber.c, {
      fontSize: "35px",
      fill: '#F9752F',
    }).setOrigin(.5);
  }

  private shuffle<T>(arr: T[]): T[] {
    //Fisher-Yates shuffle 算法 打乱数组顺序
    for (let i: number = 1; i < arr.length; i++) {
      let random: number = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[random]] = [arr[random], arr[i]];   //es6  交换数组成员位置
    }
    return arr;
  }

  private renderKeyBorad(): void {
    //渲染键盘
    this.curData = this.ccData[this.currentIndex].name.split('');
    this.curData = this.distanceHandle(this.curData);
    this.wordsArr = this.shuffle(this.wordsArr);
    this.curData = this.distanceHandle(this.shuffle(this.curData.concat(this.wordsArr.slice(0, 10 - this.curData.length))));
    if (this.curData.length !== 10) return this.renderKeyBorad();
    for (let i = 0; i < 10; i++) {
      if (i < 4) {
        let item: Phaser.GameObjects.Sprite = this.add.sprite(600 + (i * 77), 227, 'game10icons3', 'btn_keybord1.png')
          .setOrigin(0)
          .setDisplaySize(89, 87)
          .setInteractive()
          .setData('index', i)
        this.keywordsArr.push(item);
        this.keywordsArr2.push(
          this.add.text(item.x + item.width / 4 + 2, item.y + item.height / 4 - 5, this.curData[i], {
            fontSize: "40px",
            fontFamily: "Arial Rounded MT Bold",
            fill: '#F293B9',
          }).setOrigin(.5)
        )
      } else if (i >= 4 && i < 8) {
        let item: Phaser.GameObjects.Sprite = this.add.sprite(600 + ((i - 4) * 77), 314, 'game10icons3', 'btn_keybord1.png')
          .setOrigin(0)
          .setDisplaySize(89, 87)
          .setInteractive()
          .setData('index', i)
        this.keywordsArr.push(item);
        this.keywordsArr2.push(
          this.add.text(item.x + item.width / 4 + 2, item.y + item.height / 4 - 5, this.curData[i], {
            fontSize: "40px",
            fontFamily: "Arial Rounded MT Bold",
            fill: '#F293B9',
          }).setOrigin(.5)
        )
      } else {
        let item: Phaser.GameObjects.Sprite = this.add.sprite(600 + ((i - 8) * 77), 400, 'game10icons3', 'btn_keybord1.png')
          .setOrigin(0)
          .setDisplaySize(89, 87)
          .setInteractive()
          .setData('index', i)
        this.keywordsArr.push(item);
        this.keywordsArr2.push(
          this.add.text(item.x + item.width / 4 + 2, item.y + item.height / 4 - 5, this.curData[i], {
            fontSize: "40px",
            fontFamily: "Arial Rounded MT Bold",
            fill: '#F293B9',
          }).setOrigin(.5)
        )
      }
    }
    this.submitBtn = this.add.sprite(753, 400, 'game10icons1', 'btn_submit1.png')
      .setOrigin(0)
      .setDisplaySize(166, 87)
      .setInteractive()
      .setData('submitBtn', true);
    this.submitBtn.on('pointerdown', this.itemClickHandle.bind(this, this.submitBtn));
    this.keywordsArr.map((r, i) => {
      r && (r.y -= H);
      this.keywordsArr2[i].y && (this.keywordsArr2[i].y -= H);
      r.on('pointerdown', this.itemClickHandle.bind(this, r))
    });
    this.submitBtn.y -= H;
  }


  private itemClickHandle(...args): void {
    //键盘点击事件
    let obj = args[0];
    if (!(obj instanceof Phaser.GameObjects.Sprite)) return;
    this.playMusic('clickMp3');
    if (obj.getData('submitBtn')) {
      //提交按钮
      obj.play('submit');
      let text = this.content.text;
      if (text === this.ccData[this.currentIndex].name) {
        //成功
        this.tips.success(() => {
          let goldAnims = new SellingGold(this, {
            callback: () => {
              goldAnims.golds.destroy();
              this.goldObj.setText(this.currentGoldNum += 5);
              this.nextWordHandle(); //下一个词
            }
          });
          goldAnims.golds.setDepth(101);
          goldAnims.goodJob(5);
          this.submitBtn.on('pointerdown', this.itemClickHandle.bind(this, this.submitBtn));
          this.keywordsArr.map((r, i) => {
            r.on('pointerdown', this.itemClickHandle.bind(this, r))
          });
        })
      } else {
        //失败
        if (++this.errorNum === 1) {
          this.tips.tryAgain(() => {
            this.clearRenderBorad(); //清空当前键盘布局
            this.renderKeyBorad(); //开始下一个单词的布局
            this.initAnims();
            this.renderWordGraphics();
          })
        } else {
          this.tips.error(() => {
            this.nextWordHandle();
          }, () => {
            this.clearRenderBorad(); //清空当前键盘布局
            this.renderKeyBorad(); //开始下一个单词的布局
            this.initAnims();
            this.renderWordGraphics();
          });
        }
      }
      return;
    }
    obj.play('keydown');
    this.setContent(this.content.text += this.curData[obj.getData('index')]);
  }

  // 下一个单词
  private nextWordHandle(): void {
    this.imgObj.destroy();
    //this.currentIndex = this.currentIndex + 1 > this.ccData.length - 1 ? 0 : this.currentIndex + 1 ;
    this.currentIndex += 1;
    if (this.currentIndex > this.ccData.length - 1) {
      GameEnd.Show(this);
      return;
    } 
      this.errorNum = 0;
      this.renderImg();
      this.clearRenderBorad(); //清空当前键盘布局
      this.renderKeyBorad(); //开始下一个单词的布局
      this.initAnims();
      this.renderWordGraphics();
    
  }

  private clearRenderBorad(): void {
    this.keywordsArr.map((r, i) => {
      r && r.destroy();
      this.keywordsArr2[i] && this.keywordsArr2[i].destroy();
    });
    this.submitBtn.destroy();
    this.keywordsArr.length = 0;
    this.keywordsArr2.length = 0;
    this.submitBtn = null;
    this.setContent('');
    this.clearGraphics();
  }

  private setContent(content: string): void {
    content = content.substr(0, 6);
    this.clearGraphics();
    this.content.setText(content);
    this.renderWordGraphics();
  }

  private createBgm(): void {
    this.bgm = this.sound.add('bgm');
    //@ts-ignore
    this.bgm.play({
      loop: true,
      volume: .2
    })
  }

  private createBgi(): void {
    //背景
    this.add.image(0, 0, 'bgi').setDisplaySize(W, H).setOrigin(0);
    this.content = this.add.text(780, 106, '', {
      fontSize: "80px",
      fontFamily: "Arial Rounded MT Bold",
      fill: '#77F0FF',
    }).setOrigin(.5);
    this.contentOuter = this.add.image(460, 365, 'contentOuter').setOrigin(1).setScale(.5);
    this.contentOuter2 = this.add.image(this.contentOuter.x + 50, 107, 'contentOuter2').setOrigin(1).setScale(.5);
  }

  private playContentOuterAnims(): void {
    this.tweens.timeline({
      targets: [this.contentOuter, this.contentOuter2, this.imgObj],
      ease: 'Sine.easeInOut',
      duration: 100,
      tweens: [
        {
          rotation: '-=0.2'
        },
        {
          rotation: '+=0.4'
        },
        {
          rotation: '-=0.3'
        },
        {
          rotation: '+=0.2'
        },
        {
          rotation: '-=0.1'
        }
      ],
      onComplete: () => {

      }
    });
  }

  private clearGraphics(): void {
    if (!this.wordGraphics) return;
    this.wordGraphics.clear();
    this.wordGraphics.destroy();
    this.wordGraphics = null;
    this.graphicsTweens.stop();
    this.tweens.remove(this.graphicsTweens);
  }

  private renderWordGraphics(): void {
    //渲染字符末尾的矩形
    this.wordGraphics = this.wordGraphics || this.add.graphics();
    this.wordGraphics.fillStyle(0x77F0FF);
    this.wordGraphics.fillRoundedRect(this.content.x + this.content.width / 2, this.content.y + 30, 42, 8, 4);
    this.graphicsTweens = this.tweens.add({
      targets: this.wordGraphics,
      alpha: 0,
      yoyo: true,
      repeat: -1,
      duration: 500
    })
  }

  update(time: number, delta: number): void {
  }
};
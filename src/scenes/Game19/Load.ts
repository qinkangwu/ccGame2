/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Assets, QueryTopic } from '../../interface/SelectTopic';
import { resize, Vec2 } from '../../Public/jonny/core';
import { SellingGold, TryAginListenBtn } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { position3, position4, serial } from '../../Public/jonny/selectTopic';

const W = 1024;
const H = 552;

export default class Game19LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<QueryTopic> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game19.png", "key": "Game19" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" }
    /**
     * game19 UI
     */
    , { "url": "assets/Game19/bg.png", "key": "bg" }, { "url": "assets/Game19/daan03.png", "key": "daan" }, { "url": "assets/Game19/tigan02.png", "key": "tigan" }
  ];

  constructor() {
    super({
      key: "Game19LoadScene"
    });
    this.ccData = [];
  }

  init(): void {
    resize.call(this, W, H);
    this.centerText = this.add.text(1024 * 0.5, 552 * 0.5, '0%', {
      fill: '#fff',
      font: 'bold 60px Arial',
      bold: true,
    }).setOrigin(.5, .5);
    this._loader = new Phaser.Loader.LoaderPlugin(this);
  }

  preload(): void {
    this.load.audio('bgm', 'assets/sounds/bgm-04.mp3');
    this.load.audio('successMp3', 'assets/sounds/successMp3.mp3');
    this.load.audio('clickMp3', 'assets/sounds/clickMp3.mp3');
    this.load.audio('right', 'assets/sounds/newJoin/right.mp3');
    this.load.audio('wrong', 'assets/sounds/newJoin/wrong.mp3');
    this.load.atlas("wizard", "assets/Game19/wizard.png", "assets/Game19/wizard.json");
    this.load.bitmapFont('ArialRoundedBold', 'assets/font/ArialRoundedBold/font.png', 'assets/font/ArialRoundedBold/font.xml');
    TipsParticlesEmitter.loadImg(this);
    TryAginListenBtn.loadAssets(this);
    SellingGold.loadImg(this);
    this.assets.forEach((v) => {
      this.load.image(v.key, v.url);
    })
    this.load.on("progress", (e: any) => {
      e = Math.floor(e * 100);
      this.centerText.setText(`${e}%`);
    })
    this.load.on("complete", (e: any) => {
      this.getData();
    })
  }

  create(): void {
  }

  /**
   * 正式状态
   */
  private getData() {
    get(apiPath.getQuestionData("c737587a-34ce-47d5-b5c0-6db031712c07","aaeacf2b-bc61-4135-a976-aa1b6815eeaf")).then((res) => {
      if (res.code === '0000') {
        this.ccData = (<any>res.result)
          .filter((v, i) => i >= 20 && i < 30)
          .map(v => {
            delete v.audiokey;
            delete v.imgKey;
            v.questionContent = v.questionContent.replace(/\d+\./, "").replace(/[\?\？]\s*/, "?\n").replace(/^[-—]+/, "").replace(/\s{2,}/, " ").replace(/\?_+/, "?\n").replace(/\n$/, "").replace(/^\s/, "").replace(/\?\s*[—-]+/, "?\n").replace(/\n\s+/, "\n").replace(/&nbsp;/, "").replace(/_+/, "___").replace(/’/, "'").replace(/<\/?\w>/g,"");
            v.answers.forEach((_v, _i) => {
              delete _v.audioKey;
              delete _v.imgKey;
              _v.answerContent = _v.answerContent.replace(/[;；]/, ";\n");
              _v.position = v.answers.length === 4 ? position4[_i] : position3[_i];
              _v.bgTexture = "daan02";
              _v.serial = {
                value: serial[_i],
                position: {
                  x: 0,
                  y: 54
                }
              }
            });
            return v;
          })
      }
    }).then(() => {
      this.loadAudio();
    })
  }

  /**
   * 加载音频
   */
  private loadAudio() {
    // this.ccData.forEach(v => {
    //   this._loader.audio(v.name, v.audioKey);
    //   v.vocabularies.forEach(_v => {
    //     this._loader.audio(_v.name, _v.audioKey);
    //   })
    // })
    // this._loader.on("progress", (e: any) => {
    //   e = Math.floor(50 + e * 50);
    //   this.centerText.setText(`${e}%`);
    // })
    //this._loader.on("complete", () => {
    this.scene.start('Game19PlayScene', {
      data: this.ccData,
      index: 0
    });
    //});
    //this._loader.start();
  }

};
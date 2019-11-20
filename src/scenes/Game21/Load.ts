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

export default class Game21LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<QueryTopic> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game21.png", "key": "Game21" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" }
    /**
     * game19 UI
     */
    , { "url": "assets/Game21/bg_05.png", "key": "bg" }, { "url": "assets/Game21/daan05.png", "key": "daan" }, { "url": "assets/Game21/tigan03.png", "key": "tigan" },{"url":"assets/Game21/civa_05.png","key":"civa"}
  ];

  constructor() {
    super({
      key: "Game21LoadScene"
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
    get(apiPath.getQuestionData).then((res) => {
      if (res.code === '0000') {
        this.ccData = (<any>res.result)
          .filter((v, i) => i >= 30 && i < 40)
          .map(v => {
            delete v.audiokey;
            delete v.imgKey;
            v.questionContent = v.questionContent.replace(/\d+\./, "").replace(/[\?\？]\s*/, "?\n").replace(/^[-—]+/, "").replace(/\s{2,}/, " ").replace(/\?_+/, "?\n").replace(/\n$/, "").replace(/^\s/, "").replace(/\?\s*[—-]+/, "?\n").replace(/\n\s+/, "\n").replace(/&nbsp;/, "").replace(/_+/, "___").replace(/’/, "'");
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
    this.scene.start('Game21PlayScene', {
      data: this.ccData,
      index: 0
    });
    //});
    //this._loader.start();
  }

};
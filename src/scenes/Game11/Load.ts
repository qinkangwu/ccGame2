/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Assets, Game11DataItem, GetSentenceData } from '../../interface/Game11';
import { resize } from '../../Public/jonny/core';
import { SellingGold, TryAginListenBtn ,Particles} from '../../Public/jonny/components';
import { Locomotive} from '../../Public/jonny/game11';
//import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';

const W = 1024;
const H = 552;

export default class Game11LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<Game11DataItem> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [{ "url": "assets/mask/Game11.png", "key": "Game11" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/originalSoundBtn.png", "key": "originalSoundBtn" }, { "url": "assets/commonUI/listenAgain.png", "key": "listenAgain" },{ "url": "assets/Game11/rope.png", "key": "rope" }, { "url": "assets/Game11/symbolTrainBox.png", "key": "symbolTrainBox" }, { "url": "assets/Game11/trainBox.png", "key": "trainBox" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/Game11/bg.png", "key": "bg" }, { "url": "assets/Game11/ground.png", "key": "ground" }, { "url": "assets/Game11/bgFull.png", "key": "bgFull" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" }];
  constructor() {
    super({
      key: "Game11LoadScene"
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
    this.load.json("trainboxShape", "assets/Game11/trainboxShape.json");
    this.load.audio('bgm', 'assets/sounds/bgm-03.mp3');
    this.load.bitmapFont('ArialRoundedBold30', 'assets/font/ArialRoundedBold30/font.png', 'assets/font/ArialRoundedBold30/font.xml');
    this.load.bitmapFont('ArialRoundedBold', 'assets/font/ArialRoundedBold/font.png', 'assets/font/ArialRoundedBold/font.xml');
    Locomotive.loadImg(this);
    TipsParticlesEmitter.loadImg(this);
    TryAginListenBtn.loadAssets(this);
    //PlanAnims.loadImg(this);
    Particles.loadImg(this);
    SellingGold.loadImg(this);
    this.assets.forEach((v) => {
      this.load.image(v.key, v.url);
    })
    this.load.on("progress", (e: any) => {
      e = Math.floor(e * 50);
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
    get(apiPath.getSentenceData).then((res) => {
      if (res.code === '0000') {
        this.ccData = (<GetSentenceData[]>res.result)
          .map(v => {
            delete v.id;
            delete v.videoId;
            delete v.imgKey;
            //v.name = v.name.replace(/\s/g, "");
            v.vocabularies.map(_v => {
              delete _v.id;
              delete _v.videoId;
              delete _v.img;
              delete _v.syllable;
              delete _v.phoneticSymbol;
              return _v;
            });
            return v;
          })
          .filter(v=>{
            return v.vocabularies.length < 7;   //过滤长度大于7的数据
          })
      }
    }).then(() => {
      this.loadAudio();
    })
  }

  /**
   * 加载音频
   */
  private loadAudio(): void {
    this.ccData.forEach(v => {
      this._loader.audio(v.name, v.audioKey);
      v.vocabularies.forEach(_v => {
        this._loader.audio(_v.name, _v.audioKey);
      })
    })
    this._loader.on("progress", (e: any) => {
      e = Math.floor(50 + e * 50);
      this.centerText.setText(`${e}%`);
    })
    this._loader.on("complete", () => {
      this.scene.start('Game11PlayScene', {
        data: this.ccData,
        index: 0
      });
    });
    this._loader.start();
  }

};
import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Assets, QueryTopic } from '../../interface/Game13';
import { resize } from '../../Public/jonny/core';
import { SellingGold, TryAginListenBtn } from '../../Public/jonny/components';
import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';

const W = 1024;
const H = 552;

export default class Game13LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<QueryTopic> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game13.png", "key": "Game13" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" },
    /**
     * game13 UI
     */
    { "url": "assets/Game13/bg.png", "key": "bg" }, { "url": "assets/Game13/clearCar.png", "key": "clearCar" }, { "url": "assets/Game13/dirtyCar.png", "key": "dirtyCar" }, { "url": "assets/Game13/light.png", "key": "light" }, { "url": "assets/Game13/orderUI.png", "key": "orderUI" }, { "url": "assets/Game13/rag.png", "key": "rag" }, { "url": "assets/Game13/waterGun.png", "key": "waterGun" }];

  constructor() {
    super({
      key: "Game13LoadScene"
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
    this.load.bitmapFont('ArialRoundedBold30', 'assets/font/ArialRoundedBold30/font.png', 'assets/font/ArialRoundedBold30/font.xml');
    TipsParticlesEmitter.loadImg(this);
    TryAginListenBtn.loadAssets(this);
    PlanAnims.loadImg(this);
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
    get("assets/game13/getExamList.json").then((res) => {
      if (res.code === '0000') {
        this.ccData = (<any>res.result.questions)
          .filter(v => {
            return v.questionkeyword === "选择正确答案";
          })
          .map(v => {
            delete v.answerisright;
            delete v.audiokey;
            delete v.endtime;
            delete v.id;
            delete v.questionkeyword;
            delete v.exammoduletype;
            delete v.starttime;
            delete v.studentanswer;
            delete v.questiontype;
            v.questioncontent = v.questioncontent.replace(/[\?\？]\s*/, "?\n").replace(/^\s/,"").replace(/^[-—]+/,"").replace(/\s*_+\s*/,"___").replace(/\s*/," ").replace(/\s_*\s/,"___").replace(/\?_+/,"?\n").replace(/\n$/,"").replace(/^\s/,"").replace(/\?\s*[—-]+/,"?\n").replace(/↵\s+/,"\n");
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
  private loadAudio(): void {
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
    // this._loader.on("complete", () => {
      // this.scene.start('Game13PlayScene', {
      //   data: this.ccData,
      //   index: 0
      // });
    //});
    //this._loader.start();
  }

};
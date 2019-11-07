import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Assets, Topic } from '../../interface/Game16';
import { resize } from '../../Public/jonny/core';
import { SellingGold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';

const W = 1024;
const H = 552;

export default class Game16LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<Topic> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game16.png", "key": "Game16" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" },
    /**
     * game16 UI
     */
    { "url": "assets/Game16/bg_purple.png", "key": "bg_purple" }, { "url": "assets/Game16/bg_subject.png", "key": "bg_subject" }, { "url": "assets/Game16/bg_yellow.png", "key": "bg_yellow" }, { "url": "assets/Game16/btn_false.png", "key": "btn_false" }, { "url": "assets/Game16/btn_true.png", "key": "btn_true" }, { "url": "assets/Game16/civa_angle_01.png", "key": "civa_angle_01" }, { "url": "assets/Game16/civa_angle_02.png", "key": "civa_angle_02" }, { "url": "assets/Game16/civa_devil_01.png", "key": "civa_devil_01" }, { "url": "assets/Game16/civa_devil_02.png", "key": "civa_devil_02" },{"url":"assets/mask/Game16.png","key":"Game16"}];

  constructor() {
    super({
      key: "Game16LoadScene"
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
    get("assets/Game16/getTopic.json").then((res) => {
      if (res.code === '0000') {
        this.ccData = res.result.questions;
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
    this._loader.on("complete", () => {
      this.scene.start('Game16PlayScene', {
        data: this.ccData,
        index: 0
      });
    });
    this._loader.start();
  }

};

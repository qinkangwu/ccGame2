import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Assets, Topic } from '../../interface/Game16';
import { resize } from '../../Public/jonny/core';
import { SellingGold, Particles } from '../../Public/jonny/components';
import { Door, IndexText, OrderUI, Blood, TipsReliveParticlesEmitter } from '../../Public/jonny/game16';

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
    { "url": "assets/Game16/F.Devil.png", "key": "F.Devil" }, { "url": "assets/Game16/T.Angel.png", "key": "T.Angel" }, { "url": "assets/Game16/bg_purple.png", "key": "bg_purple" }, { "url": "assets/Game16/bg_subject.png", "key": "bg_subject" }, { "url": "assets/Game16/bg_yellow.png", "key": "bg_yellow" }, { "url": "assets/Game16/btn_false.png", "key": "btn_false" }, { "url": "assets/Game16/btn_true.png", "key": "btn_true" }, { "url": "assets/Game16/civa_angle_01.png", "key": "civa_angle_01" }, { "url": "assets/Game16/civa_angle_02.png", "key": "civa_angle_02" }, { "url": "assets/Game16/civa_angle_03.png", "key": "civa_angle_03" }, { "url": "assets/Game16/civa_devil_01.png", "key": "civa_devil_01" }, { "url": "assets/Game16/civa_devil_02.png", "key": "civa_devil_02" },{ "url": "assets/Game16/civa_devil_03.png", "key": "civa_devil_03" }, { "url": "assets/mask/Game16.png", "key": "Game16" }, { "url": "assets/Game16/bottomBar.png", "key": "bottomBar" }, { "url": "assets/Game16/leftBg.png", "key": "leftBg" }, { "url": "assets/Game16/rightBg.png", "key": "rightBg" }, { "url": "assets/Game16/vs.png", "key": "vs" }];

  constructor() {
    super({
      key: "Game16LoadScene"
    });
    this.ccData = [];
  }

  init(res?: { wheel: number; }): void {
    resize.call(this, W, H);
    this.centerText = this.add.text(1024 * 0.5, 552 * 0.5, '0%', {
      fill: '#fff',
      font: 'bold 60px Arial',
      bold: true,
    }).setOrigin(.5, .5);
    this._loader = new Phaser.Loader.LoaderPlugin(this);
  }

  preload(): void {
    this.load.audio('bgm', 'assets/sounds/bgm-06.mp3');
    this.load.audio('defense', 'assets/sounds/defense.mp3');
    this.load.audio('heavyBoxing', 'assets/sounds/heavy_boxing.mp3');
    this.load.audio('angelRelive', 'assets/sounds/angelRelive.mp3');
    this.load.bitmapFont('ArialRoundedBold', 'assets/font/ArialRoundedBold/font.png', 'assets/font/ArialRoundedBold/font.xml');
    this.load.bitmapFont('AlibabaNumber200', 'assets/font/AlibabaNumber200/font.png', 'assets/font/AlibabaNumber200/font.xml');
    this.load.atlas('blood2', 'assets/Game16/blood2.png', 'assets/Game16/blood2.json');
    this.load.atlas('blood8', 'assets/Game16/blood8.png', 'assets/Game16/blood8.json');
    this.load.atlas('angelAction', 'assets/Game16/angelAction.png', 'assets/Game16/angelAction.json');
    this.load.atlas('devilAction', 'assets/Game16/devilAction.png', 'assets/Game16/devilAction.json');
    this.load.atlas('relive', 'assets/Game16/relive.png', 'assets/Game16/relive.json');
    TipsReliveParticlesEmitter.loadImg(this);
    SellingGold.loadImg(this);
    Particles.loadImg(this);
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
    get(apiPath.getWordConfusionList).then((res) => {
      if (res.code === '0000') {
        this.ccData = res.result.filter((v, i) => i <= 7);
        this.ccData = this.ccData.concat(this.ccData,this.ccData,this.ccData,this.ccData);
      }
    }).then(() => {
      this.loadRequestAssets();
    })
  }

  /**
   * 加载网络资源
   */
  private loadRequestAssets(): void {
    this.ccData.forEach(v => {
      this._loader.image(v.trueWord, v.imgUrl);
    })
    this._loader.on("progress", (e: any) => {
      e = Math.floor(50 + e * 50);
      this.centerText.setText(`${e}%`);
    })
    this._loader.on("complete", () => {
      this.scene.start('Game16PlayScene', {
        data: this.ccData,
        index: 0
      });
    });
    this._loader.start();
  }

};

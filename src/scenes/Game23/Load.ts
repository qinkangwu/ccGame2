/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { resize } from '../../Public/jonny/core';
import { Game23Data,Assets } from '../../interface/Game23';
import { SellingGold, Particles } from '../../Public/jonny/components';

const W = 1024;
const H = 552;

export default class Game16LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<Game23Data> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game23.png", "key": "Game23" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" },
    /**
     * game23 UI
     */
    { "url": "assets/Game23/bg_all.png", "key": "bg_all" },
    { "url": "assets/Game23/bg_basin.png", "key": "bg_basin" },
    { "url": "assets/Game23/civa.png", "key": "civa" },
    { "url": "assets/Game23/img_mz.png", "key": "img_mz" }
    ];

  constructor() {
    super({
      key: "Game23LoadScene"
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
    get("assets/Game23/getGame23Data.json").then((res) => {
      if (res.code === '0000') {
        this.ccData = res.result;
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
      this._loader.image(v.questionContent, v.imgKey);
      this._loader.audio(v.questionContent+"Sound",v.audioKey);
    })
    this._loader.on("progress", (e: any) => {
      e = Math.floor(50 + e * 50);
      this.centerText.setText(`${e}%`);
    })
    this._loader.on("complete", () => {
      this.scene.start('Game23PlayScene', {
        data: this.ccData,
        index: 0
      });
    });
    this._loader.start();
  }

};

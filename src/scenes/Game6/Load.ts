import 'phaser';
import apiPath from '../../lib/apiPath';
import { get, makeParams } from '../../lib/http';
import { Game6DataItem, game6asset } from '../../interface/Game6';
import {resize} from '../../Public/jonny/core'; 
import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
 
const W = 1024;
const H = 552;

export default class Game6LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<Game6DataItem> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: game6asset[] = [{ "url": "assets/Game6/analysis.png", "key": "analysis" }, { "url": "assets/Game6/bg.png", "key": "bg" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/Game6/btn_last_1.png", "key": "btn_last_1" }, { "url": "assets/Game6/btn_last_2.png", "key": "btn_last_2" }, { "url": "assets/Game6/btn_luyin.png", "key": "btn_luyin" }, { "url": "assets/Game6/btn_luyin_progress.png", "key": "btn_luyin_progress" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/Game6/img_ballgreen.png", "key": "img_ballgreen" }, { "url": "assets/Game6/img_ballnull.png", "key": "img_ballnull" }, { "url": "assets/Game6/img_ballpurple.png", "key": "img_ballpurple" }, { "url": "assets/Game6/img_ballyellow.png", "key": "img_ballyellow" }, { "url": "assets/Game6/img_cloud.png", "key": "img_cloud" }, { "url": "assets/Game6/tips_arrow_left.png", "key": "tips_arrow_left" }, { "url": "assets/Game6/tips_arrow_right.png", "key": "tips_arrow_right" }, { "url": "assets/Game6/tips_arrow_up.png", "key": "tips_arrow_up" }, { "url": "assets/Game6/tips_goodjob.png", "key": "tips_goodjob" }, { "url": "assets/Game6/tips_no.png", "key": "tips_no" }, { "url": "assets/Game6/tips_tryagain.png", "key": "tips_tryagain" }, { "url": "assets/Game6/cover.png", "key": "cover" }, { "url": "assets/Game6/particles.png", "key": "particles" },{"url":"assets/commonUI/pointer.png","key":"pointer"},{"url":"assets/commonUI/gold.png","key":"gold"},{"url":"assets/commonUI/goldValue.png","key":"goldValue"}];

  constructor() {
    super({
      key: "Game6LoadScene"
    });
    this.ccData = [];
  }

  init(): void {
    resize.call(this,W,H);
    this.centerText = this.add.text(1024 * 0.5, 552 * 0.5, '0%', {
      fill: '#fff',
      font: 'bold 60px Arial',
      bold: true,
    }).setOrigin(.5, .5);
    this._loader = new Phaser.Loader.LoaderPlugin(this);
  }

  preload(): void {
    this.load.audio('bgm', 'assets/sounds/bgm-01.mp3');
     this.load.audio('correct', 'assets/sounds/successMp3.mp3');
     this.load.audio('click', 'assets/sounds/clickMp3.mp3');
     this.load.bitmapFont('ArialRoundedBold', 'assets/font/ArialRoundedBold/font.png','assets/font/ArialRoundedBold/font.xml');
    this.assets.forEach((v) => {
      this.load.image(v.key, v.url);
    })
    PlanAnims.loadImg(this);
    TipsParticlesEmitter.loadImg(this);
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
    get(apiPath.getWordsData).then((res) => {
      res && res.code === '0000' && (this.ccData = res.result);
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
      v.phoneticSymbols.forEach(_v => {
        this._loader.audio(_v.name, _v.audioKey);
      })
    })
    this._loader.on("progress", (e: any) => {
      e = Math.floor(50 + e * 50);
      this.centerText.setText(`${e}%`);
    })
    this._loader.on("complete", () => {
      this.scene.start('Game6PlayScene', {
        data: this.ccData,
        index: 0
      });
    });
      this._loader.start();
  }

};
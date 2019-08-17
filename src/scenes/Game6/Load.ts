import 'phaser';
import apiPath from '../../lib/apiPath';
import { get, makeParams } from '../../lib/http';
import { Game6DataItem, game6asset } from '../../interface/Game6';
import core from '../../Public/jonny/core'; 

const W = 1024;
const H = 552;

export default class Game6LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<Game6DataItem> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: game6asset[] = [{ "url": "assets/Game6/analysis.png", "key": "analysis" }, { "url": "assets/Game6/bg.png", "key": "bg" }, { "url": "assets/Game6/bgm.mp3", "key": "bgm" }, { "url": "assets/Game6/btn_exit.png", "key": "btn_exit" }, { "url": "assets/Game6/btn_last_1.png", "key": "btn_last_1" }, { "url": "assets/Game6/btn_last_2.png", "key": "btn_last_2" }, { "url": "assets/Game6/btn_luyin.png", "key": "btn_luyin" }, { "url": "assets/Game6/btn_luyin_progress.png", "key": "btn_luyin_progress" }, { "url": "assets/Game6/btn_sound_off.png", "key": "btn_sound_off" }, { "url": "assets/Game6/btn_sound_on.png", "key": "btn_sound_on" }, { "url": "assets/Game6/getSugarGourdWordByBookUnitId.json", "key": "getSugarGourdWordByBookUnitId" }, { "url": "assets/Game6/img_ballgreen.png", "key": "img_ballgreen" }, { "url": "assets/Game6/img_ballnull.png", "key": "img_ballnull" }, { "url": "assets/Game6/img_ballpurple.png", "key": "img_ballpurple" }, { "url": "assets/Game6/img_ballyellow.png", "key": "img_ballyellow" }, { "url": "assets/Game6/img_cloud.png", "key": "img_cloud" }, { "url": "assets/Game6/tips_arrow_left.png", "key": "tips_arrow_left" }, { "url": "assets/Game6/tips_arrow_right.png", "key": "tips_arrow_right" }, { "url": "assets/Game6/tips_arrow_up.png", "key": "tips_arrow_up" }, { "url": "assets/Game6/tips_goodjob.png", "key": "tips_goodjob" }, { "url": "assets/Game6/tips_no.png", "key": "tips_no" }, { "url": "assets/Game6/tips_tryagain.png", "key": "tips_tryagain" }, { "url": "assets/Game6/cover.png", "key": "cover" }, { "url": "assets/Game6/particles.png", "key": "particles" }];

  private bg: Phaser.GameObjects.Image;
  private cover: Phaser.GameObjects.Image;

  private imgLoadDone: boolean = false;  //图片是否加载完毕
  private audioLoadDone: boolean = false;   //数据是否加载完毕

  constructor() {
    super({
      key: "Game6LoadScene"
    });
    this.ccData = [];
  }

  init(): void {
    core.resize.call(this,W,H);
    this.centerText = this.add.text(1024 * 0.5, 552 * 0.5, '0%', {
      fill: '#fff',
      font: 'bold 60px Arial',
      bold: true,
    }).setOrigin(.5, .5);
    this._loader = new Phaser.Loader.LoaderPlugin(this);
  }

  preload(): void {
    this.load.audio('bgm', 'assets/Game6/bgm.mp3');
    this.load.audio('correct', 'assets/sounds/正确音效.mp3');
    this.load.audio('click', 'assets/sounds/点击音效.mp3');
    this.load.audio('wrong', 'assets/sounds/错误音效.mp3');
    this.assets.forEach((v) => {
      this.load.image(v.key, v.url);
    })
    this.load.on("progress", (e: any) => {
      e = Math.floor(e * 50);
      this.centerText.setText(`${e}%`);
    })
    this.load.on("complete", (e: any) => {
      this.imgLoadDone = true;
      this.getData();
    })
  }

  create(): void {
    this.bg = this.add.image(0, 0, "bg").setOrigin(0).setAlpha(0);
    this.cover = this.add.image(1024 * 0.5, 552 * 0.5, "cover").setAlpha(0);
    this.cover.setInteractive();
    this.cover.on("pointerdown", () => {
      if (!this.audioLoadDone || !this.imgLoadDone) {
        return false;
      }
      this.scene.start('Game6PlayScene', {
        data: this.ccData,
        index: 0
      });
    });
  }

  // private resize(): void {
  //   // let head = document.querySelector("head");
  //   // head.innerHTML+=`
  //   //   <link href="assets/css/jonny.css" rel="stylesheet"/>
  //   // `;
  //   var content: HTMLElement = document.querySelector("#content");
  //   content.style.backgroundColor = "#000000";
  //   var canvas = document.querySelector("canvas");
  //   this.scale.resize(1024, 552);
  //   this.scale.scaleMode = Phaser.Scale.NONE;
  //   canvas.setAttribute("style", `
  //     width: 100% !important;
  //     height: 100% !important;
  //     object-fit: ;
  //     object-position: center;
  //     `)
  //   //this.scale.
  //   /* init work*/
  // }

  /**
   * 正式状态
   */
  private getData() {
    get("assets/Game6/getSugarGourdWordByBookUnitId.json").then((res) => {
      res && res.code === '0000' && (this.ccData = res.result);
    }).then(() => {
      this.audioLoadDone = true;
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
      this.bg.setAlpha(0.4);
      this.cover.setAlpha(1);
    });
    this._loader.start();
  }

};
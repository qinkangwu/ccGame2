import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Assets, QueryTopic } from '../../interface/Game13';
import { resize, Vec2 } from '../../Public/jonny/core';
import { SellingGold, TryAginListenBtn } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';

const W = 1024;
const H = 552;

export default class Game17LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<QueryTopic> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game17.png", "key": "Game17" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" }
    /**
     * game15 UI
     */
    , { "url": "assets/Game17/bg.png", "key": "bg" }, { "url": "assets/Game17/civa_02.png", "key": "civa_02" }, { "url": "assets/Game17/daan02.png", "key": "daan02" }, { "url": "assets/Game17/tigan01.png", "key": "tigan01" }
  ];

  constructor() {
    super({
      key: "Game17LoadScene"
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
    this.load.atlas("mouth","assets/Game17/mouth.png","assets/Game17/mouth.json");
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
    let serial: string[] = ["A", "B", "C", "D"]
    let position: Array<Vec2> = [
      new Vec2(27 + 256 * 0.5, 322 + 204 * 0.5),
      new Vec2(284 + 256 * 0.5, 322 + 204 * 0.5),
      new Vec2(511.5 + 256 * 0.5, 322 + 204 * 0.5),
      new Vec2(767.5 + 256 * 0.5, 322 + 204 * 0.5)
    ];
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
            v.questioncontent = v.questioncontent.replace(/[\?\？]\s*/, "?\n").replace(/^[-—]+/, "").replace(/\s{2,}/, " ").replace(/\?_+/, "?\n").replace(/\n$/, "").replace(/^\s/, "").replace(/\?\s*[—-]+/, "?\n").replace(/\n\s+/, "\n");
            v.answers.push({
              id: "126d8151-17e9-4e5e-8860-60c83ea15d32",
              answercontent: "nerver",
              isright: "0"
            });
            v.answers.forEach((_v, _i) => {
              _v.position = position[_i];
              _v.bgTexture = "daan02";
              _v.serial = {
                value: serial[_i],
                position: {
                  x: 36,
                  y: -64.95
                }
              }
            });
            return v;
          })
        console.log(this.ccData);
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
    this.scene.start('Game17PlayScene', {
      data: this.ccData,
      index: 0
    });
    //});
    //this._loader.start();
  }

};
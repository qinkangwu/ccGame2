/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn/guiyang  
 */

import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { TrueFalseInterface } from '../../interface/TrueFalseInterface';
import { resize, Vec2 } from '../../Public/jonny/core';
import { SellingGold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
//import { position3, position4, serial } from '../../Public/jonny/selectTopic';

const W = 1024;
const H = 552;

export default class Game22LoadScene extends Phaser.Scene {
  private ccData: Array<TrueFalseInterface> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Array<{ url: string; key: string }> = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game22.png", "key": "Game22" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" }
    /**
     * game22 UI
     */
    , { "url": "assets/Game22/bg_all.png", "key": "bg_all" }, { "url": "assets/Game22/bg_f.png", "key": "bg_f" }, { "url": "assets/Game22/bg_t.png", "key": "bg_t" }, { "url": "assets/Game22/bg_talk_pop.png", "key": "bg_talk_pop" }, { "url": "assets/Game22/img_civa.png", "key": "img_civa" }
  ];

  constructor() {
    super({
      key: "Game22LoadScene"
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
  }

  preload(): void {
    this.load.audio('bgm', 'assets/sounds/bgm-04.mp3');
    this.load.audio('successMp3', 'assets/sounds/successMp3.mp3');
    this.load.audio('clickMp3', 'assets/sounds/clickMp3.mp3');
    this.load.audio('right', 'assets/sounds/newJoin/right.mp3');
    this.load.audio('wrong', 'assets/sounds/newJoin/wrong.mp3');
    this.load.atlas("Darts", "assets/Game22/Darts.png", "assets/Game22/Darts.json");
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
    get(apiPath.getQuestionData("c737587a-34ce-47d5-b5c0-6db031712c07", "b1412200-0c03-11ea-a55e-0894ef25c6a1"))
      .then((res) => {
        if (res.code === '0000') {
          this.ccData = res.result
            .map((v) => {
              delete v.answers;
              delete v.imgKey;
              delete v.audioKey;
              v.questionContent = v.questionContent.replace(/<\/*\w+>/g,"");
              return v;
            });
        }
      }).then(() => {
        this.scene.start('Game22PlayScene', {
          data: this.ccData,
          index: 0
        });
      })
  }

};
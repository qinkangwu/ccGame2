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
import { position3, position4, serial } from '../../Public/jonny/selectTopic';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';

const W = 1024;
const H = 552;

export default class Game0LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<QueryTopic> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Assets[] = [
    /**
     * common UI
     */
    { "url": "assets/mask/Game24.png", "key": "Game24" }, { "url": "assets/commonUI/successBtn.png", "key": "successBtn" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" }, { "url": "assets/commonUI/tipsArrowUp.png", "key": "tipsArrowUp" }
    /**
     * game15 UI
     */
    , { "url": "assets/Game18/bg.png", "key": "bg" }, { "url": "assets/Game18/daan01.png", "key": "daan" }, { "url": "assets/Game18/tigan01.png", "key": "tigan" }

  ];

  constructor() {
    super({
      key: "Game24LoadScene"
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
    //this.load.atlas("wizard", "assets/Game0/wizard.png", "assets/Game0/wizard.json");
    this.load.atlas("civaBee", "assets/Game18/civaBee.png", "assets/Game18/civaBee.json");
    //this.load.atlas("mouth", "assets/Game0/mouth.png", "assets/Game0/mouth.json");
    //this.load.atlas("game0UI", "assets/Game0/game0UI.png", "assets/Game0/game0UI.json");
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
  }



  /**
   * 获取网络资源
   */
  private getData(): Promise<any> {
    //return get(apiPath.getQuestionData("c737587a-34ce-47d5-b5c0-6db031712c07", "aaeacf2b-bc61-4135-a976-aa1b6815eeaf"))
    return get("assets/jsonFile/getQuestionData.json")
      .then((res) => {
        if (res.code === '0000') {
          this.ccData = (<any>res.result);
          window.localStorage.setItem("ccData", JSON.stringify(res.result));
        } else if (res.code === "999999999") {
          this.ccData = JSON.parse(window.localStorage.getItem("ccData"));
        }
      })
      .then(() => {
        this.ccData = (this.ccData as any)
          .filter((v, i) => i <= 10)
          .map(v => {
            delete v.audiokey;
            delete v.imgKey;
            v.questionContent = v.questionContent
            .replace(/\d+\./, "")
            .replace(/[\?\？]\s*/, "?\n")
            .replace(/^[-—]+/, "")
            .replace(/\s{2,}/, " ")
            .replace(/\?_+/, "?\n")
            .replace(/\n$/, "")
            .replace(/^\s/, "")
            .replace(/\?\s*[—-]+/, "?\n")
            .replace(/\n\s+/, "\n")
            .replace(/&nbsp;/, "")
            .replace(/_+/, "___")
            .replace(/’/, "'")
            .replace(/<\/?\w>/g,"");
            v.answers.forEach((_v, _i) => {
              delete _v.audioKey;
              delete _v.imgKey;
              _v.answerContent = _v.answerContent.replace(/[;；]/, ";\n");
              _v.position = v.answers.length === 4 ? position4[_i] : position3[_i];
              _v.bgTexture = "daan02";
              _v.serial = {
                value: serial[_i],
                position: {
                  x: 4,
                  y: 74
                }
              }
            });
            return v;
          })
      })
  }


  async create() {
    await this.getData();
    this.centerText.destroy();

    var control = {
      initValue: window.sessionStorage.getItem("myName") === null || window.sessionStorage.getItem("myName") === undefined ? "" : window.sessionStorage.getItem("myName"),
      template: `
        <input type="text" id="name" placeholder="请输入你的昵称" value />
        <div id="commit">进入游戏</div>
      `,
      parentEl: document.getElementById("content"),
      el: document.createElement("div"),
      commit: null,
      name: null,
      render: function () {
        control.el.id = "control";
        control.el.innerHTML = control.template;
        control.parentEl.appendChild(control.el);
        return control;
      },
      bindElement: function () {
        control.commit = document.getElementById("commit");
        control.name = document.getElementById("name");
        return control;
      },
      bindStyle: function () {
        control.el.setAttribute("style", `
        position: absolute;
        width: 100%;
        height: 100%;
        background: #263238;
        top: 0;
        left: 0;
        `);
        control.name.setAttribute("style", `
        width: 100px;
        text-align: center;
        height: 30px;
        border: none;
        margin-left: calc((100% - 100px) / 2);
        margin-top: 50vh;
        `);
        control.name.value = control.initValue;
        control.commit.setAttribute("style", `
        background: #009688;
    width: 80px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    color: white;
    margin-left: calc((100% - 80px) / 2);
    font-size: 0.85rem;
    margin-top: 10px;
        `);
        return this;
      },
      bindEvent: () => {
        control.commit.addEventListener("click", () => {
          window.sessionStorage.setItem("myName", control.name.value);
          if (control.name.value.length === 0) {
            alert("你没有输入任何内容");
          } else {
            control.nextScene();
          }
        });
      },
      destroy: function () {
        control.parentEl.removeChild(control.el);
      },
      nextScene: () => {
        control.destroy();
        this.scene.start("Game24PlayScene", {
          data: this.ccData,
          index: 0,
          name: control.name.value
        })
      }
    }

    control.render().bindElement().bindStyle().bindEvent();

  }

};
/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Game9DataItem, Game9asset } from '../../interface/Game9';
import { resize } from '../../Public/jonny/core';
import { SellingGold ,TryAginListenBtn} from '../../Public/jonny/components';
import PlanAnims from '../../Public/PlanAnims';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';

const W = 1024;
const H = 552;

export default class Game9LoadScene extends Phaser.Scene {
  private _loader: Phaser.Loader.LoaderPlugin;
  private ccData: Array<Game9DataItem> = [];
  private centerText: Phaser.GameObjects.Text; //文本内容
  private assets: Game9asset[] = [{"url":"assets/Game9/bg.jpg","key":"bg"},{"url":"assets/Game9/civa.png","key":"civa"},{"url":"assets/Game9/cookie.png","key":"cookie"},{"url":"assets/Game9/cover.png","key":"cover"},{"url":"assets/Game9/getSugarGourdWordByBookUnitId.json","key":"getSugarGourdWordByBookUnitId"},{"url":"assets/Game9/null-cookie.png","key":"null-cookie"},{"url":"assets/Game9/shengmingzhi.png","key":"shengmingzhi"},{"url":"assets/commonUI/backplayBtn.png","key":"backplayBtn"},{"url":"assets/commonUI/btnExit.png","key":"btnExit"},{"url":"assets/commonUI/btnSoundOff.png","key":"btnSoundOff"},{"url":"assets/commonUI/btnSoundOn.png","key":"btnSoundOn"},{"url":"assets/commonUI/originalSoundBtn.png","key":"originalSoundBtn"},{"url":"assets/commonUI/tipsGoodjob.png","key":"tipsGoodjob"},{"url":"assets/commonUI/tipsNo.png","key":"tipsNo"},{"url":"assets/commonUI/tipsTryagain.png","key":"tipsTryagain"},{ "url": "assets/commonUI/goldValue.png", "key": "goldValue" },{"url":"assets/commonUI/successBtn.png","key":"successBtn"},{"url":"assets/Game9/trackCircle.png","key":"trackCircle"}];
  constructor() {
    super({
      key: "Game6LoadScene"
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
    this.load.audio('bgm', 'assets/sounds/bgm-02.mp3');
    this.load.audio('correct', 'assets/sounds/successMp3.mp3');
    this.load.audio('click', 'assets/sounds/clickMp3.mp3');
    this.load.audio('wrong', 'assets/sounds/failMp3.mp3');
    this.load.audio("tipsSound",'assets/sounds/newJoin/ListenToThePronunciationAndSelectTheCorrectPhoneticSymbol.mp3');
    this.load.bitmapFont('GenJyuuGothic47', 'assets/font/GenJyuuGothic47/font.png', 'assets/font/GenJyuuGothic47/font.xml');
    TipsParticlesEmitter.loadImg(this)
    TryAginListenBtn.loadAssets(this);
    PlanAnims.loadImg(this);
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
    //get(apiPath.getWordsData).then((res) => {
    get("assets/jsonFile/getSugarGourdWordByBookUnitId.json").then((res) => {
      if(res.code==='0000'){
       this.ccData = res.result
       //.filter((v,i)=>i<12)  //测试状态
       .map(v=>{
        //let pl = v.phoneticSymbols.length; //正确音标的长度
        let pl = v.phoneticSymbols.length; //正确音标的长度
        v.uselessPhoneticSymbols.length = 8 - pl;
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
    this.ccData.forEach(v => {
      this._loader.audio(v.name, v.audioKey);
      v.phoneticSymbols.forEach(_v => {
        this._loader.audio(_v.name, _v.audioKey);
      })
      v.uselessPhoneticSymbols.forEach(_v => {
        this._loader.audio(_v.name, _v.audioKey);
      })
    })
    this._loader.on("progress", (e: any) => {
      e = Math.floor(50 + e * 50);
      this.centerText.setText(`${e}%`);
    })
    this._loader.on("complete", () => {
      this.scene.start('Game9PlayScene', {
        data: this.ccData,
        index: 0
      });
    });
    this._loader.start();
  }

};
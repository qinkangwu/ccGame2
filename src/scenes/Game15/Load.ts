import 'phaser';
import apiPath from '../../lib/apiPath';
import { get } from '../../lib/http';
import { Assets } from '../../interface/Game15';
import { resize } from '../../Public/jonny/core';
import { SellingGold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';

const W = 1024;
const H = 552;

export default class Game15LoadScene extends Phaser.Scene {
    private _loader: Phaser.Loader.LoaderPlugin;
    private ccData: Array<string> = [];
    private centerText: Phaser.GameObjects.Text; //文本内容
    private assets: Assets[] = [
        /**
         * common UI
         */
        { "url": "assets/mask/Game15.png", "key": "Game15" }, { "url": "assets/commonUI/btnSoundOff.png", "key": "btnSoundOff" }, { "url": "assets/commonUI/btnSoundOn.png", "key": "btnSoundOn" }, { "url": "assets/commonUI/btnExit.png", "key": "btnExit" }, { "url": "assets/commonUI/goldValue.png", "key": "goldValue" },
        /**
         * game15 UI
         */
        { "url": "assets/Game15/bg.png", "key": "bg" },
        { "url": "assets/Game15/word_pop.png", "key": "wordPop" },
        { "url": "assets/Game15/largeCarriageNull.png", "key": "largeCarriageNull" },
        { "url": "assets/Game15/largeCarriage.png", "key": "largeCarriage" },
        { "url": "assets/Game15/smallCarriageNull.png", "key": "smallCarriageNull" },
        { "url": "assets/Game15/smallCarriage1.png", "key": "smallCarriage1" },
        { "url": "assets/Game15/smallCarriage2.png", "key": "smallCarriage2" },
        { "url": "assets/Game15/smallCarriage3.png", "key": "smallCarriage3" },
        { "url": "assets/Game15/smallCarriage4.png", "key": "smallCarriage4" },
        { "url": "assets/Game15/smallCarriage5.png", "key": "smallCarriage5" },
        { "url": "assets/Game15/path1.png", "key": "path1" }, { "url": "assets/Game15/path2.png", "key": "path2" }, { "url": "assets/Game15/pathBtn.png", "key": "pathBtn" },{ "url": "assets/Game15/ship.png", "key": "ship" }, { "url": "assets/Game15/shipNull.png", "key": "shipNull" }, { "url": "assets/Game15/terminal.png", "key": "terminal" }];

    constructor() {
        super({
            key: "Game15LoadScene"
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
        this.load.audio('bgm', 'assets/sounds/bgm-05.mp3');
        this.load.bitmapFont('ArialRoundedBold', 'assets/font/ArialRoundedBold/font.png', 'assets/font/ArialRoundedBold/font.xml');
        this.load.bitmapFont('ArialRoundedBold30', 'assets/font/ArialRoundedBold30/font.png', 'assets/font/ArialRoundedBold30/font.xml');
        this.load.bitmapFont('yuantiChinese', 'assets/font/yuantiChinese/font.png', 'assets/font/yuantiChinese/font.xml');
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
        get("assets/Game15/getList.json").then((res) => {
            if (res.code === '0000') {
                this.ccData = res.result;
            }
        }).then(() => {
            this.scene.start('Game15PlayScene', {
                data: this.ccData,
                index: null
            });
        })
    }

    /**
     * 加载音频
     */
    private loadAudio(): void {

    }

};

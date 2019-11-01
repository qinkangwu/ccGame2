import 'phaser';
import { } from 'rxjs';
import { Assets } from '../../interface/Game15';
import { cover, rotateTips, isHit, Vec2, CONSTANT } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Bg, Carriage ,Ship} from '../../Public/jonny/game15/'

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值


export default class Game15PlayScene extends Phaser.Scene {
    private ccData: Array<string> = [];
    private times: number = 0;  //次数

    //静态开始
    private bgm: Phaser.Sound.BaseSound; //背景音乐
    private bg: Bg; //背景图片 
    private btnExit: Button;  //退出按钮
    private btnSound: ButtonMusic; //音乐按钮
    private gold: Gold;
    //静态结束

    //动态开始
    private carriages: Carriage[] = [];   //货物
    private ships: Ship[] = [];   //船
    private tipsParticlesEmitter: TipsParticlesEmitter;
    private sellingGold: SellingGold;

    /**
     * 背景
     */
    private layer0: Phaser.GameObjects.Container;

    /**
     * 船
     */
    private layer1: Phaser.GameObjects.Container;

    /**
    * 货物
    */
    private layer2: Phaser.GameObjects.Container;

    /**
    * 码头
    */
    private layer3: Phaser.GameObjects.Container;

    /**
     * UI
     */
    private layer4: Phaser.GameObjects.Container;

    constructor() {
        super({
            key: "Game15PlayScene"
        });
    }

    init(res: { data: any[], index: number }) {
        index = res.index;
        this.ccData = res.data;
        console.log(this.ccData);
    }

    preload(): void {

    }

    create(): void {
        this.createStage();
        this.createActors();
        if (index === 0) {
            this.scene.pause();
            rotateTips.init();
            this.firstCreate();
            cover(this, "Game15", () => {
                this.gameStart();
            });
        } else {
            this.gameStart();
        }

    }

    update(time: number, delta: number): void {
        this.btnSound.mountUpdate();
        this.resize();
    }



    /**
     * 重置尺寸
     */
    resize() {

    }

    /**
     * 首次才创建
     */
    firstCreate(): void {
        this.bgm = this.sound.add('bgm');
        this.bgm.addMarker({
            name: "start",
            start: 0
        } as Phaser.Types.Sound.SoundMarker);
        let config: Phaser.Types.Sound.SoundConfig = {
            loop: true,
            volume: vol
        }
        this.bgm.play("start", config);
    }

    /**
     * 创建静态场景
     */
    createStage() {
        let that = this;

        this.layer0 = new Phaser.GameObjects.Container(this).setDepth(0);
        this.layer1 = new Phaser.GameObjects.Container(this).setDepth(1);
        this.layer2 = new Phaser.GameObjects.Container(this).setDepth(2);
        this.layer3 = new Phaser.GameObjects.Container(this).setDepth(3);
        this.layer4 = new Phaser.GameObjects.Container(this).setDepth(4);

        this.add.existing(this.layer0);
        this.add.existing(this.layer1);
        this.add.existing(this.layer2);
        this.add.existing(this.layer3);
        this.add.existing(this.layer4);

        this.bg = new Bg(this);
        this.bg.setPosition(512, 276);
        this.layer0.add([this.bg]);

        this.btnExit = new ButtonExit(this);
        this.btnSound = new ButtonMusic(this);
        this.layer4.add([this.btnExit, this.btnSound]);

        this.gold = new Gold(this, goldValue);   //设置金币
    }

    /**
     * 创建演员们
     */
    createActors(): void {

        // create small carriage
        let carriageOffsetX = 130;
        let carriageOffsetY = 83;
        let smallCarriages = this.ccData.filter(v => v[0].length < 8);
        smallCarriages.forEach((data, index) => {
            let _xIndex = index;
            _xIndex = _xIndex % 2;
            let _carriage = new Carriage(this, data[0], 130 + _xIndex * carriageOffsetX, 140 + Math.floor(index / 2) * carriageOffsetY);
            this.layer1.add(_carriage);
            this.carriages.push(_carriage);
        })

        //create large carriage
        let largeCarriages = this.ccData.filter(v => v[0].length > 8)
        console.log(largeCarriages);
        let lastCarriage = this.carriages[this.carriages.length - 1];
        largeCarriages.forEach((data, index) => {
            let _carriage = new Carriage(this, data[0], (130 + 130 + carriageOffsetX) * 0.5, lastCarriage.y + (index + 1) * carriageOffsetY);
            this.layer1.add(_carriage);
            this.carriages.push(_carriage);
        })


        //create ship
        let shipDatas = new Set(this.ccData.map(v=>v[1]));
        shipDatas.forEach(data=>{
            //let _ship = new Ship(this,);
        });

        //创建用户反馈
        this.tipsParticlesEmitter = new TipsParticlesEmitter(this);
    }

    /**
     * 游戏开始
     */
    private gameStart(): void {
        this.carriageScene();


    }

    /**
     * 拖拽货物
     */
    private carriageScene(): void {
        let hideCarriage = (myCarriage: Carriage) => {
            this.carriages
                .filter(carriage => carriage !== myCarriage)
                .forEach(carriage => {
                    carriage.setVisible(false);
                })
        }

        let showCarriage = (myCarriage: Carriage) => {
            this.carriages
                .filter(carriage => carriage !== myCarriage)
                .forEach(carriage => {
                    carriage.setVisible(true);
                    carriage.bg.setAlpha(1);
                    carriage.swicthAnimateTween.pause();
                })
        }

        let toogleShowCarriage = (myCarriage: Carriage) => {
            this.carriages
                .filter(carriage => carriage !== myCarriage)
                .forEach(carriage => {
                    carriage.setVisible(true);
                    carriage.swicthAnimateTween.resume();
                })
        }

        let carriageDragStart = function (this: Carriage) {
            this.bounceAnimate();
            hideCarriage(this);
        }

        let carriageDrag = function (this: Carriage, pointer, dragX, dragY) {
            this.setPosition(dragX, dragY);
            toogleShowCarriage(this);
        }

        let carriageDragEnd = function (this: Carriage) {
            showCarriage(this);
        }

        this.carriages.forEach(carriage => {
            carriage.on("dragstart", carriageDragStart);
            carriage.on("drag", carriageDrag);
            carriage.on("dragend", carriageDragEnd);
        });


    }

    /**
  * 单次播放的音频播放器
  */
    private audioPlay(key: string): Promise<number> {
        return new Promise<number>(resolve => {
            let _tempSound: Phaser.Sound.BaseSound = this.sound.add(key);
            _tempSound.on("complete", function (this: Phaser.Sound.BaseSound) {
                this.destroy();
                resolve(1);
            });
            _tempSound.play();
        })
    }


    /**
     * 移动程序
     */
    public moveTo(obj, x: number, y: number, duration: number = 500, callback: any = () => { }): Phaser.Tweens.Tween {
        let _tween = this.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets: obj,
            x: x,
            y: y,
            duration: duration,
            ease: "Sine.easeOut",
            onComplete: callback
        })
        return _tween;
    }


    /**
     * 检查做题是否已经结束
     */
    private checkoutTestEnd() {


    }

    /**
     * 做题结束
     */
    private testEnd() {

    }

    /**
     *  successBtnPointerdown 
     */
    private successBtnPointerdown() {
        this.checkoutResult()
            .then(msg => {    //正确
                console.log(msg)
                this.isRight();
            })
            .catch(err => {   //错误
                console.log(err)
                this.isWrong();
            });
    }

    /**
     * 正确的结果处理
     */
    private isRight(): void {
        let nextFuc = () => {
            this.sellingGold = new SellingGold(this, {
                callback: () => {
                    this.sellingGold.golds.destroy();
                    this.setGoldValue(3);
                    this.nextRound();
                }
            });
            this.sellingGold.golds.setDepth(6);
            this.tipsParticlesEmitter.success(() => {
                this.sellingGold.goodJob(3);
            })
        }
    }

    /**
     * 错误的结果处理
     */
    private isWrong(): void {
        this.times += 1;
        if (this.times === 1) {
            this.tryAgin();
        } else if (this.times >= 2) {
            this.ohNo();
        }
    }

    /**
     * 再玩一次
     */
    private tryAgin() {
        this.tipsParticlesEmitter.tryAgain(this.resetStart);
    }

    /**
     * 重置开始状态
     */
    private resetStart() {

    }

    /**
     * 再次错误
     */
    private ohNo() {
        this.setGoldValue(-1);
        this.tipsParticlesEmitter.error(
            this.nextRound,
            this.resetStart
        )
        if (goldValue === 0) {
            setTimeout(() => {
                this.scene.pause();
                alert("啊哦，你又错啦！金币不足，一起去赚金币吧");
            }, 1300)
        }
    }

    /**
     * 下一道题
     */
    private nextRound(): void {
        index += 1;
        if (index > this.ccData.length - 1) {
            window.location.href = CONSTANT.INDEX_URL;
        }
        this.times = 0;
        this.scene.start('Game15PlayScene', {
            data: this.ccData,
            index: index
        });
    }

    /**
     * 判断做题结果是否正确
     */
    private checkoutResult(): Promise<string> {
        let answer: string = "";
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * 设置金币的动作
     */
    private setGoldValue(value: number) {
        goldValue += value;

        this.gold.setText(goldValue);
    }

    /**
     * 检查金币是否为0
     */
    private checkoutGoldValue(): boolean {
        return goldValue < 0 ? true : false;
    }

}

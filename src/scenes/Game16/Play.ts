import 'phaser';
import { Subject } from 'rxjs';
import { Assets, Topic } from '../../interface/Game16';
import { cover, rotateTips, isHit, Vec2, CONSTANT } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Door, IndexText, OrderUI, Blood, TipsReliveParticlesEmitter } from '../../Public/jonny/game16';

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
const offsetIndex = 7;
var index: number; //题目的指针，默认为0


var goldValue: number = 6; //金币的值

export interface Determine {
    isRight: boolean;
    angelBlood: number;
    devilBlood: number;
}

export default class Game16PlayScene extends Phaser.Scene {
    private ccData: Array<Topic> = [];
    //private times: number = 0;  //次数
    private blood2Index: number = 0;
    private blood8Index: number = 0;
    private blood8frame: string = null;
    private blood2frame: string = null;
    //静态开始
    private bgm: Phaser.Sound.BaseSound; //背景音乐
    private btnExit: Button;  //退出按钮
    private btnSound: ButtonMusic; //音乐按钮
    private gold: Gold;
    private blood: Blood;
    //静态结束

    // 动态开始
    private orderUI: OrderUI;
    private door: Door;
    private indexText: IndexText;
    private tipsParticlesEmitter: TipsReliveParticlesEmitter;
    private sellingGold: SellingGold;
    private angelAction: Phaser.GameObjects.Sprite;
    private devilAction: Phaser.GameObjects.Sprite;
    private reliveAction: Phaser.GameObjects.Sprite;

    private angelFloating: Phaser.Tweens.Tween = null;
    private devilFloating: Phaser.Tweens.Tween = null;

    //数据
    private result$: Subject<Determine> = new Subject(); //结果订阅
    private startAnimate$: Subject<string> = new Subject();  //开场动画的订阅


    private layer0: Phaser.GameObjects.Container;

    /**
     * 答题面板,血槽
     */
    private layer1: Phaser.GameObjects.Container;

    /**
     * 大门,文字
     */
    private layer2: Phaser.GameObjects.Container;

    /**
     * UI
     */
    private layer4: Phaser.GameObjects.Container;

    constructor() {
        super({
            key: "Game16PlayScene"
        });
    }

    init(res: { data: any[], index: number }) {
        index = res.index;
        this.ccData = res.data;
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
            cover(this, "Game16", () => {
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
        if (this.layer0.x > 0) {
            this.layer0.x = 0;
        }
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
        this.layer4 = new Phaser.GameObjects.Container(this).setDepth(4);

        this.add.existing(this.layer0);
        this.add.existing(this.layer1);
        this.add.existing(this.layer2);
        this.add.existing(this.layer4);

        this.btnExit = new ButtonExit(this);
        this.btnSound = new ButtonMusic(this);
        this.layer4.add([this.btnExit, this.btnSound]);

        this.gold = new Gold(this, goldValue);   //设置金币
        this.layer4.add([this.gold]);

    }

    /**
     * 创建演员们
     */
    createActors() {
        // create orderUI,blood
        this.orderUI = new OrderUI(this, this.ccData[index].trueWord, this.ccData[index].displayWord);
        this.blood = new Blood(this, this.blood2Index, this.blood8Index);
        this.blood.blood2.visible = false;
        this.blood.blood8.visible = false;
        this.layer1.add([this.orderUI]);


        // create angel's action
        this.angelAction = this.add.sprite(0, 0, "angelAction").setDepth(5).setVisible(false);
        this.anims.create({
            key: "angelKill",
            frames: this.anims.generateFrameNames('angelAction', { prefix: 'angelAction1000', start: 0, end: 12 }),
            frameRate: 12
        });

        // create devil's action
        this.devilAction = this.add.sprite(0, 0, "devilAction").setDepth(5).setVisible(false).setFlipX(true);
        this.anims.create({
            key: "devilKill",
            frames: this.anims.generateFrameNames('devilAction', { prefix: 'devilAction1000', start: 0, end: 9 }),
            frameRate: 12
        });

        // create angel's reliveAction
        this.reliveAction = this.add.sprite(0, 0, 'relive').setDepth(5).setVisible(false);
        this.anims.create({
            key: "angelRelive",
            frames: this.anims.generateFrameNames('relive', { prefix: 'relive', start: 0, end: 25 }),
            frameRate: 25
        });

        // create door
        this.door = new Door(this).initClose();
        this.layer2.add(this.door);

        // create IndexText
        this.indexText = new IndexText(this);
        this.layer2.add(this.indexText);

        //创建用户反馈
        this.tipsParticlesEmitter = new TipsReliveParticlesEmitter(this);
    }

    /**
     * 观察者
     */
    private observableFuc() {
        this.result$.subscribe(async value => {
            if (value.isRight === true && value.devilBlood < offsetIndex) {
                this.blood8Index += 1;
                this.blood.setBlood8(this.blood8Index);
                await this.angelActing();
                this.blood8frame = this.blood.blood8.frame.name;
                this.blood2frame = this.blood.blood2.frame.name;
                this.nextRound();
            } else if (value.isRight === true && this.blood8Index === offsetIndex) {
                this.blood8Index += 1;
                this.blood.setBlood8(this.blood8Index);
                await this.angelActing();
                this.devilFloating.stop();
                this.orderUI.devil.setTexture("civa_devil_03");
                this.sellingGold = new SellingGold(this, {
                    callback: () => {
                        this.sellingGold.golds.destroy();
                        this.setGoldValue(3);
                        this.blood8Index = 0;
                        this.blood.setBlood8(this.blood8Index);
                        if (index === this.ccData.length - 1) {
                            window.location.href = CONSTANT.INDEX_URL;
                        } else {
                            this.blood8frame = "blood80000";
                            this.blood2frame = this.blood.blood2.frame.name;
                            this.nextRound();
                        }
                    }
                });
                this.sellingGold.golds.setDepth(6);
                this.tipsParticlesEmitter.success(() => {
                    this.sellingGold.goodJob(3);
                })
            } else if (value.isRight === false && value.angelBlood === 0) {
                this.blood2Index += 1;
                this.blood.setBlood2(this.blood2Index);
                this.devilActing().then(this.tryAgin.bind(this));
            } else if (value.isRight === false && value.angelBlood === 1) {
                this.blood2Index += 1;
                this.blood.setBlood2(this.blood2Index);
                this.devilActing()
                    .then(() => {
                        this.angelFloating.stop();
                        this.orderUI.angel.setTexture("civa_angle_03");
                    })
                    .then(this.ohNo.bind(this));
            }
        });

        this.startAnimate$.subscribe(async value => {
            console.log(value);
            if (value === "初始化关门后开门") {
                this.door.initClose();
                this.orderUI.show();
                this.blood.show();
                await this.door.open();
            } else if (value === "先关门后开门") {
                await this.door.close();
                this.blood.show();
                this.orderUI.show();
                await this.door.open();
            } else if (value === "初始化开门") {
                this.orderUI.show();
                this.blood.show();
                this.door.initOpen();
            }
        })
    }

    /**
     * 游戏开始
     */
    private async gameStart() {
        //let _index: string = index + 1 < 10 ? "0" + (index + 1) : (index + 1).toString();
        if (index === 0) {
            this.observableFuc();
            this.startAnimate$.next("初始化关门后开门");
        } else if (index !== 0 && index % (offsetIndex + 1) === 0) {
            this.startAnimate$.next("先关门后开门");
        } else {
            this.startAnimate$.next("初始化开门");
        }
        this.angelFloating = this.orderUI.angelFloating();
        this.devilFloating = this.orderUI.devilFloating();
        if (this.blood8frame !== null) {
            this.blood.blood8.setTexture('blood8', this.blood8frame);
        }
        if (this.blood2frame !== null) {
            this.blood.blood2.setTexture('blood2', this.blood2frame);
        }
        this.controls();
    }

    /**
     * 交互事件
     */
    private controls(): void {
        let TorF = (eTarget: Phaser.GameObjects.Image, decided: number) => {
            console.log("执行点击事件");
            this.disableBtnInteractive();
            let _isRight: boolean;
            if (decided === 1) {
                _isRight = this.ccData[index].displayWord === this.ccData[index].trueWord;
            } else {
                _isRight = this.ccData[index].displayWord !== this.ccData[index].trueWord;
            }
            this.result$.next({
                isRight: _isRight,
                angelBlood: this.blood2Index,
                devilBlood: this.blood8Index
            });
        }

        this.orderUI.trueBtn.on("pointerdown", TorF.bind(this, this.orderUI.trueBtn, 1));
        this.orderUI.falseBtn.on("pointerdown", TorF.bind(this, this.orderUI.falseBtn, 0));
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
     * 天使攻击
     */
    public angelActing(): Promise<boolean> {
        this.audioPlay("heavyBoxing");
        this.acting(this.angelAction, this.orderUI.devil.getWorldTransformMatrix().tx, this.orderUI.devil.getWorldTransformMatrix().ty, "angelKill");
        return this.orderUI.beingAttacked(this.orderUI.devil, "civa_devil_03", "civa_devil_02", 10);
    }

    /**
     * 恶魔攻击
     */
    public devilActing(): Promise<boolean> {
        this.audioPlay("defense");
        this.acting(this.devilAction, this.orderUI.angel.getWorldTransformMatrix().tx, this.orderUI.angel.getWorldTransformMatrix().ty, "devilKill");
        return this.orderUI.beingAttacked(this.orderUI.angel, "civa_angle_03", "civa_angle_02", -10);
    }

    /**
     * 天使复活
     */
    public angelRelive(): Promise<boolean> {
        this.audioPlay("angelRelive");
        return this.acting(this.reliveAction, this.orderUI.angel.getWorldTransformMatrix().tx, this.orderUI.angel.getWorldTransformMatrix().ty, "angelRelive");
    }

    /**
     * Action
     */
    private acting(obj: Phaser.GameObjects.Sprite, x: number, y: number, key: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            obj.visible = true;
            obj.setPosition(x, y);
            obj.play(key);
            setTimeout(() => {
                obj.visible = false;
                resolve(true);
            }, 1300);
        });
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
     * 正确的结果处理
     */
    private isRight(): void {


    }

    /**
     * 错误的结果处理
     */
    private isWrong(): void {


    }

    /**
     * 再玩一次
     */
    private tryAgin() {
        this.tipsParticlesEmitter.tryAgain(this.enableBtnInteractive);
    }


    private enableBtnInteractive() {
        this.orderUI.trueBtn.setInteractive();
        this.orderUI.falseBtn.setInteractive();
    }

    private disableBtnInteractive() {
        this.orderUI.trueBtn.disableInteractive();
        this.orderUI.falseBtn.disableInteractive();
    }

    /**
     * 重置开始状态
     */
    private async resetStart() {
        this.enableBtnInteractive();
    }


    /**
     * 再次错误
     */
    private ohNo() {
        let reliveFuc = async () => {   //复活
            await this.angelRelive();
            this.angelFloating.play();
            this.orderUI.angel.setTexture("civa_angle_02");
            this.setGoldValue(-2);
            this.blood2Index = 0;
            this.blood.blood2.setTexture("blood2", "blood20000");
            //this.startAnimate$.next("先关门后开门");
        }


        let changeSingle = () => {   //换一个
            //reliveFuc();
            //this.nextRound();
        }

        let replay = () => {    //再玩一次
            reliveFuc();
            this.resetStart();
        }

        this.tipsParticlesEmitter.error(
            changeSingle,
            replay
        )
        // if (goldValue === 0) {
        //     setTimeout(() => {
        //         this.scene.pause();
        //         alert("啊哦，你又错啦！金币不足，一起去赚金币吧");
        //     }, 1300)
        // }
    }

    /**
     * 销毁组件
     */
    private destroyComponent(): void {
        this.angelFloating.remove();
        this.devilFloating.remove();
    }

    /**
     * 下一道题
     */
    private nextRound() {
        this.destroyComponent();
        index += 1;
        this.scene.start('Game16PlayScene', {
            data: this.ccData,
            index: index
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

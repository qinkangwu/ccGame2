import 'phaser';
import { Subject } from 'rxjs';
import { Assets } from '../../interface/Game15';
import { cover, rotateTips, isHit, Vec2, CONSTANT } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Bg, Carriage, Ship } from '../../Public/jonny/game15/'

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值

interface CarriageStatus {
    myCarriage: Carriage;
    hitShip: Ship;
    msg: string;
}

interface ShipStatus {
    hitShip: Ship;
    msg: string;
}


export interface Determine {
    isRight: boolean;
    wheel: number;
    times: number;
    myCarriage: Carriage;
    ship: Ship;
}

export default class Game15PlayScene extends Phaser.Scene {
    //数据
    private ccData: Array<string> = [];
    private wheel: number = 1;    //第几轮
    private times: number = 0;  //次数
    private ship$: Subject<ShipStatus> = new Subject();
    private carriage$: Subject<CarriageStatus> = new Subject();
    private result1$: Subject<Determine> = new Subject();

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

        this.gold = new Gold(this, goldValue);   //设置金币
        this.layer4.add([this.btnExit, this.btnSound, this.gold]);
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
            this.layer2.add(_carriage);
            this.carriages.push(_carriage);
        })

        //create large carriage
        let largeCarriages = this.ccData.filter(v => v[0].length > 8)
        let lastCarriage = this.carriages[this.carriages.length - 1];
        largeCarriages.forEach((data, index) => {
            let _carriage = new Carriage(this, data[0], (130 + 130 + carriageOffsetX) * 0.5, lastCarriage.y + (index + 1) * carriageOffsetY);
            this.layer2.add(_carriage);
            this.carriages.push(_carriage);
        })


        //create ship
        let shipDatas: string[] = [];
        new Set(this.ccData.map(v => v[1])).forEach(data => {
            shipDatas.push(data);
        })
        let shipPosition = {
            initX: 700,
            offsetX: 112,
            initY: 85,
            offsetY: 130
        }
        shipDatas.forEach((data, index) => {
            let _x = shipPosition.initX + shipPosition.offsetX * Math.cos(Math.PI * Number(index));
            let _y = shipPosition.initY + shipPosition.offsetY * index;
            let _ship = new Ship(this, _x, _y, data);
            this.layer1.add(_ship);
            this.ships.push(_ship);
        });


        //create terminal
        

        //创建用户反馈
        this.tipsParticlesEmitter = new TipsParticlesEmitter(this);
    }

    /**
     * 游戏开始
     */
    private gameStart(): void {
        this.carriageScene();
        this.observableFuc();
    }

    /**
     * 观察者
     */
    private observableFuc() {
        /**
        * 检查货物的状态
        */
        this.carriage$.subscribe(value => {
            console.log(value);
            if (value.msg === "其他货物变淡且自身缩放一次") {
                value.myCarriage.bg.alpha = 1;
                value.myCarriage.bounceAnimate();
                this.carriages
                    .filter(carriage => carriage !== value.myCarriage)
                    .forEach(carriage => {
                        carriage.bg.alpha = 0;
                    })
            } else if (value.msg === "其他货物隐藏") {
                this.carriages
                    .filter(carriage => carriage !== value.myCarriage)
                    .forEach(carriage => {
                        carriage.bg.alpha = 1;
                        carriage.alpha = 0;
                    })
            } else if (value.msg === "全部货物显示") {
                this.carriages
                    .forEach(carriage => {
                        carriage.bg.alpha = 1;
                        carriage.alpha = 1;
                    })
            } else if (value.msg === "自身被吸附进去") {
                value.myCarriage.setPosition(value.hitShip.x, value.hitShip.y);
                value.myCarriage.scaleMin()
                value.hitShip.bounceAnimate();
            } else if (value.msg === "所有货物暂时禁止搬运") {
                this.carriages.forEach(carriage => {
                    carriage.disableInteractive();
                })
            } else if (value.msg === "所有货物都可搬运") {
                console.log("收到消息");
                this.carriages.forEach(carriage => {
                    carriage.setInteractive();
                })
            } else if (value.msg === "回到自己初始化位置") {
                value.myCarriage.isHit = false;
                this.moveTo(value.myCarriage, value.myCarriage.initPosition.x, value.myCarriage.initPosition.y, 500, () => {
                    value.myCarriage.scale = 1;
                });
            }
        });


        /**
         * 检查船的状态 
         */
        this.ship$.subscribe(value => {
            if (value.msg === "所有货船闪烁") {
                this.ships.forEach(ship => {
                    if (!ship.swicthAnimateTween.isPlaying()) {
                        ship.swicthAnimateTween.resume();
                    }
                })
            } else if (value.msg === "被碰撞货船停止闪烁") {
                value.hitShip.swicthAnimateTween.pause();
                value.hitShip.bg.alpha = 1;
            } else if (value.msg === "停止所有货船闪烁") {
                this.ships.forEach(ship => {
                    ship.swicthAnimateTween.pause();
                    ship.bg.alpha = 1;
                })
            }
        })


        /**
         * 检测结果是否正确
         */
        this.result1$.subscribe(
            value => {
                console.log(value);
                if (value.isRight === true && value.wheel === 1) {     //第一轮正确
                    this.isRight(value.wheel,value.ship);
                } else if (value.isRight === false && value.wheel === 1) {
                    this.isWrong(value.wheel, value.myCarriage);
                }
            }
        )
    }

    /**
     * 拖拽货物
     */
    private carriageScene(): void {
        let that = this;

        /**
         * 隐藏所有货物
         */
        let hideCarriage = {
            count: 1,
            fuc: (myCarriage: Carriage) => {
                if (hideCarriage.count === 1) {
                    hideCarriage.count = 0;
                    this.carriages
                        .filter(carriage => carriage !== myCarriage)
                        .forEach(carriage => {
                            carriage.setVisible(false);
                        })
                }

            }
        }

        let carriageHitShip = (myCarriage: Carriage, ship: Ship): boolean => {
            return isHit(myCarriage.syncBounds(), ship.syncBounds());
        }


        /**
         * 拖拽货物的开始
         */
        let carriageDragStart = function (this: Carriage) {
            that.carriage$.next({
                myCarriage: this,
                msg: "其他货物变淡且自身缩放一次",
                hitShip: null
            });
        }

        /**
         * 拖拽货物的过程
         */
        let carriageDragMsgCount = 1;
        //let carriageHitMsgCount = 1;
        let carriageDrag = function (this: Carriage, pointer, dragX, dragY) {
            if (carriageDragMsgCount === 1) {
                that.carriage$.next({
                    myCarriage: this,
                    msg: "其他货物隐藏",
                    hitShip: null
                });
                carriageDragMsgCount = 0;
            }
            that.ship$.next({
                hitShip: null,
                msg: "所有货船闪烁"
            })
            that.ships.forEach(ship => {
                if (carriageHitShip(this, ship)) {
                    that.ship$.next({ hitShip: ship, msg: "被碰撞货船停止闪烁" });
                }
            })
            this.setPosition(dragX, dragY);   //同步坐标
        }


        /**
         * 拖拽货物结束
         */
        let carriageDragEnd = function (this: Carriage) {
            carriageDragMsgCount = 1;
            that.carriage$.next({
                myCarriage: this,
                msg: "全部货物显示",
                hitShip: null
            })

            that.ship$.next({
                hitShip: null,
                msg: "停止所有货船闪烁"
            })

            that.ships.forEach(ship => {
                if (carriageHitShip(this, ship)) {
                    this.isHit = true;
                    that.carriage$.next({
                        myCarriage: this,
                        msg: "自身被吸附进去",
                        hitShip: ship
                    });
                    that.carriage$.next({
                        myCarriage: this,
                        msg: "所有货物暂时禁止搬运",
                        hitShip: ship
                    });
                    that.result1$.next({
                        isRight: that.checkoutResultNo1(this, ship),
                        times: that.times,
                        wheel: that.wheel,
                        myCarriage: this,
                        ship:ship
                    })
                }
            })

            if (!this.isHit) {
                that.carriage$.next({
                    myCarriage: this,
                    msg: "回到自己初始化位置",
                    hitShip: null
                });
            }

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
        // this.checkoutResult()
        //     .then(msg => {    //正确
        //         console.log(msg)
        //         this.isRight();
        //     })
        //     .catch(err => {   //错误
        //         console.log(err)
        //         this.isWrong();
        //     });
    }

    /**
     * 正确的结果处理
     */
    private isRight(wheel: number,ship:Ship): void {
        let nextFuc = () => {
            this.sellingGold = new SellingGold(this, {
                callback: () => {
                    this.sellingGold.golds.destroy();
                    this.setGoldValue(3);
                    this.nextScene(ship);
                    // if (wheel === 1) {
                    //     console.log("next2");
                    // } else {
                    //     console.log("next1");
                    // }
                }
            });
            this.sellingGold.golds.setDepth(6);
            this.tipsParticlesEmitter.success(() => {
                this.sellingGold.goodJob(3);
            })
        }
        nextFuc();
    }

    /**
     * 错误的结果处理
     */
    private isWrong(wheel: number, myCarriage: Carriage = null): void {
        this.times += 1;
        if (this.times === 1) {
            this.tryAgin(myCarriage);
        } else if (this.times >= 2) {
            this.ohNo(myCarriage);
        }
    }

    /**
     * 再玩一次
     */
    private tryAgin(myCarriage: Carriage = null) {
        this.tipsParticlesEmitter.tryAgain(this.resetStart.bind(this, myCarriage));
    }

    /**
     * 重置开始状态
     */
    private resetStart(myCarriage: Carriage = null) {
        if (myCarriage !== null) {
            this.carriage$.next({
                myCarriage: myCarriage,
                hitShip: null,
                msg: "回到自己初始化位置"
            });
            this.carriage$.next({
                myCarriage: null,
                hitShip: null,
                msg: "所有货物都可搬运"
            });
        }
    }

    /**
     * 再次错误
     */
    private ohNo(myCarriage: Carriage) {
        this.setGoldValue(-1);
        this.tipsParticlesEmitter.error(
            this.nextScene,
            this.resetStart.bind(this, myCarriage)
        )
        if (goldValue === 0) {
            setTimeout(() => {
                this.scene.pause();
                alert("啊哦，你又错啦！金币不足，一起去赚金币吧");
            }, 1300)
        }
    }

    /**
     * 下一个场景
     */
    private nextScene(ship:Ship): void {
        this.moveTo(this.layer1, -1024, 0, 2000);
        this.moveTo(this.layer2, -1024, 0, 2000);
        this.moveTo(ship, 1196, 276, 2000);
    }

    /**
     * 下一轮
     */
    private nextRound(): void {
        // index += 1;
        // if (index > this.ccData.length - 1) {
        //     window.location.href = CONSTANT.INDEX_URL;
        // }
        // //this.times = 0;
        // this.scene.start('Game15PlayScene', {
        //     data: this.ccData,
        //     index: index
        // });
    }

    /**
     * 判断第一轮题目是否做对
     */
    private checkoutResultNo1(carriage: Carriage, ship: Ship): boolean {
        let _data = this.ccData.filter(data => data[0] === carriage.name)[0];
        return _data[1] === ship.name;
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

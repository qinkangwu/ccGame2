import 'phaser';
import { } from 'rxjs';
import { cover, rotateTips, isHit, Vec2, CONSTANT ,arrDisorder} from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold, SuccessBtn, TryAginListenBtn } from '../../Public/jonny/components';
import { Game23Data, Assets } from '../../interface/Game23';
import { Basin } from "../../Public/jonny/game23/Basin";
import { Toy } from "../../Public/jonny/game23/Toy";
import { Shooter } from "../../Public/jonny/game23/Shooter";
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
//import { Locomotive, TrainBox, NullTrainBox } from '../../Public/jonny/game11';

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值


export default class Game23PlayScene extends Phaser.Scene {
    private ccData: Array<Game23Data> = [];
    private rightTimes:number = 0; //正确的次数
    private times: number = 0;  //次数

    //静态开始
    private bgm: Phaser.Sound.BaseSound; //背景音乐
    private bg: Phaser.GameObjects.Image; //背景图片 
    private btnExit: Button;  //退出按钮
    private btnSound: ButtonMusic; //音乐按钮
    private gold: Gold;
    private successBtn: SuccessBtn;  //成功提交的按钮
    //静态结束

    //动态开始
    private toys:Array<Toy> = [];  //玩具
    private basins:Array<Basin> = [];    //盆
    private civa:Shooter;
    private tipsParticlesEmitter: TipsParticlesEmitter;
    private sellingGold: SellingGold;

    /**
     * 背景
     */
    private layer0: Phaser.GameObjects.Container;

    /**
     * 玩具 
     */
    private layer1: Phaser.GameObjects.Container;

    /**
    * 盆
    */
    private layer2: Phaser.GameObjects.Container;

    /**
    * civa
    */
    private layer3: Phaser.GameObjects.Container;

    /**
     * UI
     */
    private layer4: Phaser.GameObjects.Container;

    constructor() {
        super({
            key: "Game23PlayScene"
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
        this.firstCreate();  //test
        if (index === 0) {
            this.scene.pause();
            rotateTips.init();
            this.firstCreate();
            cover(this, "Game23", () => {
                this.gameStart();
            });
            //cover()
            //this.gameStart();
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
        this.layer3 = new Phaser.GameObjects.Container(this).setDepth(3);
        this.layer4 = new Phaser.GameObjects.Container(this).setDepth(4);

        this.add.existing(this.layer0);
        this.add.existing(this.layer1);
        this.add.existing(this.layer2);
        this.add.existing(this.layer3);
        this.add.existing(this.layer4);


        this.btnExit = new ButtonExit(this);
        this.btnSound = new ButtonMusic(this);
        this.layer4.add([this.btnExit, this.btnSound]);

        this.bg = new Phaser.GameObjects.Image(this, 0, 0, "bg_all").setPosition(W * 0.5, H * 0.5);
        this.layer1.add(this.bg);

        this.gold = new Gold(this, goldValue);   //设置金币
        this.layer4.add([this.gold]);
    }

    /**
     * 创建演员们
     */
    createActors(): void {
        //创建用户反馈
        this.tipsParticlesEmitter = new TipsParticlesEmitter(this);

        //创建玩具
        let offsetX = 314 - 136;
        let offsetY = 337 - 145;
        let ccDataClone = this.ccData.concat(this.ccData);
        ccDataClone = arrDisorder(ccDataClone);
        ccDataClone.forEach((v,i)=>{
            let initX = 136;
            let initY = 145;
            let _ix = i%5;
            let _iy = Math.floor(i/5);
            let x = initX + offsetX*_ix;
            let y = initY + offsetY*_iy;
            let toy = new Toy(this,x,y,v.questionContent,v.questionContent).init();
            this.toys.push(toy);
            this.layer1.add(toy);
        });

        //创建盆
        this.ccData.forEach((v,i)=>{
            let basin = new Basin(this,v.questionContent).init();
            this.basins.push(basin);
            this.layer2.add(basin);
        })

        this.civa = new Shooter(this);
        this.layer3.add(this.civa);
    }

    /**
     * 游戏开始
     */
    private async gameStart() {
        let that = this;
        let toyPointerDown = function (toy:Toy){
            this.checkoutResult(toy)
            .then(async value => {    //正确
                console.log(value);
                that.rightTimes+=value;
                if(value===1&&that.rightTimes===1){
                  toy.disableInteractive(); 
                  that.audioPlay("successMp3");
                  await that.basins[index].move(toy.x);
                  that.audioPlay(toy.name + "Sound");
                  toy.isRight(that.rightTimes,that.basins[index]);
                }else if(value===1&&that.rightTimes===2){
                  toy.disableInteractive(); 
                  that.audioPlay("successMp3");
                  await that.basins[index].move(toy.x);
                  that.audioPlay(toy.name + "Sound");
                  toy.isRight(that.rightTimes,that.basins[index]);
                }else if(value===0){
                    toy.isWrong();
                }
            })
        }

        let toyShow:Promise<number>[] = this.toys.map((toy,i)=>{
            let delay = 300*i;
            toy.on("pointerdown",toyPointerDown.bind(this,toy));
            return toy.show(delay);
        })

        await Promise.all(toyShow);
        this.basins[index].show();

        
    }

    /**
     * 判断做题结果是否正确
     */
    private checkoutResult(toy:Toy): Promise<number> {
        let answer:boolean = toy.name === this.basins[index].name;
        console.log(toy.name,this.basins[index].name);
        return new Promise(resolve => {
            if(answer){
                resolve(1);
            }else{
                resolve(0);
            }
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

        this.successBtn.setAlpha(0);
        this.successBtn.interactive = true;
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
        this.scene.start('Game23PlayScene', {
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

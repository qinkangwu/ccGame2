import 'phaser';
import { Subject} from 'rxjs';
import { Assets, Topic } from '../../interface/Game16';
import { cover, rotateTips, isHit, Vec2, CONSTANT } from '../../Public/jonny/core';
import { Button, ButtonMusic, ButtonExit, SellingGold, Gold } from '../../Public/jonny/components';
import TipsParticlesEmitter from '../../Public/TipsParticlesEmitter';
import { Door,IndexText,OrderUI,Blood} from '../../Public/jonny/game16';

const vol = 0.3; //背景音乐的音量
const W = 1024;
const H = 552;
var index: number; //题目的指针，默认为0
var goldValue: number = 3; //金币的值

export interface Determine {
    isRight: boolean;
    times: number;
}




export default class Game16PlayScene extends Phaser.Scene {
    private ccData: Array<Topic> = [];
    private times: number = 0;  //次数

    //静态开始
    private bgm: Phaser.Sound.BaseSound; //背景音乐
    private btnExit: Button;  //退出按钮
    private btnSound: ButtonMusic; //音乐按钮
    private gold: Gold;
    private blood:Blood;
    //静态结束

    // 动态开始
    private orderUI:OrderUI;
    private door: Door;
    private indexText:IndexText;
    private tipsParticlesEmitter: TipsParticlesEmitter;
    private sellingGold: SellingGold;
    private angelAction:Phaser.GameObjects.Sprite;
    private devilAction:Phaser.GameObjects.Sprite;

    //数据
    private result$:Subject<Determine> = new Subject (); //结果订阅


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
        this.orderUI = new OrderUI(this,this.ccData[index].trueWord,this.ccData[index].displayWord);
        this.blood = new Blood(this);
        this.blood.visible = false;
        this.layer1.add([this.orderUI,this.blood]);


        // create angel's action
        this.angelAction = this.add.sprite(0,0,"angelAction").setDepth(5).setVisible(false);
        this.anims.create({
            key:"angelKill",
            frames:this.anims.generateFrameNames('angelAction',{ prefix:'angelAction1000',start:0,end:12}),
            frameRate:12
        });

        // create devil's action
        this.devilAction = this.add.sprite(0,0,"devilAction").setDepth(5).setVisible(false);
        this.anims.create({
            key:"devilKill",
            frames:this.anims.generateFrameNames('devilAction',{ prefix:'devilAction1000',start:0,end:9}),
            frameRate:12
        });

        // create door
        this.door = new Door(this);
        this.layer2.add(this.door);

        // create IndexText
        this.indexText = new IndexText(this);
        this.layer2.add(this.indexText);

        //创建用户反馈
        this.tipsParticlesEmitter = new TipsParticlesEmitter(this);
    }

    /**
     * 观察者
     */
    private observableFuc() {
        this.result$.subscribe(value=>{
            if(value.isRight===true){
                //this.angelActing();
                this.isRight();
            }else if(value.isRight===false){
                this.isWrong();
                //this.devilActing();
            }
        });
    }

    /**
     * 游戏开始
     */
    private async gameStart(){
        let _index:string = index + 1  < 10 ? "0" + (index+1) : (index + 1).toString();
        await this.door.close();
        await this.indexText.show(_index);
        this.orderUI.show();
        this.indexText.hide();
        this.blood.visible = true;
        await this.door.open();
        this.observableFuc();

        // this.T$ = fromEvent(this.orderUI.trueBtn,"pointerdown");
        // this.F$ = fromEvent(this.orderUI.falseBtn,"pointerdown");



        //this.orderUI.falseBtn.on("pointerdown",);
        this.controls();
    }

    /**
     * 交互事件
     */
    private controls():void{
        let TorF = (decided:number)=>{
            this.orderUI.trueBtn.disableInteractive(); 
            this.orderUI.falseBtn.disableInteractive(); 
            let _isRight:boolean;
            if(decided===1){
               _isRight = this.ccData[index].displayWord===this.ccData[index].trueWord;
            }else{
               _isRight = this.ccData[index].displayWord!==this.ccData[index].trueWord;
            }
            this.result$.next({
                isRight:_isRight,
                times:this.times
            });
        }


        this.orderUI.trueBtn.on("pointerdown",TorF.bind(this,1));
        this.orderUI.falseBtn.on("pointerdown",TorF.bind(this,0));
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
    public angelActing():Promise<boolean>{
        this.audioPlay("heavyBoxing");
        return this.acting(this.angelAction,this.orderUI.devil.getWorldTransformMatrix().tx,this.orderUI.devil.getWorldTransformMatrix().ty,"angelKill");
    }

    /**
     * 恶魔攻击
     */
    public devilActing():Promise<boolean>{
        this.audioPlay("defense");
        return this.acting(this.devilAction,this.orderUI.angel.getWorldTransformMatrix().tx,this.orderUI.angel.getWorldTransformMatrix().ty,"devilKill");
    }

    /**
     * 攻击
     */
    private acting(obj:Phaser.GameObjects.Sprite,x:number,y:number,key:string):Promise<boolean>{
        return new Promise<boolean>(resolve=>{
            obj.visible = true;
            obj.setPosition(x,y);
            obj.play(key);
            setTimeout(()=>{
                resolve(true);
            },1300);
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

        this.angelActing().then(nextFuc);
    }

    /**
     * 错误的结果处理
     */
    private isWrong(): void {
        let nextFuc = ()=>{
            this.times += 1;
            if (this.times === 1) {
                this.tryAgin();
            } else if (this.times >= 2) {
                this.ohNo();
            }
        }
       
        this.devilActing().then(nextFuc);
       
    }

    /**
     * 再玩一次
     */
    private tryAgin() {
        this.tipsParticlesEmitter.tryAgain(this.resetStart);
        this.orderUI.trueBtn.setInteractive(); 
        this.orderUI.falseBtn.setInteractive(); 
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
        this.scene.start('Game16PlayScene', {
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

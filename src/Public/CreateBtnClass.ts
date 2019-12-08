/**
 * @author       Qin Kangwu 
 * @copyright    2019 civaonline.cn
 */

import "phaser";
import { config } from "../interface/CreateBtnClassInt";

const W = 1024;
const H = 552;

/**
 * @class CreateBtnClass 按钮公共组件
 * @param scene 当前场景
 * @param config 配置对象--属性参照interface
 */
export default class CreateBtnClass {
    private scene ;
    private config ;
    private bgmAnims : Phaser.Tweens.Tween;
    private bgmFlag : boolean = true ; //音乐开关
    public playBtn : Phaser.GameObjects.Image; //播放音频按钮
    public recordStartBtn : Phaser.GameObjects.Image; //录音开始按钮
    public recordEndBtn : Phaser.GameObjects.Image; //录音结束按钮
    private recordGraphics : Phaser.GameObjects.Graphics ; //停止录音进度条绘制对象
    private timerObj : Phaser.Tweens.Tween; //定时器
    public playRecordBtn : Phaser.GameObjects.Image; //播放录音按钮
    private previewBtn : Phaser.GameObjects.Image; //返回上一步按钮
    private comment : Phaser.GameObjects.Image; //返回上一步按钮
    private timerNum : object = {
      d : 0
    }; //进度条角度
    private recordStartAnims : Phaser.Tweens.Tween; //录音开始按钮动画引用
    constructor(scene,config : config){
        this.scene = scene;
        this.config = config;
        this.loadImg();
    }

    private init () : void {
        if(this.scene.musicBtn) return;
        this.scene.backToListBtn = this.scene.add.image(55, 55,'icons2','btn_exit.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60 ,60)
        .setInteractive()
        .setData('isBtn',true);
        this.scene.musicBtn = this.scene.add.image(W - 55,55,'icons2','btn_play2.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60,60)
        .setInteractive()
        .setData('isBtn',true);
        this.config.playBtnCallback && (this.playBtn = this.scene.add.image(this.config.playBtnPosition && this.config.playBtnPosition.x || W / 2 - 150, this.config.playBtnPosition && this.config.playBtnPosition.y || H - 80 , 'icons2' , 'btn_last2.png')
        .setDisplaySize(60 , 60)
        .setOrigin(.5)
        .setAlpha(this.config.playBtnPosition && this.config.playBtnPosition.alpha || 0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true));
        this.config.recordStartCallback && (this.recordStartBtn = this.scene.add.image(W / 2, H - 80 , 'publicRecordBtn')
        .setDisplaySize(110, 110)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true));
        this.config.recordEndCallback && (this.recordEndBtn = this.scene.add.image(W / 2, H - 80 , 'recordIcon')
        .setDisplaySize(110 , 110 )
        .setAlpha(0)
        .setInteractive()
        .setData('_s',true));
        this.config.playRecordCallback && (this.playRecordBtn = this.scene.add.image(W / 2 + 150 , H - 80 , 'icons2' , 'btn_last.png')
        .setDisplaySize(60  , 60 )
        .setOrigin(.5)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true));
        this.config.previewCallback && (this.previewBtn = this.scene.add.image(this.config.previewPosition.x || W - 55 , this.config.previewPosition.y || H - 55 , 'previewBtn')
        .setDisplaySize(60  , 60 )
        .setOrigin(.5)
        .setAlpha(this.config.previewPosition.alpha || .6)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',this.config.previewPosition._s)
        )
        this.config.commentCallback && (this.comment = this.scene.add.image(W - 55 , H - 55 , 'game10icons2','btn_tishi.png').setOrigin(.5).setInteractive().setData('isBtn',true).setData('_s',true));
        this.bgmAnims = this.scene.tweens.add({
            targets : this.scene.musicBtn,
            duration : 2000,
            repeat : -1,
            angle : 360,
        });
        this.bindEventHandle();
    }

    public startBtnAnimsShow() : void {
      this.recordStartAnims = this.scene.tweens.add({
        targets : this.recordStartBtn,
        displayWidth : 120,
        displayHeight : 120,
        ease : 'Sine.easeInOut',
        duration : 300,
        repeat : -1,
        yoyo : true
      });
    }

    public startBtnAnimsHide() : void {
      this.recordStartAnims && this.recordStartAnims.stop();
      this.recordStartAnims && (this.recordStartAnims = null);
      this.recordStartBtn.displayHeight = 110;
      this.recordStartBtn.displayWidth = 110;
    }

    private drawArc () : void {
      //绘制进度条
      this.clearArc();
      this.recordGraphics = this.scene.add.graphics();
      this.recordGraphics.depth = 100;
      this.recordGraphics.lineStyle(9,0xffffff,1);
      this.recordGraphics.beginPath();
      //@ts-ignore
      this.recordGraphics.arc(this.recordEndBtn.x,this.recordEndBtn.y,52,Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(this.timerNum.d ++ ),false);
      this.recordGraphics.strokePath();
    }

    private clearArc () : void {
      this.recordGraphics && this.recordGraphics.clear();
      this.recordGraphics && this.recordGraphics.destroy();
      this.recordGraphics = null;
      //@ts-ignore
      if(this.timerNum.d >= 360 ){
        this.recordEnd.call(this);
      }
    }

    private bindEventHandle () : void {
        this.scene.input.on('pointerdown',this.globalClickHandle.bind(this));
        this.scene.input.on('gameobjectover',this.gameOverHandle.bind(this));
        this.scene.input.on('gameobjectout',this.gameOutHandle.bind(this));
        this.scene.musicBtn.on('pointerdown',this.switchMusic.bind(this,this.bgmFlag));
        this.scene.backToListBtn.on('pointerdown',this.backToListHandle.bind(this));
        this.config.recordStartCallback && this.recordStartBtn.on('pointerdown',this.recordStart.bind(this));
        this.config.playBtnCallback && this.playBtn.on('pointerdown',this.config.playBtnCallback.bind(this.scene));
        this.config.recordEndCallback && this.recordEndBtn.on('pointerdown',this.recordEnd.bind(this));
        this.config.playRecordCallback && this.playRecordBtn.on('pointerdown',this.config.playRecordCallback.bind(this.scene));
        this.config.previewCallback && this.previewBtn.on('pointerdown',this.config.previewCallback.bind(this.scene));
        this.config.commentCallback && this.comment.on('pointerdown',this.config.commentCallback.bind(this.scene));
    }

    private recordEnd () : void {
      this.config.recordEndCallback.call(this.config.recordScope || this.scene);
      this.recordEndBtn.alpha = 0;
      this.recordEndBtn.depth = -1;
      this.recordStartBtn.alpha = 1;
      this.recordStartBtn.depth = 1;
      this.timerObj && this.timerObj.stop();
      this.recordGraphics && this.recordGraphics.clear();
      this.recordGraphics && (this.recordGraphics = null);
      this.startBtnAnimsHide(); //停止录音按钮动画效果
    }

    private recordStart () : void {
      this.recordEndBtn.alpha = 1;
      this.recordEndBtn.depth = 1;
      this.recordStartBtn.alpha = 0;
      this.recordStartBtn.depth = -1;
      //@ts-ignore
      this.timerNum.d = 0;
      this.drawArc();
      this.timerObj && this.timerObj.remove();
      this.timerObj = this.scene.tweens.add({
        targets : this.timerNum,
        d : 360,
        duration : 3000,
        onUpdate : this.drawArc.bind(this),
        onComplete : ()=>{
          this.recordGraphics && this.recordGraphics.clear();
          this.recordGraphics && this.recordGraphics.destroy();
          this.recordGraphics && (this.recordGraphics = null);
        }
      })
      this.config.recordStartCallback.call(this.config.recordScope || this.scene)
    }

    private backToListHandle() : void {
        //返回游戏列表
        window.location.href = 'https://civagame.civaonline.cn:8888'
    }

    private switchMusic () : void {
        //开起关闭背景音乐
        this.bgmFlag = !this.bgmFlag;
        this.bgmFlag && this.bgmAnims.resume() || this.bgmAnims.pause();
        this.bgmFlag && this.config.bgm.resume() || this.config.bgm.pause();
        this.bgmFlag && this.scene.musicBtn.setFrame('btn_play2.png') || this.scene.musicBtn.setFrame('btn_play.png');
        !this.bgmFlag && (this.scene.musicBtn.angle = 0);
        this.scene.musicBtn.alpha = 1;
      }

    private gameOutHandle (...args) : void {
        let obj : object = args[1];
        if(!obj) return;
        //@ts-ignore
        let isBtn : boolean = obj.getData('isBtn');
        //@ts-ignore
        let _s : boolean = obj.getData('_s');
        if(!isBtn || _s) return;
        //@ts-ignore
        obj.alpha = .6;
      }

    private globalClickHandle (...args) : void {
        //点击按钮缩放
        let obj : object = args[1][0];
        if(!obj) return;
        //@ts-ignore
        let isBtn : boolean = obj.getData('isBtn');
        if(!isBtn) return;
        //@ts-ignore
        let _s : boolean = obj.getData('_s');
        this.playMusic('clickMp3');
        this.scene.tweens.add({
            targets : obj,
            scaleX : 1.2,
            scaleY : 1.2,
            alpha : 1,
            duration : 200,
            ease : 'Sine.easeInOut',
            onComplete : ()=>{
                this.scene.tweens.add({
                    targets : obj,
                    scaleX : 1,
                    scaleY : 1,
                    duration : 200,
                    ease : 'Sine.easeInOut',
                })
            }
        });
        !_s && this.scene.tweens.add({
          targets : obj,
          delay : 3000,
          alpha : .6,
          ease: 'Sine.easeInOut',
          duration : 500
        })
    }

    private gameOverHandle(...args) : void {
        let obj : object = args[1];
        if(!obj) return;
        //@ts-ignore
        let isBtn : boolean = obj.getData('isBtn');
        if(!isBtn) return;
        //@ts-ignore
        obj.alpha = 1;
        this.scene.tweens.add({
          targets : obj,
          scaleX : 1.2,
          scaleY : 1.2,
          duration : 200,
          ease : 'Sine.easeInOut',
          onComplete : ()=>{
            this.scene.tweens.add({
              targets : obj,
              scaleX : 1,
              scaleY : 1,
              duration : 200,
              ease : 'Sine.easeInOut',
            })
          }
        })
      }

    private playMusic(sourceKey : string) : void {
        //播放音频
        let mp3 : Phaser.Sound.BaseSound = this.scene.sound.add(sourceKey);
        mp3.play();
    }

    private loadImg () : void {
        this.scene.load.multiatlas('icons2','assets/Game7/imgsJson2.json','assets/Game7');
        this.scene.load.image('previewBtn','assets/Game8/previewBtn.png');
        this.scene.load.image('publicRecordBtn','assets/commonUI/btn_record.png');
        this.scene.load.audio('clickMp3','assets/Game5/click.mp3');
        this.scene.load.on('complete',this.init.bind(this))
        this.scene.load.start();
    }


}

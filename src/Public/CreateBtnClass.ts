import { config } from "../interface/CreateBtnClassInt";

/**
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
    private timerNum : object = {
      d : 360
    }; //进度条角度
    constructor(scene,config : config){
        this.scene = scene;
        this.config = config;
        this.loadImg();
    }

    private init () : void {
        this.scene.backToListBtn = this.scene.add.image(55, 55,'icons2','btn_exit.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60 ,60)
        .setInteractive()
        .setData('isBtn',true);
        this.scene.musicBtn = this.scene.add.image(window.innerWidth - 60,55,'icons2','btn_play2.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60,60)
        .setInteractive()
        .setData('isBtn',true);
        this.playBtn = this.scene.add.image(window.innerWidth / 2 - 150, window.innerHeight - 80 , 'icons2' , 'btn_last2.png')
        .setDisplaySize(60 , 60)
        .setOrigin(.5)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true);
        this.recordStartBtn = this.scene.add.image(window.innerWidth / 2, window.innerHeight - 80 , 'icons2' , 'btn_luyin2.png')
        .setDisplaySize(110, 110)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true);
        this.recordEndBtn = this.scene.add.image(window.innerWidth / 2, window.innerHeight - 80 , 'recordIcon')
        .setDisplaySize(110 , 110 )
        .setAlpha(0)
        .setInteractive()
        .setData('_s',true);
        this.playRecordBtn = this.scene.add.image(window.innerWidth / 2 + 150 , window.innerHeight - 80 , 'icons2' , 'btn_last.png')
        .setDisplaySize(60  , 60 )
        .setOrigin(.5)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true);
        this.bgmAnims = this.scene.tweens.add({
            targets : this.scene.musicBtn,
            duration : 2000,
            repeat : -1,
            angle : 360,
        });
        this.bindEventHandle();
    }

    private drawArc () : void {
      //绘制进度条
      this.clearArc();
      this.recordGraphics = this.scene.add.graphics();
      this.recordGraphics.depth = 100;
      this.recordGraphics.lineStyle(9,0xffffff,1);
      this.recordGraphics.beginPath();
      //@ts-ignore
      this.recordGraphics.arc(this.recordEndBtn.x,this.recordEndBtn.y,52,Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(this.timerNum.d -- ),false);
      this.recordGraphics.strokePath();
    }

    private clearArc () : void {
      this.recordGraphics && this.recordGraphics.clear();
      this.recordGraphics && this.recordGraphics.destroy();
      this.recordGraphics = null;
      //@ts-ignore
      if(this.timerNum.d <= 0 ){
        this.config.recordEndCallback.call(this.config.recordScope || this.scene);
      }
    }

    private bindEventHandle () : void {
        this.scene.input.on('pointerdown',this.globalClickHandle.bind(this));
        this.scene.input.on('gameobjectover',this.gameOverHandle.bind(this));
        this.scene.input.on('gameobjectout',this.gameOutHandle.bind(this));
        this.scene.musicBtn.on('pointerdown',this.switchMusic.bind(this,this.bgmFlag));
        this.scene.backToListBtn.on('pointerdown',this.backToListHandle.bind(this));
        this.recordStartBtn.on('pointerdown',this.recordStart.bind(this));
        this.playBtn.on('pointerdown',this.config.playBtnCallback.bind(this.scene));
        this.recordEndBtn.on('pointerdown',this.recordEnd.bind(this));
        this.playRecordBtn.on('pointerdown',this.config.playRecordCallback.bind(this.scene));
    }

    private recordEnd () : void {
      this.config.recordEndCallback.call(this.config.recordScope || this.scene)
      this.timerObj && this.timerObj.stop();
      this.recordGraphics.destroy();
    }
    
    private recordStart () : void {
      this.recordEndBtn.alpha = 1;
      this.recordEndBtn.depth = 1;
      this.recordStartBtn.alpha = 0;
      this.recordStartBtn.depth = -1;
      //@ts-ignore
      this.timerNum.d = 360;
      this.drawArc();
      this.timerObj && this.timerObj.remove();
      this.timerObj = this.scene.tweens.add({
        targets : this.timerNum,
        d : 0,
        duration : 3000,
        onUpdate : this.drawArc.bind(this)
      })
      this.config.recordStartCallback.call(this.config.recordScope || this.scene)
    }

    private backToListHandle() : void {
        //返回游戏列表
        window.location.href = window.location.origin;
    }

    private switchMusic () : void {
        //开起关闭背景音乐
        this.bgmFlag = !this.bgmFlag;
        this.bgmFlag && this.bgmAnims.resume() || this.bgmAnims.pause();
        this.bgmFlag && this.config.bgm.resume() || this.config.bgm.pause();
        this.bgmFlag && this.scene.musicBtn.setFrame('btn_play2.png') || this.scene.musicBtn.setFrame('btn_play.png');
        !this.bgmFlag && (this.scene.musicBtn.angle = 0); 
        this.scene.musicBtn.alpha = 1;
        this.scene.tweens.add({
          targets : this.scene.musicBtn,
          delay : 3000,
          alpha : .6,
          ease: 'Sine.easeInOut',
          duration : 500
        })
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
        this.scene.load.audio('clickMp3','assets/Game5/click.mp3');
        this.scene.load.on('complete',this.init.bind(this))
        this.scene.load.start();
    }


}
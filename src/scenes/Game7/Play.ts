import 'phaser';
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';

const scaleX : number = window.innerWidth / 1024;
const scaleY : number = window.innerHeight / 552;

export default class Game7PlayScene extends Phaser.Scene {
    private machine : Phaser.GameObjects.Image ; //机器主体
    private handle : Phaser.GameObjects.Sprite ; //手柄
    private backToListBtn : Phaser.GameObjects.Image; //返回列表按钮
    private musicBtn : Phaser.GameObjects.Image; //背景音乐按钮
    private goldIcon : Phaser.GameObjects.Image; //金币数量
    private goldText : Phaser.GameObjects.Text; //金币文本
    private playBtn : Phaser.GameObjects.Image; //播放音频按钮
    private recordStartBtn : Phaser.GameObjects.Image; //录音开始按钮
    private playRecordBtn : Phaser.GameObjects.Image; //播放录音按钮
    private bgmAnims : Phaser.Tweens.Tween; //背景音乐旋转动画
    private bgmFlag : boolean = true ; //音乐开关
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private recordEndBtn : Phaser.GameObjects.Image; //录音结束按钮
    private wordsArr : string[] = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']; //基础单词随机组合数组
    private rec ; //录音对象
    constructor() {
      super({
        key: "Game7PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      this.createBgi(); //背景图
      this.createMachine(); //创建机器
      this.createBtn(); //创建按钮
      this.createBgm(); //背景音乐
      this.createMask(); //创建遮罩层
    }

    private createMask () : void {
      //创建开始游戏遮罩
      let graphicsObj : Phaser.GameObjects.Graphics = this.add.graphics();
      graphicsObj.fillStyle(0x000000,.5);
      graphicsObj.fillRect(0,0,window.innerWidth,window.innerHeight).setDepth(1);
      let mask : Phaser.GameObjects.Image = this.add.image(window.innerWidth / 2, window.innerHeight / 2 , 'mask').setDepth(100);
      let zoneObj : Phaser.GameObjects.Zone = this.add.zone(window.innerWidth / 2 - 104.5,window.innerHeight / 2 + 138 ,209 , 53 ).setOrigin(0).setInteractive();
      let that : Game7PlayScene = this;
      zoneObj.on('pointerdown',function () {
        //点击开始游戏注销组件
        zoneObj.destroy();
        graphicsObj.destroy();
        mask.destroy();
        that.initEmitHandle(); //初始化事件
        that.handleAnims(); //初始化动画
      });
    }

    private render (data : []) : void {
      //渲染摇摇机
      
    }
    

    private createBtn () : void {
      //创建按钮
      this.backToListBtn = this.add.image(25 + (30 * scaleX), 25 + (30 * scaleY),'icons2','btn_exit.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60 * scaleX,60 * scaleY)
        .setInteractive()
        .setData('isBtn',true);
      this.musicBtn = this.add.image(window.innerWidth - 30 - (30 * scaleX),25 + (30 * scaleY),'icons2','btn_play2.png')
        .setOrigin(.5)
        .setAlpha(.6)
        .setDisplaySize(60 * scaleX,60 * scaleY)
        .setInteractive()
        .setData('isBtn',true);
      this.goldIcon = this.add.image(25 + (30 * scaleX),window.innerHeight - 25 - (30 * scaleY),'icons2','civa_gold.png')
        .setOrigin(.5)
        .setDisplaySize(60 * scaleX,60 * scaleY)
        .setInteractive()
      this.goldText = this.add.text(this.goldIcon.x + (13 * scaleX),this.goldIcon.y + (16 * scaleY),'99',{
        font: 'Bold 14px Arial Rounded MT',
        fill : '#fff',
      }).setOrigin(.5);
      this.playBtn = this.add.image(window.innerWidth / 2 - (55 * scaleX + 65 + (30 * scaleX)), window.innerHeight - 50 - (30 * scaleY) , 'icons2' , 'btn_last2.png')
        .setDisplaySize(60 * scaleX , 60 * scaleY)
        .setOrigin(.5)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true);
      this.recordStartBtn = this.add.image(window.innerWidth / 2, window.innerHeight - (55 * scaleY + 25) , 'icons2' , 'btn_luyin2.png')
        .setDisplaySize(110 * scaleX , 110 * scaleY)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true);
      this.recordEndBtn = this.add.image(window.innerWidth / 2, window.innerHeight - (55 * scaleY + 25) , 'icons2' , 'btn_luyin.png')
        .setDisplaySize(110 * scaleX , 110 * scaleY)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true);
      this.playRecordBtn = this.add.image(window.innerWidth / 2 + (55 * scaleX + 65 + (30 * scaleX)) , window.innerHeight - 50 - (30 * scaleY) , 'icons2' , 'btn_last.png')
        .setDisplaySize(60 * scaleX , 60 * scaleY)
        .setOrigin(.5)
        .setAlpha(0)
        .setInteractive()
        .setData('isBtn',true)
        .setData('_s',true);
      this.bgmAnims = this.tweens.add({
        targets : this.musicBtn,
        duration : 2000,
        repeat : -1,
        angle : 360,
      })
    }

    private handleClick () : void {
      //点击摇杆
      this.handle.play('begin');
      this.tweens.add({
        targets : [this.playBtn,this.recordStartBtn,this.playRecordBtn],
        alpha : 1,
        duration : 500,
        ease : 'Sine.easeInOut',
      })
    }

    private handleAnims () : void {
      //摇杆切换frame
      this.anims.create({
        key : 'begin',
        frames : this.anims.generateFrameNames('icons',{start : 0 , end : 3 , zeroPad: 0 , prefix : 'anims' , suffix : '.png' }),
        frameRate : 12,
        repeat : 0,
        yoyo : true
      })
    }
    
    private initEmitHandle () : void {
      //绑定事件
      this.handle.on('pointerdown',this.handleClick.bind(this));
      this.input.on('pointerdown',this.globalClickHandle.bind(this));
      this.input.on('gameobjectover',this.gameOverHandle.bind(this));
      this.input.on('gameobjectout',this.gameOutHandle.bind(this));
      this.musicBtn.on('pointerdown',this.switchMusic.bind(this,this.bgmFlag));
      this.backToListBtn.on('pointerdown',this.backToListHandle.bind(this));
      this.recordStartBtn.on('pointerdown',this.recordStartHandle.bind(this));
      this.recordEndBtn.on('pointerdown',this.recordEndHandle.bind(this));
    }

    private recordEndHandle() : void {
      //录音结束
      this.recordEndBtn.alpha = 0;
      this.recordStartBtn.alpha = 1;
      this.rec && this.rec.stop((blob,duration)=>{
        this.rec.close();
        let files : File = new File([blob],'aaa.wav',{
          type : blob.type
        })

        
      },(msg)=>{
        console.log('录音失败' + msg);
      })
    }

    private recordStartHandle() : void {
      //录音开始
      //@ts-ignore
      this.rec = this.rec || window.Recorder({
        type : 'wav'
      });
      this.rec.open(()=>{
        this.recordEndBtn.alpha = 1;
        this.recordStartBtn.alpha = 0;
        this.rec.start();
      })
    }

    private backToListHandle() : void {
      //返回游戏列表
      window.location.href = window.location.origin;
    }

    private switchMusic () : void {
      //开起关闭背景音乐
      this.bgmFlag = !this.bgmFlag;
      this.bgmFlag && this.bgmAnims.resume() || this.bgmAnims.pause();
      this.bgmFlag && this.bgm.resume() || this.bgm.pause();
      this.bgmFlag && this.musicBtn.setFrame('btn_play2.png') || this.musicBtn.setFrame('btn_play.png');
      !this.bgmFlag && (this.musicBtn.angle = 0); 
      this.musicBtn.alpha = 1;
      this.tweens.add({
        targets : this.musicBtn,
        delay : 3000,
        alpha : .6,
        ease: 'Sine.easeInOut',
        duration : 500
      })
    }

    private globalClickHandle (...args) : void {
      //点击按钮缩放
      let obj : object = args[1][0];
      //@ts-ignore
      // if(!obj || !obj.getData('playVideo')){
      //   this.clearVideoFrameHandle();  //隐藏视频
      // }
      if(!obj) return;
      //@ts-ignore
      let isBtn : boolean = obj.getData('isBtn');
      if(!isBtn) return;
      this.playMusic('clickMp3');
      this.tweens.add({
        targets : obj,
        scaleX : 1.2,
        scaleY : 1.2,
        alpha : 1,
        duration : 200,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.tweens.add({
            targets : obj,
            scaleX : 1,
            scaleY : 1,
            duration : 200,
            ease : 'Sine.easeInOut',
          })
        }
      })

    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private gameOverHandle(...args) : void {
      let obj : object = args[1];
      if(!obj) return;
      //@ts-ignore
      let isBtn : boolean = obj.getData('isBtn');
      if(!isBtn) return;
      //@ts-ignore
      obj.alpha = 1;
      this.tweens.add({
        targets : obj,
        scaleX : 1.2,
        scaleY : 1.2,
        duration : 200,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.tweens.add({
            targets : obj,
            scaleX : 1,
            scaleY : 1,
            duration : 200,
            ease : 'Sine.easeInOut',
          })
        }
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

    private createBgi () : void {
      //背景
      this.add.image(0,0,'game7Bgi').setDisplaySize(window.innerWidth,window.innerHeight).setOrigin(0);
    }

    private createMachine () : void {
      //创建机器
      this.machine = this.add.image(window.innerWidth / 2 , 0 , 'machine').setOrigin(.5,0).setDisplaySize(794 * scaleX,513 * scaleY);
      this.handle = this.add.sprite(
        this.machine.x + (this.machine.width * scaleX / 2) - (window.innerWidth * 0.08) , 
        this.machine.y + (this.machine.height * scaleY / 2 ),
        'icons',
        'anims1.png'
      ).setDisplaySize(123 * scaleX,336 * scaleY)
        .setInteractive();
    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .3
      })
    }

    update(time: number , delta : number): void {
    }
  };
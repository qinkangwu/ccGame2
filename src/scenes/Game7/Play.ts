import 'phaser';
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';

const scaleX : number = window.innerWidth / 1024;
const scaleY : number = window.innerHeight / 552;
const timerMoveSecons = 3000; //进度多少毫秒走完

export default class Game7PlayScene extends Phaser.Scene {
    private machine : Phaser.GameObjects.Image ; //机器主体
    private handle : Phaser.GameObjects.Sprite ; //手柄
    private goldIcon : Phaser.GameObjects.Image; //金币数量
    private goldText : Phaser.GameObjects.Text; //金币文本
    private playBtn : Phaser.GameObjects.Image; //播放音频按钮
    private recordStartBtn : Phaser.GameObjects.Image; //录音开始按钮
    private playRecordBtn : Phaser.GameObjects.Image; //播放录音按钮
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private recordEndBtn : Phaser.GameObjects.Image; //录音结束按钮
    private wordsArr : string[] = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']; //基础单词随机组合数组
    private rec ; //录音对象
    private recordGraphics : Phaser.GameObjects.Graphics ; //停止录音进度条绘制对象
    private timerNum : object = {
      d : 360
    }; //进度条角度
    private timerObj : Phaser.Tweens.Tween; //定时器
    private resultArr : any[] = [] ; //结果的集合
    private word1 : Phaser.GameObjects.Text; //游玩过程当中随机1号
    private word2 : Phaser.GameObjects.Text; //游玩过程当中随机1号
    private word3 : Phaser.GameObjects.Text; //游玩过程当中随机1号
    private renderingTimerObj : Phaser.Time.TimerEvent; //过程timer
    private recordBlob : Blob ; //录音二进制数据
    private goldNumber : number = 0; //金币数量文本
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
      this.createBgm(); //背景音乐
      this.createMask(); //创建遮罩层
      this.renderSuccess([],true); //初始化渲染
      this.createGold(); //创建金币
      new CreateBtnClass(this,{
        recordStartCallback : this.recordStartHandle,
        recordEndCallback : this.recordEndHandle,
        playBtnCallback : ()=>{},
        playRecordCallback : this.playRecord,
        bgm : this.bgm
      });
    }

    private createGold () : void {
      //创建按钮
      this.goldIcon = this.add.image(55,window.innerHeight - 55,'icons2','civa_gold.png')
        .setOrigin(.5)
        .setDisplaySize(60,60)
        .setInteractive()
      this.goldText = this.add.text(this.goldIcon.x + 13,this.goldIcon.y + 16,this.goldNumber + '',{
        font: 'Bold 14px Arial Rounded MT',
        fill : '#fff',
      }).setOrigin(.5);
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

    private renderAnims () : void {
      //开启摇摇乐
      this.renderingTimerObj && this.renderingTimerObj.remove();
      this.renderingTimerObj && this.renderingTimerObj.destroy();
      this.renderingTimerObj && (this.renderingTimerObj = null);
      this.renderingTimerObj = this.time.addEvent({
        loop : true,
        callback : ()=>{
          this.rendering();
        }
      });
      //@ts-ignore
      !this.renderAnims.clearTimer && this.resultArr.map((r,i)=>{
        r.destroy();
      });
      //@ts-ignore
      !this.renderAnims.clearTimer && (this.renderAnims.clearTimer = this.time.addEvent({
        delay : 2000,
        callback : ()=>{
          this.renderSuccess(['h','i']); //结束
        }
      }))
    }

    private rendering () : void{
      //渲染摇摇乐
      let word1 : string = Phaser.Utils.Array.GetRandom(this.wordsArr),
          word2 : string = Phaser.Utils.Array.GetRandom(this.wordsArr),
          word3 : string = Phaser.Utils.Array.GetRandom(this.wordsArr);
      //@ts-ignore
      this.word1 && this.word1 !== 'lock' &&  this.word1.destroy();
      //@ts-ignore
      this.word2 && this.word2 !== 'lock' && this.word2.destroy();
      //@ts-ignore
      this.word3 && this.word3 !== 'lock' && this.word3.destroy();
      //@ts-ignore
      this.word1 !== 'lock' && (this.word1 = this.add.text(this.machine.x - 31 - (95 * scaleX),this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),word1,{
        font: 'Bold 80px Arial Rounded MT',
        fill : '#C5684C',
      }).setOrigin(.5));
      //@ts-ignore
      this.word2 !== 'lock' && (this.word2 = this.add.text(this.machine.x,this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),word2,{
        font: 'Bold 80px Arial Rounded MT',
        fill : '#C5684C',
      }).setOrigin(.5));
      //@ts-ignore
      this.word3 !== 'lock' && (this.word3 = this.add.text(this.machine.x + 31 + (95 * scaleX),this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),word3,{
        font: 'Bold 80px Arial Rounded MT',
        fill : '#C5684C',
      }).setOrigin(.5));
    }

    private renderSuccess (data : string[] , init? : boolean) : void {
      //渲染结果
      //@ts-ignore
      this.word1 && this.word1 !== 'lock' && this.word1.destroy();
      //@ts-ignore
      !init && (this.word1 = 'lock');
      this.resultArr.push(
        data[0] 
          && 
        this.add.text(this.machine.x - 31 - (95 * scaleX),this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),data[0],{
          font: 'Bold 80px Arial Rounded MT',
          fill : '#C5684C',
        }).setOrigin(.5) 
          || 
        this.add.image(this.machine.x - 31 - (95 * scaleX),this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),'icons2','civa_gold2.png')
          .setDisplaySize(95,95)
          .setOrigin(.5)
      );
      this.time.addEvent({
        delay : !init && 1000,
        callback : ()=>{
          //@ts-ignore
          this.word2 && this.word2 !== 'lock' && this.word2.destroy();
          //@ts-ignore
          !init && (this.word2 = 'lock');
          this.resultArr.push(
            data[1] 
              &&  
            this.add.text(this.machine.x,this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),data[1],{
              font: 'Bold 80px Arial Rounded MT',
              fill : '#C5684C',
            }).setOrigin(.5)
              ||
            this.add.image(this.machine.x,this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),'icons2','civa_gold2.png')
              .setDisplaySize(95,95)
              .setOrigin(.5));            
        }
      });
      this.time.addEvent({
        delay : !init && 2000,
        callback : ()=>{
          //@ts-ignore
          this.word3 && this.word3 !== 'lock' && this.word3.destroy();
          //@ts-ignore
          !init && (this.word3 = 'lock');
          this.resultArr.push(
            data[2] 
            &&
            this.add.text(this.machine.x + 31 + (95 * scaleX),this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),data[2],{
              font: 'Bold 80px Arial Rounded MT',
              fill : '#C5684C',
            }).setOrigin(.5)
            ||
            this.add.image(this.machine.x + 31 + (95 * scaleX),this.machine.y + (this.machine.height * scaleY / 2) + (window.innerHeight * scaleY * 0.07 ),'icons2','civa_gold2.png')
              .setDisplaySize(95,95)
              .setOrigin(.5));
            !init && this.renderEndHandle();
        }
      })
    }

    private renderEndHandle () : void {
      this.renderingTimerObj && this.renderingTimerObj.remove();
      this.renderingTimerObj && this.renderingTimerObj.destroy();
      this.renderingTimerObj && (this.renderingTimerObj = null);
      //@ts-ignore
      this.renderAnims.clearTimer = null;
      this.word1 = null;
      this.word2 = null;
      this.word3 = null;
      this.tweens.add({
        targets : [this.recordStartBtn],
        alpha : 1,
        duration : 500,
        ease : 'Sine.easeInOut',
      })
    }

    private drawArc () : void {
      //绘制进度条
      this.clearArc();
      this.recordGraphics = this.add.graphics();
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
        this.recordEndHandle();
      }
    }

    private handleClick () : void {
      //点击摇杆
      this.handle.play('begin');
      this.renderAnims();
      this.tweens.add({
        targets : [this.playBtn,this.recordStartBtn,this.playRecordBtn],
        alpha : 0,
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
    }

    private playRecord () : void {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(this.recordBlob);
      audio.play();
    }

    private recordEndHandle() : void {
      //录音结束
      this.recordEndBtn.alpha = 0;
      this.recordEndBtn.depth = -1;
      this.recordStartBtn.alpha = 1;
      this.recordStartBtn.depth = 1;
      this.rec && this.rec.stop((blob,duration)=>{
        this.recordBlob = blob; //保存blob 用于播放
        this.rec.close();
        this.timerObj && this.timerObj.stop();
        //@ts-ignore
        this.timerNum.d = 360;
        this.clearArc();
        let files : File = new File([blob],'aaa.wav',{
          type : blob.type
        });
        this.tweens.add({
          targets : [this.playBtn,this.playRecordBtn],
          alpha : 1 ,
          duration : 500,
          ease : 'Sine.easeInOut'
        })
      },(msg)=>{
        this.tweens.add({
          targets : [this.playBtn,this.playRecordBtn],
          alpha : 1 ,
          duration : 500,
          ease : 'Sine.easeInOut'
        });
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
        this.recordEndBtn.depth = 1;
        this.recordStartBtn.alpha = 0;
        this.recordStartBtn.depth = -1;
        this.drawArc();
        this.timerObj && this.timerObj.remove();
        this.timerObj = this.tweens.add({
          targets : this.timerNum,
          d : 0,
          duration : 3000,
          onUpdate : this.drawArc.bind(this)
        })
        this.rec.start();
      })
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
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
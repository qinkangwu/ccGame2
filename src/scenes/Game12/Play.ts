import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';
import TipsParticlesEmitter from "../../Public/TipsParticlesEmitter";
import { Item } from '../../interface/Game12';

const W = 1024;
const H = 552;

export default class Game12PlayScene extends Phaser.Scene {
    private ccData : Item[] = []; //数据
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private itemArr : Phaser.Physics.Arcade.Image[] = [] ; //外星人数组
    private itemTextArr : Phaser.GameObjects.Text[] = [] ; //外星人文本数组
    private leftContetn : Phaser.Physics.Arcade.Image ; //左边飞船
    private rightContent : Phaser.Physics.Arcade.Image ; //右边飞船
    private leftContentText : Phaser.GameObjects.Text; //左边飞船文本
    private rightContentText : Phaser.GameObjects.Text; //右边飞船文本
    private tips : TipsParticlesEmitter; //tip组件
    private max : number = 10; //最大值
    private dragX : number = 0 ; //拖拽x
    private dragY : number = 0 ; //拖拽y
    private objCurrentX : number = 0 ; //对象当前的x
    private objCurrentY : number = 0 ; //对象当前的y
    private obj2CurrentX : number = 0 ; //文本对象当前的x
    private obj2CurrentY : number = 0 ; //文本对象当前的y
    private overlapLock : boolean = false; //重叠检测锁
    private isOverlap : boolean = false; //是否重叠了
    private overlapIndex : number = - 1 ;  //重叠的飞碟索引
    private dragIndex : number; //拖拽物体的索引
    private currentIndex : number = 0 ; //当前索引
    private wordsArr : object[] = []; //文字数组
    constructor() {
      super({
        key: "Game12PlayScene"
      });
    }
  
    init(data): void {
      data && data.data && (this.ccData = data.data);
    }
  
    preload(): void {
      TipsParticlesEmitter.loadImg(this);
    }
    
  
    create(): void {
      console.log(this.ccData);
      this.createBgi(); //背景
      this.createBgm(); //背景音乐
      this.tips = new TipsParticlesEmitter(this); //tip组件
      new CreateBtnClass(this,{
        bgm : this.bgm,
      }); //公共按钮组件
      this.createTopContent() ; //创建上面的内容
      this.loadMusic(this.ccData);
      this.createContent(); //创建下面的内容
      this.initAnims(); //初始化动画
    }

    private loadMusic (data : Array<Item>) : void {
      //加载音频
      data && data.map((r :Item , i : number )=>{
        r.wordClassifications.map((r2,i2)=>{
          this.load.audio(r2.id,r2.audioKey);
        })
      })
      this.load.start(); //preload自动运行，其他地方加载资源必须手动启动，不然加载失效
    }

    private chooseItemHandle () : void {
      this.itemArr.map((r,i)=>{
        r && r.off('dragstart');
        r && r.off('drag');
        r && r.off('dragend');
      });
      let i = Phaser.Math.Between(1,this.max) - 1;
      this.tweens.add({
        targets : this.itemTextArr[i],
        ease : 'Sine.easeInOut',
        alpha : 1,
        duration : 600,
        onComplete : ()=>{
          this.itemArr[i].setDepth(1);
          this.itemTextArr[i].setDepth(1);
          this.itemArr[i].on('dragstart',(...args)=>{
            this.dragX = args[0].worldX;
            this.dragY = args[0].worldY;
            this.objCurrentX = this.itemArr[i].x;
            this.objCurrentY = this.itemArr[i].y;
            this.obj2CurrentX = this.itemTextArr[i].x;
            this.obj2CurrentY = this.itemTextArr[i].y;
            this.overlapLock = true;
            this.isOverlap = false;
            this.overlapIndex = -1;
          });
          this.itemArr[i].on('drag',(...args)=>{
            this.itemArr[i].x = this.objCurrentX + (args[0].worldX - this.dragX);
            this.itemTextArr[i].x = this.obj2CurrentX + (args[0].worldX - this.dragX);
            this.itemArr[i].y = this.objCurrentY + (args[0].worldY - this.dragY);
            this.itemTextArr[i].y = this.obj2CurrentY + (args[0].worldY - this.dragY);
          });
          this.itemArr[i].on('dragend',(...args)=>{
            this.overlapLock = false;
            this.time.addEvent({
              delay : 200,
              callback : ()=>{
                // console.log(this.ccData[this.overlapIndex + this.currentIndex].wordTypeCode,this.wordsArr[this.dragIndex].wordType);
                if(this.overlapIndex === -1){
                  this.resetItemObj(i);
                  this.playMusic('wrong');
                  return;
                }
                //@ts-ignore
                if(this.ccData[this.overlapIndex + this.currentIndex].wordTypeCode === this.wordsArr[this.dragIndex].wordType){
                  this.isOverlap = true;
                }else{
                  this.isOverlap = false;
                }
                if(this.isOverlap){
                  //重叠
                  //@ts-ignore
                  this.playMusic(this.wordsArr[this.dragIndex].id);
                  this.itemArr[i].destroy();
                  this.itemTextArr[i].destroy();
                  this.itemArr.splice(i,1);
                  this.itemTextArr.splice(i,1);
                  this.max -= 1;
                  console.log(this.ccData[this.overlapIndex],this.wordsArr[this.dragIndex])                  
                  if(this.itemArr.length === 0 ){
                    console.log('数据处理完毕');
                    this.tips.success(()=>{
                      this.currentIndex = this.currentIndex + 2 >= this.ccData.length ? 0 : this.currentIndex + 2;
                      this.leftContentText.setText(this.ccData[this.currentIndex].wordTypeName);
                      this.rightContentText.setText(this.ccData[this.currentIndex + 1].wordTypeName);
                      this.itemArr.map((r,i)=>{
                        r && r.destroy();
                        this.itemTextArr[i] && this.itemTextArr[i].destroy();
                      });
                      this.itemArr.length = 0 ;
                      this.itemTextArr.length = 0;
                      this.createContent(); //创建下面的内容
                      this.initAnims(); //初始化动画
                    })
                  }else{
                    this.chooseItemHandle();
                  }
                }else{
                  //不重叠
                  this.resetItemObj(i);
                  this.playMusic('wrong');
                }
              }
            })
          });
        }
      });
    }
    
    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private resetItemObj (i : number) : void {
      this.tweens.add({
        targets : [this.itemArr[i]],
        x : this.objCurrentX,
        y : this.objCurrentY,
        duration : 500,
        ease : 'Sine.easeInOut',
      });
      this.tweens.add({
        targets : [this.itemTextArr[i]],
        x : this.obj2CurrentX,
        y : this.obj2CurrentY,
        duration : 500,
        ease : 'Sine.easeInOut',
      });
    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .2
      })
    }

    private createBgi () : void {
      //背景
      this.add.image(0,0,'bgi').setDisplaySize(W,H).setOrigin(0);
    }

    private createTopContent() : void {
      this.leftContetn = this.physics.add.image(228.5,129.5,'leftContent').setOrigin(.5).setAlpha(0).setData('index',0);
      this.rightContent = this.physics.add.image(775.5,129.5,'rightContent').setOrigin(.5).setAlpha(0).setData('index',1);
      this.leftContentText = this.add.text(this.leftContetn.x , this.leftContetn.y , this.ccData[this.currentIndex].wordTypeName, {
        fontSize: "79px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#ffffff',
      }).setOrigin(.5).setAlpha(0);
      this.rightContentText = this.add.text(this.rightContent.x , this.rightContent.y , this.ccData[this.currentIndex + 1].wordTypeName, {
        fontSize: "79px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#ffffff',
      }).setOrigin(.5).setAlpha(0);
    }

    private initAnims () : void {
      this.itemArr.map((r,i)=>{
        this.tweens.add({
          targets : [r,this.itemTextArr[i]],
          ease : 'Sine.easeInOut',
          y : `+=${W}`,
          duration : 500,
          delay : i * 50
        });
        this.tweens.add({
          targets : [this.leftContetn,this.rightContent,this.leftContentText,this.rightContentText],
          ease : 'Sine.easeInOut',
          alpha : 1,
          duration : 500,
          delay : 500
        });
      });
      this.time.addEvent({
        delay : 1200,
        callback : ()=>{
          this.chooseItemHandle();
          this.createOverlap(); //初始化重叠检测
        }
      })
    }

    private createOverlap() : void {
      this.physics.add.overlap(this.itemArr,[this.leftContetn,this.rightContent],(...args)=>{
        if(this.overlapLock) return;
        if(
        //@ts-ignore
          args[0].x -  args[0].width / 2  >= args[1].x - args[1].width / 2 && 
        //@ts-ignore
          args[0].x + args[0].width / 2 <= args[1].x + args[1].width / 2 && 
        //@ts-ignore
          args[0].y -  args[0].height / 2  >= args[1].y - args[1].height / 2 && 
        //@ts-ignore
          args[0].y + args[0].height / 2 <= args[1].y + args[1].height / 2
        ){
          this.overlapIndex = args[1].getData('index');
          this.dragIndex = args[0].getData('index');
        }
      })
    }

    private shuffle<T> (arr : T[]) : T[]{
      //Fisher-Yates shuffle 算法 打乱数组顺序
      for (let i :number = 1; i < arr.length ; i ++) {
        let random : number = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[random]] = [arr[random], arr[i]];   //es6  交换数组成员位置
      }
      return arr;
    }

    private createContent () : void {
      this.wordsArr = this.shuffle(this.ccData[this.currentIndex].wordClassifications.concat(this.ccData[this.currentIndex + 1].wordClassifications));
      this.max = this.wordsArr.length ;
      for(let i = 0 ; i < this.max ; i ++){
        if(i < 5){
          this.itemArr.push(this.physics.add.image(149.5 + (i * 115) + (i * 63),328.5 - W,'content').setOrigin(.5).setInteractive({draggable : true}).setData('index',i));
        }else{
          this.itemArr.push(this.physics.add.image(149.5 + ((i - 5) * 115) + ((i - 5) * 63),468.5 - W,'content').setOrigin(.5).setInteractive({draggable : true}).setData('index',i));
        }
        //@ts-ignore
        this.itemTextArr.push(this.add.text(this.itemArr[i].x,this.itemArr[i].y + 18,this.wordsArr[i].name,{
          fontSize: "26px",
          fontFamily:"Arial Rounded MT Bold",
          fill : '#ED6C35',
        }).setOrigin(.5).setAlpha(0));
      }
    }

    update(time: number , delta : number): void {
    }
  };
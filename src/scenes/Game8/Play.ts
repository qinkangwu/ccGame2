import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';
import PlanAnims from "../../Public/PlanAnims";
import TipsParticlesEmitter from "../../Public/TipsParticlesEmitter";
import { item } from "../../interface/Game8";

const W = 1024;
const H = 552;

export default class Game8PlayScene extends Phaser.Scene {
    private ccData : item[] = []; //数据
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private createBtnClass : CreateBtnClass ; //按钮组件返回
    private bait : Phaser.GameObjects.Sprite; //鱼饵
    private popArr : Phaser.GameObjects.Image[] = []; //气泡集合
    private textArr : Phaser.GameObjects.Text[] = []; //文字集合
    private leftPopArr : Phaser.GameObjects.Image[] = []; //左边ui气泡集合
    private smallFishMenu : Phaser.GameObjects.Image; //小鱼索引
    private smallFishText : Phaser.GameObjects.Text; //小鱼文本
    private leftUiIndex : number = -1 ; //左边ui索引
    private choosePopArr : Phaser.GameObjects.Image[] = []; //选择的气泡
    private chooseTextArr : Phaser.GameObjects.Text[] = []; //选择的文本
    private previewLock : boolean = false; //恢复锁
    private planAnims : PlanAnims; //飞机过长动画引用
    private tips : TipsParticlesEmitter; //tip组件
    private currentIndex : number = 0 ; //当前数据索引
    private smallFishNum : number = 0 ; 
    constructor() {
      super({
        key: "Game8PlayScene"
      });
    }
  
    init(data): void {
      data && data.data && (this.ccData = data.data);
    }
  
    preload(): void {
      TipsParticlesEmitter.loadImg(this);
      PlanAnims.loadImg(this);
    }
    
  
    create(): void {
      new CreateMask(this,()=>{
        this.planAnims = new PlanAnims(this,this.ccData.length);
        this.planAnims.show(this.currentIndex + 1,()=>{
          this.baitAnims(); //注册动画
          this.popShowAnims(); //中间气泡展示动画
          this.initEmitterHandle(); //初始化事件
        })
      }); //遮罩层
      this.createBgi(); //创建背景
      this.createBgm(); //创建背景音乐
      this.loadMusic(this.ccData);
      this.createBtnClass = new CreateBtnClass(this,{
        playBtnCallback : ()=>{
          this.playMusic(this.ccData[this.currentIndex].id);
        },
        bgm : this.bgm,
        previewCallback : this.previewHandle.bind(this),
        previewPosition : {},
        playBtnPosition : {
          y : H - 55,
          x : 55,
          alpha : 1
        }
      }); //按钮公共组件

      this.renderCenterPop(); //渲染中间的泡泡

      this.renderLeftUI(); //渲染左边的ui
      this.tips = new TipsParticlesEmitter(this); //tip组件
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private nextWordHandle() : void { 
      this.currentIndex = this.currentIndex + 1 > this.ccData.length - 1 ? 0 : this.currentIndex + 1 ;
      this.planAnims.show(this.currentIndex + 1,()=>{
        this.previewHandle();
      })
    }

    private renderLeftUI() : void {
      for(let i = 0 ; i < this.ccData[this.currentIndex].phoneticSymbols.length; i ++ ){
        this.leftPopArr.push(
          this.add.image(55,H - 145 - ((i) * 65),'game8Icons2',`smallPop${i + 1}.png`)
            .setOrigin(.5)
            .setDisplaySize(60,60)
        )
      }
      this.smallFishMenu = this.add.image(55.5,143.5,'game8Icons2','smf.png').setOrigin(.5).setDisplaySize(75,66);
      this.smallFishText = this.add.text(this.smallFishMenu.x + 9,this.smallFishMenu.y + 19,`0/${this.ccData[this.currentIndex].phoneticSymbols.length}`,{
        font: 'Bold 16px Arial Rounded MT',
        fill : '#ffffff',
      }).setOrigin(.5);
    }

    private loadMusic (data : Array<item>) : void {
      //加载音频
      data && data.map((r :item , i : number )=>{
        this.load.audio(r.id,r.audioKey);
        r.phoneticSymbols.map((r2,i2)=>{
          this.load.audio(r2.id,r2.audioKey);
        });
        r.uselessPhoneticSymbols.map((r2,i2)=>{
          this.load.audio(r2.id,r2.audioKey);
        })
      })
      this.load.start(); //preload自动运行，其他地方加载资源必须手动启动，不然加载失效
    }

    private previewHandle () : void {
      //恢复操作
      if(this.previewLock) return;
      this.popArr.map((r,i)=>{
        r && r.destroy();
        this.textArr[i] && this.textArr[i].destroy();
        this.choosePopArr[i] && this.choosePopArr[i].destroy();
        this.chooseTextArr[i] && this.chooseTextArr[i].destroy();
        this.leftPopArr[i] && this.leftPopArr[i].destroy();
      });
      this.leftPopArr.length = 0 ;
      this.leftUiIndex = -1;
      this.popArr.length = 0 ;
      this.textArr.length = 0 ;
      this.smallFishNum = 0;
      this.renderCenterPop();
      this.popShowAnims();
      this.renderLeftUI();
    }

    private popShowAnims () : void {
      //中间气泡显示动画
      this.previewLock = true;
      this.popArr.map((r : Phaser.GameObjects.Image,i : number)=>{
        this.time.addEvent({
          delay : i * 200,
          callback : ()=>{
            this.tweens.timeline({
              targets : r,
              ease : 'Sine.easeInOut',
              duration : 200,
              tweens : [
                {
                  displayHeight : 155,
                  displayWidth : 155,
                },
                {
                  displayHeight : 115,
                  displayWidth : 115,
                },
                {
                  displayHeight : 135,
                  displayWidth : 135,
                }
              ],
              onComplete : ()=>{
                this.tweens.add({
                  targets : this.textArr[i],
                  ease : 'Sine.easeInOut',
                  duration : 300,
                  alpha : 1
                })
              }
            });
          }
        })
      });
      this.time.addEvent({
        delay : 3000,
        callback : ()=>{
          this.previewLock = false;
        }
      })
    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .2
      })
    }

    private itemClickHandle(...args) : void {
      if(!args[1] || args[1].length <= 0 ||  args[1][0].frame.name !== 'bigPop.png') return;
      let obj = args[1][0];
      this.moveToHandle(obj);
    }

    private moveToHandle (obj : Phaser.GameObjects.Image) : void {
      let index : number = obj.getData('index');
      const name : string = obj.getData('name');
      const id : string = obj.getData('id');
      if(this.leftUiIndex === this.ccData[this.currentIndex].phoneticSymbols.length -1 ){
        return;
      }
      this.playMusic(id);
      this.leftUiIndex = this.leftUiIndex + 1 >= this.ccData[this.currentIndex].phoneticSymbols.length ? 0 : this.leftUiIndex + 1
      this.smallFishText.setText(`${++this.smallFishNum}/${this.ccData[this.currentIndex].phoneticSymbols.length}`)
      this.bait.play('begin');
      this.textArr[index].destroy();
      this.tweens.add({
        targets : obj,
        x : this.leftPopArr[this.leftUiIndex].x,
        y : this.leftPopArr[this.leftUiIndex].y,
        displayHeight : 0,
        displayWidth : 0,
        duration : 500,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          obj.destroy();
          this.popArr[index] = null;
          this.createSmallPopHandle(name);
          if(this.leftUiIndex === this.ccData[this.currentIndex].phoneticSymbols.length - 1){
            let flag = true;
            this.choosePopArr.map((r,i)=>{
              if(r.getData('name') !== this.ccData[this.currentIndex].phoneticSymbols[i].name){
                flag = false;
              }
            });
            if(flag){
              //正确
              this.chooseEndHandle();
            }else{
              //错误
              this.tips.tryAgain(this.previewHandle)
            }
          }
        }
      })
    }

    private createSmallPopHandle (name : string) : void {
      //选择相应气泡 渲染到左边
      this.choosePopArr[this.leftUiIndex] = this.add.image(this.leftPopArr[this.leftUiIndex].x,this.leftPopArr[this.leftUiIndex].y,'game8Icons2','smallPop.png')
                                                .setOrigin(.5)
                                                .setDisplaySize(60,60)
                                                .setDepth(100)
                                                .setData('name',name)
      this.chooseTextArr[this.leftUiIndex] = this.add.text(this.choosePopArr[this.leftUiIndex].x,this.choosePopArr[this.leftUiIndex].y,name,{
        font: 'Bold 23px Arial Rounded MT',
        fill : '#017FF8',
      }).setOrigin(.5).setDepth(101);
      this.leftPopArr[this.leftUiIndex].destroy();
    }

    private initEmitterHandle () : void {
      //初始化事件
      this.input.on('pointerdown',this.itemClickHandle.bind(this))
    }

    private createBgi () : void {
      //背景
      this.add.image(0,0,'bgi').setDisplaySize(W,H).setOrigin(0);
      this.bait = this.add.sprite(W * 0.9086,H * 0.8324 ,'game8Icons','bait1.png')
        .setOrigin(.5)
        .setDisplaySize(W * 0.0166,H * 0.1177);
      this.add.image(89,H - 118,'game8Icons2','playAgain.png').setOrigin(0).setDisplaySize(101,50);
    }

    private baitAnims () : void {
      //摇杆切换frame
      this.anims.create({
        key : 'begin',
        frames : this.anims.generateFrameNames('game8Icons',{start : 0 , end : 3 , zeroPad: 0 , prefix : 'bait' , suffix : '.png' }),
        frameRate : 12,
        repeat : 0,
        yoyo : true
      })
    }

    private chooseEndHandle() : void {
      //成功展示小鱼
      let graphicsObj : Phaser.GameObjects.Graphics = this.add.graphics();
      graphicsObj.fillStyle(0x000000,.5);
      graphicsObj.fillRect(0,0,W,H).setDepth(1001);
      let path1 : Phaser.GameObjects.Image = this.add.image(W / 2 , H / 2 , 'path1')
                                                  .setOrigin(.5)
                                                  .setDepth(1002)
                                                  .setScale(0);
      let fish : Phaser.GameObjects.Image = this.add.image(W / 2 , H / 2 , 'bmf')
                                                  .setOrigin(.5)
                                                  .setDepth(1003)
                                                  .setDisplaySize(0,0)
                                                  .setAngle(0)

      this.tweens.add({
        targets : path1,
        ease : 'Sine.easeInOut',
        duration : 500,
        scaleX : 1 ,
        scaleY : 1 
      });

      this.tweens.add({
        targets : fish,
        ease : 'Sine.easeInOut',
        duration : 500,
        delay : 500,
        angle : 360,
        displayWidth : 169,
        displayHeight : 127
      });

      this.time.addEvent({
        delay : 2000,
        callback : ()=>{
          graphicsObj.destroy();
          path1.destroy();
          fish.destroy();
          this.nextWordHandle();
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

    private renderCenterPop () : void {
      //渲染中间的泡泡
      let contentData = this.ccData[this.currentIndex].phoneticSymbols.concat(this.ccData[this.currentIndex].uselessPhoneticSymbols.slice(0,6));
      contentData = this.shuffle(contentData);
      for (let i = 0 ; i < 9 ; i ++ ){
        if(i < 3){
          this.popArr.push(
            this.add.image(W / 2 + (-185 + (i * 185)),H / 2 - 173 ,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setData('name',contentData[i].name)
              .setData('id',contentData[i].id)
              .setDisplaySize(0,0)
              .setInteractive()
          )
        }else if(i >= 3 && i < 6){
          this.popArr.push(
            this.add.image(W / 2 + (-185 + ((i - 3) * 185)),H / 2,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setData('name',contentData[i].name)
              .setData('id',contentData[i].id)
              .setDisplaySize(0,0)
              .setInteractive()
          )
        }else{
          this.popArr.push(
            this.add.image(W / 2 + (-185 + ((i - 6) * 185)),H / 2 + 173,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setData('name',contentData[i].name)
              .setData('id',contentData[i].id)
              .setDisplaySize(0,0)
              .setInteractive()
          )
        }
        this.textArr.push(
          this.add.text(this.popArr[i].x,this.popArr[i].y,contentData[i].name,{
            font: 'Bold 60px Arial Rounded MT',
            fill : '#0080F5',
          }).setOrigin(.5).setAlpha(0)
        )
      }
    }

    update(time: number , delta : number): void {
    }
  };
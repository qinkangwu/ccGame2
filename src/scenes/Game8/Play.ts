import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';
import TipsParticlesEmitter from "../../Public/TipsParticlesEmitter";

export default class Game8PlayScene extends Phaser.Scene {
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
    private tips : TipsParticlesEmitter; //tip组件
    constructor() {
      super({
        key: "Game8PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      new CreateMask(this,()=>{
        this.baitAnims(); //注册动画
        this.popShowAnims(); //中间气泡展示动画
        this.initEmitterHandle(); //初始化事件
      }); //遮罩层
      this.createBgi(); //创建背景
      this.createBgm(); //创建背景音乐
      this.createBtnClass = new CreateBtnClass(this,{
        playBtnCallback : ()=>{},
        bgm : this.bgm,
        previewCallback : this.previewHandle.bind(this),
        playBtnPosition : {
          y : window.innerHeight - 55,
          x : 55,
          alpha : 1
        }
      }); //按钮公共组件

      this.renderCenterPop(); //渲染中间的泡泡

      this.renderLeftUI(); //渲染左边的ui
      this.tips = new TipsParticlesEmitter(this); //tip组件
    }

    private renderLeftUI() : void {
      for(let i = 0 ; i < 4; i ++ ){
        this.leftPopArr.push(
          this.add.image(55,window.innerHeight - 145 - ((i) * 65),'game8Icons2',`smallPop${i + 1}.png`)
            .setOrigin(.5)
            .setDisplaySize(60,60)
        )
      }
      this.smallFishMenu = this.add.image(55.5,143.5,'game8Icons2','smf.png').setOrigin(.5);
      this.smallFishText = this.add.text(this.smallFishMenu.x + 9,this.smallFishMenu.y + 19,'1/3',{
        font: 'Bold 16px Arial Rounded MT',
        fill : '#ffffff',
      }).setOrigin(.5);
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
        volume : .3
      })
    }

    private itemClickHandle(...args) : void {
      if(!args[1] || args[1].length <= 0 ||  args[1][0].frame.name !== 'bigPop.png') return;
      let obj = args[1][0];
      this.moveToHandle(obj);
    }

    private moveToHandle (obj : Phaser.GameObjects.Image) : void {
      let index : number = obj.getData('index');
      if(this.leftUiIndex === 3){
        return;
      }
      this.bait.play('begin');
      this.leftUiIndex = this.leftUiIndex + 1 >= 4 ? 0 : this.leftUiIndex + 1
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
          this.createSmallPopHandle();
          if(this.leftUiIndex === 3){
            this.chooseEndHandle(); 
          }
        }
      })
    }

    private createSmallPopHandle () : void {
      //选择相应气泡 渲染到左边
      this.choosePopArr[this.leftUiIndex] = this.add.image(this.leftPopArr[this.leftUiIndex].x,this.leftPopArr[this.leftUiIndex].y,'game8Icons2','smallPop.png')
                                                .setOrigin(.5)
                                                .setDisplaySize(60,60)
                                                .setDepth(100)
      this.chooseTextArr[this.leftUiIndex] = this.add.text(this.choosePopArr[this.leftUiIndex].x,this.choosePopArr[this.leftUiIndex].y,'/i/',{
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
      this.add.image(0,0,'bgi').setDisplaySize(window.innerWidth,window.innerHeight).setOrigin(0);
      this.bait = this.add.sprite(window.innerWidth * 0.9086,window.innerHeight * 0.8324 ,'game8Icons','bait1.png')
        .setOrigin(.5)
        .setDisplaySize(window.innerWidth * 0.0166,window.innerHeight * 0.1177);
      this.add.image(89,window.innerHeight - 118,'game8Icons2','playAgain.png').setOrigin(0).setDisplaySize(101,50);
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
      graphicsObj.fillRect(0,0,window.innerWidth,window.innerHeight).setDepth(1001);
      let path1 : Phaser.GameObjects.Image = this.add.image(window.innerWidth / 2 , window.innerHeight / 2 , 'path1')
                                                  .setOrigin(.5)
                                                  .setDepth(1002)
                                                  .setScale(0);
      let fish : Phaser.GameObjects.Image = this.add.image(window.innerWidth / 2 , window.innerHeight / 2 ,'game8Icons2' , 'bmf.png')
                                                  .setOrigin(.5)
                                                  .setDepth(1003)
                                                  .setScale(0)
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
        scaleX : 1,
        scaleY : 1
      });

      this.time.addEvent({
        delay : 2000,
        callback : ()=>{
          graphicsObj.destroy();
          path1.destroy();
          fish.destroy();
        }
      })
      
    }

    private renderCenterPop () : void {
      //渲染中间的泡泡
      for (let i = 0 ; i < 9 ; i ++ ){
        if(i < 3){
          this.popArr.push(
            this.add.image(window.innerWidth / 2 + (-185 + (i * 185)),window.innerHeight / 2 - 173 ,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setDisplaySize(0,0)
              .setInteractive()
          )
        }else if(i >= 3 && i < 6){
          this.popArr.push(
            this.add.image(window.innerWidth / 2 + (-185 + ((i - 3) * 185)),window.innerHeight / 2,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setDisplaySize(0,0)
              .setInteractive()
          )
        }else{
          this.popArr.push(
            this.add.image(window.innerWidth / 2 + (-185 + ((i - 6) * 185)),window.innerHeight / 2 + 173,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setDisplaySize(0,0)
              .setInteractive()
          )
        }
        this.textArr.push(
          this.add.text(this.popArr[i].x,this.popArr[i].y,'/i/',{
            font: 'Bold 60px Arial Rounded MT',
            fill : '#0080F5',
          }).setOrigin(.5).setAlpha(0)
        )
      }
    }

    update(time: number , delta : number): void {
    }
  };
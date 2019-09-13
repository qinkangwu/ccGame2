import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';
import { Gold } from "../../Public/jonny/components/Gold";
import { SellingGold } from "../../Public/jonny/components/SellingGold";
import TipsParticlesEmitter from "../../Public/TipsParticlesEmitter";
import { item } from "../../interface/Game8";

const W = 1024;
const H = 552;
let timerNumber = 59;

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
    private tips : TipsParticlesEmitter; //tip组件
    private currentIndex : number = 0 ; //当前数据索引
    private smallFishNum : number = 0 ; // 小鱼目录
    private goldObj : Gold ; //金币组件引用
    private timerObj : Phaser.GameObjects.Image; //时间UI对象
    private timerText : Phaser.GameObjects.Text; //时间UI文本
    private timerNum : number = 0; //时间number
    private timerEvent : Phaser.Time.TimerEvent; //倒计时任务
    private graphicsObj : Phaser.GameObjects.Graphics; //mask
    private timeoutObj : Phaser.GameObjects.Image; //倒计时UI对象
    private timeoutText : Phaser.GameObjects.Text; //倒计时UI文本
    private centerWordObj : Phaser.GameObjects.Graphics; //中间展示的正确单词对象
    private centerWordText : Phaser.GameObjects.Text; //中间展示的正确单词文本
    private bigFish : Phaser.GameObjects.Image; //中间大鱼对象
    private sholdGetGoldNum : number = 6; //正常情况下可以获得的金币数量
    private currentGoldNum : number = 0 ; //当前的金币数量
    constructor() {
      super({
        key: "Game8PlayScene"
      });
    }
  
    init(data): void {
      data && data.data && (this.ccData = data.data);
      timerNumber = this.ccData.length * 5;
      this.timerNum = timerNumber;
    }
  
    preload(): void {
      TipsParticlesEmitter.loadImg(this);
      Gold.loadImg(this);
      SellingGold.loadImg(this); //全局组件加载Img
    }
    
  
    create(): void {
      new CreateMask(this,()=>{
        this.renderTimeout(()=>{
          this.playMusic(this.ccData[this.currentIndex].id);
          this.baitAnims(); //注册动画
          this.popShowAnims(()=>{
            this.timeDownHandle(); //倒计时任务开启
          }); //中间气泡展示动画
          this.initAnims(); //左右两边动画
          this.initEmitterHandle(); //初始化事件
        })
      }); //遮罩层
      this.createBgi(); //创建背景
      this.createBgm(); //创建背景音乐
      this.goldObj = new Gold(this,this.currentGoldNum);
      this.add.existing(this.goldObj);
      this.loadMusic(this.ccData);
      this.createBtnClass = new CreateBtnClass(this,{
        playBtnCallback : ()=>{
          this.playMusic(this.ccData[this.currentIndex].id);
        },
        bgm : this.bgm,
        playBtnPosition : {
          y : H - 55,
          x : 55,
          alpha : 1
        }
      }); //按钮公共组件

      this.renderCenterPop(); //渲染中间的泡泡
      this.renderCenterWord(); //渲染中间的正确单词
      this.renderLeftUI(true); //渲染左边的ui
      this.renderFishAndTimer(); //渲染鱼跟时间
      this.tips = new TipsParticlesEmitter(this); //tip组件
    }
    

    private s_to_hs(s) : string{
      //秒数换算成分钟
      let h;
      h = Math.floor(s/60);
      s = s%60;
      h += '';
      s += '';
      h = (h.length==1)?'0'+h:h;
      s = (s.length==1)?'0'+s:s;
      return h+':'+s;
  }
    
    private timeDownHandle () : void {
      this.timerEvent = this.time.addEvent({
        delay : 1000,
        callback : ()=>{
          this.timerNum = this.timerNum - 1 <= 0 ? 0 : this.timerNum - 1;
          this.timerText.setText(this.s_to_hs(this.timerNum));
          if(this.timerNum === 0 ){
            //倒计时结束
            this.timerEvent.destroy();
            this.timerEvent = null;
            this.timeEndHandle();
            console.log('倒计时结束');
            return;
          }
        },
        loop : true
      });
    }
    

    private timeEndHandle() : void {
      let goodjobFish = Math.floor(this.ccData.length * 0.8);
      if(this.smallFishNum >= goodjobFish){
        //goodjob
        this.tips.success(()=>{
          let goldAnims = new SellingGold(this,{
            callback : ()=>{
              this.goldObj.setText(this.currentGoldNum+=this.sholdGetGoldNum);
              this.previewHandle(true);
            }
          });
          goldAnims.golds.setDepth(101);
          goldAnims.goodJob(this.sholdGetGoldNum);
        });
      }else{
        this.tips.tryAgain(()=>{
          this.previewHandle(true);
        });
      }
    }

    private initAnims () : void {
        this.tweens.add({
          targets : [this.goldObj,this.smallFishMenu,this.smallFishText,this.timerObj,this.timerText],
          ease : 'Sine.easeInOut',
          x : `-=${200}`,
          duration : 800
        });
        this.tweens.add({
          targets : this.leftPopArr,
          ease : 'Sine.easeInOut',
          x : `+=${200}`,
          duration : 800
        })
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private nextWordHandle() : void { 
      this.currentIndex = this.currentIndex + 1 > this.ccData.length - 1 ? 0 : this.currentIndex + 1 ;
      this.previewHandle();
    }

    private renderLeftUI(init : boolean) : void {
      for(let i = 0 ; i < this.ccData[this.currentIndex].phoneticSymbols.length; i ++ ){
        this.leftPopArr.push(
          this.add.image(55 - (init ? 200 : 0 ),H - 145 - ((i) * 65),'game8Icons2',`smallPop${i + 1}.png`)
            .setOrigin(.5)
            .setDisplaySize(60,60)
        )
      }
    }

    private renderFishAndTimer () : void {
      this.goldObj.x = this.goldObj.x + 200;
      this.smallFishMenu = this.add.image(971.45 + 200,339.25,'game8Icons2','smf.png').setOrigin(.5).setDisplaySize(75,66);
      this.smallFishText = this.add.text(this.smallFishMenu.x + 4,this.smallFishMenu.y + 19,`0/${this.ccData.length}`,{
        font: 'Bold 16px Arial Rounded MT',
        fill : '#ffffff',
      }).setOrigin(.5);
      this.timerObj = this.add.image(971.45 + 200,244.5,'game8Icons2','timeout.png').setOrigin(.5);
      this.timerText = this.add.text(this.timerObj.x - 15,this.timerObj.y + 9,this.s_to_hs(this.timerNum),{
        fontSize: "14px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#ffffff'
      })
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

    private previewHandle (isStart : boolean = false) : void {
      //恢复操作
      if(this.previewLock) return;
      isStart && (this.currentIndex = 0 );
      isStart && (this.timerNum = timerNumber);
      isStart && (this.smallFishNum = 0 );
      isStart && this.smallFishText.setText(`${this.smallFishNum}/${this.ccData.length}`);
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
      this.renderCenterWord();
      this.popShowAnims(()=>{
        this.timeDownHandle(); //倒计时任务开启
        this.playMusic(this.ccData[this.currentIndex].id);
      });
      this.renderLeftUI(false);
      //@ts-ignore
      this.itemClickHandle.clickLock = false;
    }

    private renderTimeout (cb : Function) : void {
      const clearMask = ()=>{
        this.graphicsObj && this.graphicsObj.destroy();
        this.graphicsObj = null;
        this.timeoutText && this.timeoutText.destroy();
        this.timeoutText = null;
        this.timeoutObj && this.timeoutObj.destroy();
        this.timeoutObj = null;
      }
      //@ts-ignore
      !this.renderTimeout.time && (this.renderTimeout.time = 4);
      //@ts-ignore
      if(--this.renderTimeout.time === 0){
        clearMask();
        //@ts-ignore
        this.renderTimeout.time = 4;
        cb.call(this);
        return;
      }
      clearMask();
      this.graphicsObj = this.add.graphics();
      this.graphicsObj.fillStyle(0x000000,.8);
      this.graphicsObj.fillRect(0,0,1024,552).setDepth(1999);
      this.timeoutObj = this.add.image(W/ 2 , H / 2 ,'game8Icons2','civa.png').setDepth(2000);
      //@ts-ignore
      this.timeoutText = this.add.text(this.timeoutObj.x , this.timeoutObj.y , this.renderTimeout.time + '' , {
        fontSize: "100px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#ffffff'
      }).setOrigin(.5).setScale(0).setDepth(2001);
      this.tweens.timeline({
        targets : this.timeoutText,
        ease : 'Sine.easeInOut',
        duration :200,
        tweens : [
          {
            scaleX : 1.2,
            scaleY : 1.2,
          },
          {
            scaleX : 0.9,
            scaleY : 0.9,
          },
          {
            scaleX : 1,
            scaleY : 1,
          }
        ],
        onComplete : ()=>{
          this.time.addEvent({
            delay : 400,
            callback : ()=>{
              this.renderTimeout(cb);
            }
          })
        }
      });
    }

    private popShowAnims (cb : Function) : void {
      //中间气泡显示动画
      this.previewLock = true;
      this.time.addEvent({
        delay : 500,
        callback : ()=>{
          this.popArr.map((r : Phaser.GameObjects.Image,i : number)=>{
            this.time.addEvent({
              delay : i * 50,
              callback : ()=>{
                this.tweens.timeline({
                  targets : r,
                  ease : 'Sine.easeInOut',
                  duration : 250,
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
                });
                this.tweens.timeline({
                  targets : this.textArr[i],
                  ease : 'Sine.easeInOut',
                  duration : 250,
                  tweens : [
                    {
                      scaleX : 1.15,
                      scaleY : 1.15
                    },
                    {
                      scaleX : 0.85,
                      scaleY : 0.85
                    },
                    {
                      scaleX : 1,
                      scaleY : 1
                    }
                  ],
                });
              }
            })
          });
        }
      })
      this.time.addEvent({
        delay : 700,
        callback : ()=>{
          cb.call(this);
        }
      })
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
      //@ts-ignore
      if(!args[1] || args[1].length <= 0 ||  args[1][0].frame.name !== 'bigPop.png' || this.itemClickHandle.clickLock) return;
      //@ts-ignore
      this.itemClickHandle.clickLock = true;
      let obj = args[1][0];
      const name : string = obj.getData('name');
      if(this.ccData[this.currentIndex].phoneticSymbols[this.leftUiIndex + 1].name === name){
        //正确
        this.moveToHandle(obj);
      }else{
        //错误
        this.clickErrorWord(obj);
      }
    }

    private clickErrorWord(obj : Phaser.GameObjects.Image) : void {
      let index : number = obj.getData('index');
      const name : string = obj.getData('name');
      const id : string = obj.getData('id');
      let wrongObj = this.add.image(this.timerObj.x + 3 , this.timerObj.y + 20, 'game8Icons2', 'error.png').setOrigin(.5).setAlpha(1);
      this.tweens.timeline({
        targets : wrongObj,
        ease : 'Sine.easeInOut',
        duration :300,
        tweens : [
          {
            y : '-=20',
            alpha : 1,
          },
          {
            y : '-=20',
            alpha : 0,
          }
        ],
        onComplete : ()=>{
          wrongObj.destroy();
        }
      });
      this.tweens.timeline({
        targets : [obj , this.textArr[index]],
        ease : 'Sine.easeInOut',
        duration :100,
        tweens : [
          {
            x : '+=20',
          },
          {
            x : '-=40'
          },
          {
            x : '+=30'
          },
          {
            x : '-=10'
          }
        ],
        onComplete : ()=>{
          //@ts-ignore
          this.itemClickHandle.clickLock = false;
          this.timerEvent && (this.timerEvent.paused = true);
          this.timerNum -= 2;
          if(this.timerNum <= 0 ){
            this.timerNum = 0 ;
          }
          this.timerText.setText(this.s_to_hs(this.timerNum));
          this.timerEvent && (this.timerEvent.paused = false);
        }
      });
      
    }

    private renderCenterWord() : void {
      //渲染中间的单词
      this.centerWordObj = this.add.graphics().setAlpha(0);
      this.centerWordObj.fillStyle(0xffffff);
      this.centerWordObj.fillRoundedRect(W / 2 - 112.5, 149, 225 , 100 ,53);
      this.centerWordText = this.add.text(W / 2, 199 , '' , {
        fontSize: "60px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#0F6BEF'
      }).setOrigin(.5).setAlpha(0);
      this.bigFish = this.add.image(W / 2 , H / 2 , 'game8Icons2', 'bmf.png').setOrigin(.5).setAlpha(0);
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
      this.bait.play('begin');
      this.tweens.add({
        targets : [obj , this.textArr[index]],
        displayHeight : 0,
        displayWidth : 0,
        alpha : 0 ,
        duration : 200,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.textArr[index].destroy();
          obj.destroy();
          this.popArr[index] = null;
          this.createSmallPopHandle(name);
          if(this.leftUiIndex === this.ccData[this.currentIndex].phoneticSymbols.length - 1){
            let flag = true;
            this.choosePopArr.length = this.ccData[this.currentIndex].phoneticSymbols.length;
            this.choosePopArr.map((r,i)=>{
              if(r.getData('name') !== this.ccData[this.currentIndex].phoneticSymbols[i].name){
                flag = false;
              }
            });
            if(flag){
              //正确
              this.time.addEvent({
                delay : 600,
                callback : ()=>{
                  this.chooseEndHandle();
                }
              })
            }else{
              //错误
              this.tips.tryAgain(this.previewHandle);
            }
          }else{
            //@ts-ignore
            this.itemClickHandle.clickLock = false;
          }
        }
      })
    }

    private createSmallPopHandle (name : string) : void {
      //选择相应气泡 渲染到左边
      this.choosePopArr[this.leftUiIndex] = this.add.image(this.leftPopArr[this.leftUiIndex].x,this.leftPopArr[this.leftUiIndex].y,'game8Icons2','smallPop.png')
                                                .setOrigin(.5)
                                                .setDisplaySize(0,0)
                                                .setDepth(100)
                                                .setData('name',name);
      this.chooseTextArr[this.leftUiIndex] = this.add.text(this.choosePopArr[this.leftUiIndex].x,this.choosePopArr[this.leftUiIndex].y,name,{
        font: 'Bold 23px Arial Rounded MT',
        fill : '#017FF8',
      }).setOrigin(.5).setDepth(101).setScale(0);
      this.leftPopArr[this.leftUiIndex].destroy();
      this.tweens.timeline({
        targets : [this.chooseTextArr[this.leftUiIndex]],
        ease : 'Sine.easeInOut',
        duration :200,
        tweens : [
          {
            scaleX : 1.1,
            scaleY : 1.1,
          },
          {
            scaleX : 0.9,
            scaleY : 0.9,
          },
          {
            scaleX : 1,
            scaleY : 1,
          }
        ]
      });
      this.tweens.timeline({
        targets : [this.choosePopArr[this.leftUiIndex]],
        ease : 'Sine.easeInOut',
        duration :200,
        tweens : [
          {
            displayWidth : 65,
            displayHeight : 65,
          },
          {
            displayWidth : 55,
            displayHeight : 55,
          },
          {
            displayWidth : 60,
            displayHeight : 60,
          }
        ]
      });
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
      //@ts-ignore
      this.itemClickHandle.clickLock = true;
      this.playMusic(this.ccData[this.currentIndex].id);
      this.timerEvent.paused = true; //暂停计时器
      this.tweens.add({
        targets : [...this.popArr,...this.textArr],
        ease : 'Sine.easeInOut',
        duration : 300,
        alpha : 0,
        onComplete : ()=>{
          this.popArr.map((r,i)=>{
            r && r.destroy();
          });
          this.textArr.map((r,i)=>{
            r && r.destroy();
          })
        }
      });
      let firstLeft = (W - (this.choosePopArr.length * 134 + (this.choosePopArr.length - 1) * 10)) / 2 + 67;
      this.choosePopArr.map((r,i)=>{
        this.tweens.add({
          targets : this.chooseTextArr[i],
          ease : 'Sine.easeInOut',
          duration : 300,
          y : 336, 
          x : i === 0 && firstLeft || (firstLeft + ((i) * 10) + (i) * 134) ,
          onComplete : ()=>{
            this.chooseTextArr[i].setFontSize(60);
          }
        });
        this.tweens.add({
          targets : r,
          ease : 'Sine.easeInOut',
          duration : 300,
          y : 336, 
          x : i === 0 && firstLeft || (firstLeft + ((i) * 10) + (i) * 134) ,
          displayWidth : 134,
          displayHeight : 134
        });
      });
      this.centerWordText.setText(this.ccData[this.currentIndex].name);
      this.tweens.add({
        targets : [this.centerWordObj,this.centerWordText],
        ease : 'Sine.easeInOut',
        duration : 300,
        alpha : 1 ,
      });
      this.time.addEvent({
        delay : 2000,
        callback : ()=>{
          this.tweens.add({
            targets : [this.centerWordObj,this.centerWordText],
            ease : 'Sine.easeInOut',
            duration : 300,
            alpha : 0 ,
          });
          this.tweens.add({
            targets : [...this.choosePopArr,...this.chooseTextArr],
            ease : 'Sine.easeInOut',
            duration : 300,
            y : H / 2, 
            x : W / 2  ,
            alpha : 0
          });
          this.tweens.add({
            targets : this.bigFish,
            ease : 'Sine.easeInOut',
            duration : 300,
            alpha : 1,
            onComplete : ()=>{
              this.time.addEvent({
                delay : 500,
                callback : ()=>{
                  this.tweens.add({
                    targets : this.bigFish,
                    ease : 'Sine.easeInOut',
                    duration : 500,
                    x : this.smallFishMenu.x,
                    y : this.smallFishMenu.y,
                    displayWidth : 75, 
                    displayHeight : 63,
                    onComplete : ()=>{
                      //@ts-ignore
                      this.itemClickHandle.clickLock = false;
                      this.smallFishText.setText(`${++this.smallFishNum}/${this.ccData.length}`);
                      if(this.smallFishNum === this.ccData.length){
                        this.timerEvent.paused = true;
                        this.sholdGetGoldNum += 2;
                        this.tips.success(()=>{
                          let goldAnims = new SellingGold(this,{
                            callback : ()=>{
                              this.goldObj.setText(this.currentGoldNum+=this.sholdGetGoldNum);
                              this.previewHandle(true);
                            }
                          });
                          goldAnims.golds.setDepth(101);
                          goldAnims.goodJob(this.sholdGetGoldNum);
                        });
                        this.bigFish.destroy();
                        this.centerWordObj.destroy()
                        this.centerWordText.destroy();
                        this.bigFish = null ;
                        this.centerWordObj = null;
                        this.centerWordText = null;
                        return;
                      }
                      this.bigFish.destroy();
                      this.centerWordObj.destroy()
                      this.centerWordText.destroy();
                      this.bigFish = null ;
                      this.centerWordObj = null;
                      this.centerWordText = null;
                      this.nextWordHandle();
                    }
                  })
                }
              })
            }
          })
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
      let contentData = this.ccData[this.currentIndex].phoneticSymbols.concat(this.ccData[this.currentIndex].uselessPhoneticSymbols.slice(0,9 - this.ccData[this.currentIndex].phoneticSymbols.length));
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
          }).setOrigin(.5).setAlpha(1).setScale(0)
        )
      }
    }

    update(time: number , delta : number): void {
    }
  };

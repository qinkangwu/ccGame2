import 'phaser';
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import TipsParticlesEmitter from "../../Public/TipsParticlesEmitter";
import { Gold } from "../../Public/jonny/components/Gold";
import { SellingGold } from "../../Public/jonny/components/SellingGold";

const W = 1024;
const H = 552;
const data = ['banana','apple','banana','apple','scene','text','scene','text']

export default class Game14PlayScene extends Phaser.Scene {
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private mode1 : Phaser.GameObjects.Image; //4牌模式
    private mode2 : Phaser.GameObjects.Image; //8牌模式
    private chooseMode : string = 'mode1' ; //选择的模式
    private cardArr : Phaser.GameObjects.Quad[] = [] ; //牌数组
    private wordArr : Phaser.GameObjects.Text[] = [] ; //字符数组
    private picArr : Phaser.GameObjects.Image[] = [] ; //图片数组
    private zoneArr : Phaser.GameObjects.Zone[] = [] ; //点击区域数组
    private clickLock : boolean = false ; //点击锁
    private chooseCardIndexArr : number[] = [] ; //选择的索引数组
    private tips : TipsParticlesEmitter; //tip组件
    private errorNum : number = 0; //失败次数
    private goldObj : Gold ; //金币组件引用
    private currentGoldNum : number = 10 ; //当前的金币数量
    private sholdGetGoldNum : number = 3 ; //应获取的金币数量
    private sholdTry : boolean = true; //能否再试
    constructor() {
      super({
        key: "Game14PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
      TipsParticlesEmitter.loadImg(this);
      Gold.loadImg(this);
      SellingGold.loadImg(this); //全局组件加载Img
    }
    
  
    create(): void {
      this.createBgm(); //背景音乐
      this.createBgi();
      new CreateBtnClass(this,{
        bgm : this.bgm,
      }); //公共按钮组件
      this.tips = new TipsParticlesEmitter(this); //tip组件
      this.createMode(); //模式按钮
      this.goldObj = new Gold(this,this.currentGoldNum).setDepth(100);
      this.add.existing(this.goldObj);
      this.input.on('pointerdown',(...args)=>{
        console.log(args);
      })
    }

    private createMode() : void {
      this.mode1 = this.add.image(512,160.25,'mode1').setOrigin(.5).setScale(.5).setInteractive();
      this.mode2 = this.add.image(512,367.75,'mode2').setOrigin(.5).setScale(.5).setInteractive();
      this.mode1.on('pointerdown',this.chooseModeEndHandle.bind(this,'mode1'));
      this.mode2.on('pointerdown',this.chooseModeEndHandle.bind(this,'mode2'));
    }



    private createMode1() : void {
      //4牌模式
      this.cardArr.push(
        this.add.quad(142,299 - H,'pics','pic2.png').setDisplaySize(218,326).setInteractive().setFrame('pic1.png'),
        this.add.quad(389,253.5 - H,'pics','pic2.png').setDisplaySize(218,326).setInteractive().setFrame('pic1.png'),
        this.add.quad(636.5,299 - H,'pics','pic2.png').setDisplaySize(218,326).setInteractive().setFrame('pic1.png'),
        this.add.quad(883.5,253.5 - H,'pics','pic2.png').setDisplaySize(218,326).setInteractive().setFrame('pic1.png')
      );
      this.cardArr.map((r,i)=>{
        this.wordArr.push(this.add.text(this.cardArr[i].x,this.cardArr[i].y,data[i],{
          fontSize: "38.5px",
          fontFamily:"Arial Rounded MT Bold",
          fill : '#2773F2',
        }).setOrigin(.5).setResolution(2).setAlpha(0))
        this.zoneArr.push(this.add.zone(this.cardArr[i].x,this.cardArr[i].y,218,326).setOrigin(.5).setDepth(1).setInteractive());
      })
      this.tweens.add({
        targets : [...this.cardArr,...this.wordArr,...this.zoneArr],
        y : `+=${H}`,
        duration : 500,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.time.addEvent({
            delay : 600,
            callback : ()=>{
              this.cardArr.map((r,i)=>{
                this.tweens.add({
                  targets : r,
                  topLeftX : `+=218`,
                  topRightX : `-=218`,
                  bottomLeftX : '+=218',
                  bottomRightX : `-=218`,
                  duration : 300,
                  ease : 'Sine.easeInOut',
                  onComplete : ()=>{
                    r.setFrame('pic2.png');
                    this.tweens.add({
                      targets : r,
                      topLeftX : `-=218`,
                      topRightX : `+=218`,
                      bottomLeftX : '-=218',
                      bottomRightX : `+=218`,
                      duration : 300,
                      ease : 'Sine.easeInOut',
                      onComplete : ()=>{
                        this.wordArr[i].alpha = 1;
                        this.time.addEvent({
                          delay : 1500,
                          callback : ()=>{
                            this.wordArr[i].alpha = 0 ;
                            this.tweens.add({
                              targets : r,
                              topLeftX : `+=218`,
                              topRightX : `-=218`,
                              bottomLeftX : '+=218',
                              bottomRightX : `-=218`,
                              duration : 300,
                              ease : 'Sine.easeInOut',
                              onComplete : ()=>{
                                r.setFrame('pic1.png');
                                this.tweens.add({
                                  targets : r,
                                  topLeftX : `-=218`,
                                  topRightX : `+=218`,
                                  bottomLeftX : '-=218',
                                  bottomRightX : `+=218`,
                                  duration : 300,
                                  ease : 'Sine.easeInOut',
                                  onComplete : ()=>{
                                    this.zoneArr[i].on('pointerdown',this.flipCardHandle.bind(this,'mode1',i));
                                  }
                                });
                              }
                            });
                          }
                        })
                      }
                    });
                  }
                })
              })
            }
          })
        }
      });
      
    }

    private flipCardHandle (mode : string , index : number) : void {
      //点击翻转卡片
      if(this.cardArr[index].frame.name === 'pic2.png' || this.clickLock || this.chooseCardIndexArr.length === 2) return;
      this.playMusic('clickMp3');
      this.clickLock = true;
      this.chooseCardIndexArr.push(index);
      this.tweens.add({
        targets : this.cardArr[index],
        duration : 300,
        ease : 'Sine.easeInOut',
        topLeftX : `+=218`,
        topRightX : `-=218`,
        bottomLeftX : '+=218',
        bottomRightX : `-=218`,
        onComplete : ()=>{
          this.cardArr[index].setFrame('pic2.png');
          this.tweens.add({
            targets : this.cardArr[index],
            duration : 300,
            ease : 'Sine.easeInOut',
            topLeftX : `-=218`,
            topRightX : `+=218`,
            bottomLeftX : '-=218',
            bottomRightX : `+=218`,
            onComplete : ()=>{
              this.wordArr[index].alpha = 1;
              this.clickLock = false ;
              if(this.chooseCardIndexArr.length === 2){
                if(this.wordArr[this.chooseCardIndexArr[0]].text === this.wordArr[this.chooseCardIndexArr[1]].text){
                  this.time.addEvent({
                    delay : 500,
                    callback : ()=>{
                      this.successHandle();
                    }
                  })
                }else{
                  this.time.addEvent({
                    delay : 500,
                    callback : ()=>{
                      this.errorHandle();
                    }
                  })
                }
              }
            }
          });
        }
      })
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private clearHandle () : void {
      this.cardArr.length = 0;
      this.wordArr.length = 0;
      this.zoneArr.length = 0;
    }

    private successHandle () : void {
      //匹配正确
      this.playMusic('successMp3');
      this.chooseCardIndexArr.map((r,i)=>{
        this.cardArr[r].destroy();
        this.wordArr[r].destroy();
        this.zoneArr[r].destroy();
      });
      if(this.cardArr.every((r)=>{
        return r.active === false
      })){
        this.tips.success(()=>{
          let goldAnims = new SellingGold(this,{
            callback : ()=>{
              goldAnims.golds.destroy();
              this.goldObj.setText(this.currentGoldNum+=this.sholdGetGoldNum);
              this.sholdGetGoldNum = 3;
              this.clearHandle();
              this.chooseMode === 'mode1' && this.createMode1();
              this.chooseMode === 'mode2' && this.createMode2();
            }
          });
          goldAnims.golds.setDepth(101);
          goldAnims.goodJob(this.sholdGetGoldNum);
        })
      }
      this.chooseCardIndexArr.length = 0;
    }

    private errorHandle() : void {
      //匹配错误
      this.playMusic('wrongMusic');
      this.errorNum ++ ;
      if((this.chooseMode === 'mode1' && this.errorNum >= 3) || (this.chooseMode === 'mode2' && this.errorNum >= 10) ){
        //错误到了一定次数
        this.sholdTry && this.tips.tryAgain(this.tryAgain.bind(this));
        !this.sholdTry && this.tipsErrorHandle();
        return;
      };
      this.errorDetail();
    }

    private tipsErrorHandle() : void {
      this.goldObj.setText(this.currentGoldNum -= 1);
      this.tips.error(()=>{

      },this.tryAgain.bind(this))
    }

    private tryAgain() : void {
      this.sholdTry = false;
      this.sholdGetGoldNum = 1;
      this.errorNum = 0;
      this.errorDetail();
    }

    private errorDetail () : void {
      this.chooseCardIndexArr.map((r,i)=>{
        this.wordArr[r].alpha = 0;
        this.tweens.add({
          targets : this.cardArr[r],
          duration : 300,
          ease : 'Sine.easeInOut',
          topLeftX : `+=218`,
          topRightX : `-=218`,
          bottomLeftX : '+=218',
          bottomRightX : `-=218`,
          onComplete : ()=>{
            this.cardArr[r].setFrame('pic1.png');
            this.tweens.add({
              targets : this.cardArr[r],
              duration : 300,
              ease : 'Sine.easeInOut',
              topLeftX : `-=218`,
              topRightX : `+=218`,
              bottomLeftX : '-=218',
              bottomRightX : `+=218`,
            })
          }
        })
      })
      this.chooseCardIndexArr.length = 0 ;
    }

    private createMode2() : void {
      //8牌模式
      for(let i = 0 ; i < 8 ; i ++){
        if(i < 4){
          this.cardArr.push(
            this.add.quad(234.5 + (i * 185 ),146.5 - H,'pics','pic1.png').setDisplaySize(150,224)
          )
        }else{
          this.cardArr.push(
            this.add.quad(234.5 + ((i - 4) * 185 ),405.5 - H,'pics','pic1.png').setDisplaySize(150,224)
          )
        }
        this.wordArr.push(this.add.text(this.cardArr[i].x,this.cardArr[i].y,data[i],{
          fontSize: "29.5px",
          fontFamily:"Arial Rounded MT Bold",
          fill : '#2773F2',
        }).setOrigin(.5).setResolution(2).setAlpha(0));
        this.zoneArr.push(this.add.zone(this.cardArr[i].x,this.cardArr[i].y,150,224).setOrigin(.5).setDepth(1).setInteractive());
      }
      this.tweens.add({
        targets : [...this.cardArr,...this.wordArr,...this.zoneArr],
        duration : 500,
        y : `+=${H}`,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.time.addEvent({
            delay : 600,
            callback : ()=>{
              this.cardArr.map((r,i)=>{
                this.tweens.add({
                  targets : r,
                  duration : 300,
                  ease : 'Sine.easeInOut',
                  topLeftX : `+=218`,
                  topRightX : `-=218`,
                  bottomLeftX : '+=218',
                  bottomRightX : `-=218`,
                  onComplete : ()=>{
                    r.setFrame('pic2.png');
                    this.tweens.add({
                      targets : r,
                      duration : 300,
                      ease : 'Sine.easeInOut',
                      topLeftX : `-=218`,
                      topRightX : `+=218`,
                      bottomLeftX : '-=218',
                      bottomRightX : `+=218`,
                      onComplete : ()=>{
                        this.wordArr[i].alpha = 1 ;
                        this.time.addEvent({
                          delay : 1500,
                          callback : ()=>{
                            this.wordArr[i].alpha = 0 ;
                            this.tweens.add({
                              targets : r,
                              duration : 300,
                              ease : 'Sine.easeInOut',
                              topLeftX : `+=218`,
                              topRightX : `-=218`,
                              bottomLeftX : '+=218',
                              bottomRightX : `-=218`,
                              onComplete : ()=>{
                                r.setFrame('pic1.png');
                                this.tweens.add({
                                  targets : r,
                                  duration : 300,
                                  ease : 'Sine.easeInOut',
                                  topLeftX : `-=218`,
                                  topRightX : `+=218`,
                                  bottomLeftX : '-=218',
                                  bottomRightX : `+=218`,
                                  onComplete : ()=>{
                                    this.zoneArr[i].on('pointerdown',this.flipCardHandle.bind(this,'mode2',i));
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              })
            }
          })
        }
      })
    }

    private chooseModeEndHandle(mode : string) : void {
      this.chooseMode = mode;
      this.tweens.add({
        targets : mode === 'mode1' ? [this.mode1] : this.mode2,
        duration : 300,
        scaleX : .6,
        scaleY : .6,
        ease : 'Sine.easeInOut',
        yoyo : true,
        onComplete : ()=>{
          this.tweens.add({
            targets : [this.mode1,this.mode2],
            duration : 500,
            y : `-=${W}`,
            ease : 'Sine.easeInOut',
            onComplete : ()=>{
              mode === 'mode1' && this.createMode1();
              mode === 'mode2' && this.createMode2();
            }
          })
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

    private createBgi () : void {
      //背景
      this.add.image(0,0,'bgi').setDisplaySize(W,H).setOrigin(0);
    }

    update(time: number , delta : number): void {
    }
  };
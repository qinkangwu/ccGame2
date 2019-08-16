import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';

export default class Game8PlayScene extends Phaser.Scene {
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private createBtnClass : CreateBtnClass ; //按钮组件返回
    private bait : Phaser.GameObjects.Sprite; //鱼饵
    private popArr : Phaser.GameObjects.Image[] = []; //气泡集合
    private textArr : Phaser.GameObjects.Text[] = []; //文字集合
    private leftPopArr : Phaser.GameObjects.Image[] = []; //左边ui气泡集合
    private smallFishMenu : Phaser.GameObjects.Image; //小鱼索引
    private smallFishText : Phaser.GameObjects.Text; //小鱼文本
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
      }); //遮罩层
      this.createBgi(); //创建背景
      this.createBgm(); //创建背景音乐
      this.createBtnClass = new CreateBtnClass(this,{
        playBtnCallback : ()=>{},
        bgm : this.bgm,
        previewCallback : ()=>{},
        playBtnPosition : {
          y : window.innerHeight - 55,
          x : 55,
          alpha : 1
        }
      }); //按钮公共组件

      this.renderCenterPop(); //渲染中间的泡泡

      this.renderLeftUI(); //渲染左边的ui
    }

    private renderLeftUI() : void {
      for(let i = 0 ; i < 4; i ++ ){
        this.leftPopArr.push(
          this.add.image(55,window.innerHeight - 145 - ((i) * 65),'game8Icons2',`smallPop${i + 1}.png`)
            .setOrigin(.5)
            .setDisplaySize(60,60)
        )
      }

    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .3
      })
    }

    private createBgi () : void {
      //背景
      this.add.image(0,0,'bgi').setDisplaySize(window.innerWidth,window.innerHeight).setOrigin(0);
      this.bait = this.add.sprite(window.innerWidth * 0.9086,window.innerHeight * 0.8324 ,'game8Icons','bait1.png')
        .setOrigin(.5)
        .setDisplaySize(window.innerWidth * 0.0166,window.innerHeight * 0.1177);
      this.smallFishMenu = this.add.image(55.5,143.5,'game8Icons2','smf.png').setOrigin(.5);
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

    private renderCenterPop () : void {
      //渲染中间的泡泡
      for (let i = 0 ; i < 9 ; i ++ ){
        if(i < 3){
          this.popArr.push(
            this.add.image(window.innerWidth / 2 + (-185 + (i * 185)),window.innerHeight / 2 - 173 ,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setDisplaySize(135,135)
          )
        }else if(i >= 3 && i < 6){
          this.popArr.push(
            this.add.image(window.innerWidth / 2 + (-185 + ((i - 3) * 185)),window.innerHeight / 2,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setDisplaySize(135,135)
          )
        }else{
          this.popArr.push(
            this.add.image(window.innerWidth / 2 + (-185 + ((i - 6) * 185)),window.innerHeight / 2 + 173,'game8Icons2','bigPop.png')
              .setOrigin(.5)
              .setData('index',i)
              .setDisplaySize(135,135)
          )
        }
        this.textArr.push(
          this.add.text(this.popArr[i].x,this.popArr[i].y,'/i/',{
            font: 'Bold 60px Arial Rounded MT',
            fill : '#0080F5',
          }).setOrigin(.5)
        )
      }
    }

    update(time: number , delta : number): void {
    }
  };
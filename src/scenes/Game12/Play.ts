import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';

const W = 1024;
const H = 552;

export default class Game12PlayScene extends Phaser.Scene {
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private itemArr : Phaser.Physics.Arcade.Image[] = [] ; //外星人数组
    private itemTextArr : Phaser.GameObjects.Text[] = [] ; //外星人文本数组
    private leftContetn : Phaser.Physics.Arcade.Image ; //左边飞船
    private rightContent : Phaser.Physics.Arcade.Image ; //右边飞船
    private leftContentText : Phaser.GameObjects.Text; //左边飞船文本
    private rightContentText : Phaser.GameObjects.Text; //右边飞船文本
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
    constructor() {
      super({
        key: "Game12PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      this.createBgi(); //背景
      this.createBgm(); //背景音乐
      this.createTopContent() ; //创建上面的内容
      this.createContent(); //创建下面的内容
      new CreateBtnClass(this,{
        bgm : this.bgm,
      }); //公共按钮组件
      this.initAnims(); //初始化动画
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
                if(this.isOverlap){
                  //重叠
                  this.itemArr[i].destroy();
                  this.itemTextArr[i].destroy();
                  this.itemArr.splice(i,1);
                  this.itemTextArr.splice(i,1);
                  this.max -= 1;
                  console.log(this.overlapIndex,'overlapIndex');
                  if(this.itemArr.length === 0 ){
                    console.log('数据处理完毕');
                  }else{
                    this.chooseItemHandle();
                  }
                }else{
                  //不重叠
                  this.resetItemObj(i);
                }
              }
            })
          });
        }
      });
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
      this.leftContentText = this.add.text(this.leftContetn.x , this.leftContetn.y , '/b/', {
        fontSize: "79px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#ffffff',
      }).setOrigin(.5).setAlpha(0);
      this.rightContentText = this.add.text(this.rightContent.x , this.rightContent.y , '/p/', {
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
          this.isOverlap = true;
          this.overlapIndex = args[1].getData('index');
        }
      })
    }

    private createContent () : void {
      for(let i = 0 ; i < 10 ; i ++){
        if(i < 5){
          this.itemArr.push(this.physics.add.image(149.5 + (i * 115) + (i * 63),328.5 - W,'content').setOrigin(.5).setInteractive({draggable : true}).setData('index',i));
        }else{
          this.itemArr.push(this.physics.add.image(149.5 + ((i - 5) * 115) + ((i - 5) * 63),468.5 - W,'content').setOrigin(.5).setInteractive({draggable : true}).setData('index',i));
        }
        this.itemTextArr.push(this.add.text(this.itemArr[i].x,this.itemArr[i].y + 18,'banana',{
          fontSize: "26px",
          fontFamily:"Arial Rounded MT Bold",
          fill : '#ED6C35',
        }).setOrigin(.5).setAlpha(0));
      }
    }

    update(time: number , delta : number): void {
    }
  };
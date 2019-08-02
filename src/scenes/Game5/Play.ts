import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';

export class Game5PlayScene extends Phaser.Scene {
    private backToListBtn : Phaser.GameObjects.Image ; //返回列表按钮
    private clearDrawBtn : Phaser.GameObjects.Image; //清除按钮
    private sketch : Phaser.GameObjects.Image ; //画板
    private civa : Phaser.GameObjects.Sprite ; //civa
    private wordsObj : Phaser.GameObjects.Text; //单词板
    private wordsNumObj : Phaser.GameObjects.Text; //单词索引
    private playVideo : Phaser.GameObjects.Sprite; //播放视频按钮
    private penObj : Phaser.GameObjects.Sprite; //画笔
    private area : Phaser.GameObjects.RenderTexture; //绘制区域
    private timer : number ; //定时器id
    private moveToX : number ; //当前move的x
    private moveToY : number ; //当前move的y
    private lineObj : Phaser.GameObjects.Graphics ; //画的单词
    constructor() {
      super({
        key: "Game5PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      this.createBgi(); //背景
      this.createBtn(); //按钮
      this.createSketch(); //创建画板
      this.createCiva() ; //创建civa
      this.createMask(); //展示遮罩
    }

    private wordsAnims () : void {
      //words展示动画
      this.tweens.add({
        targets : [this.civa,this.wordsObj,this.wordsNumObj,this.playVideo],
        y : `+=${window.innerHeight}`,
        ease: 'Sine.easeInOut',
        duration : 500,
      })
    }
    
    private createCiva () : void {
      //创建civa
      this.civa = this.add.sprite(107 , -window.innerHeight ,'civa').setOrigin(0).setDisplaySize(267 , 528);
      this.wordsObj = this.add.text(this.civa.x + this.civa.width / 2,this.civa.y + 230,'Aa',{
        font: 'Bold 115px Arial Rounded MT',
        fill : '#856EB4',
      }).setOrigin(0.5);
      this.wordsNumObj = this.add.text(this.civa.x + this.civa.width / 2 , this.civa.y + this.civa.height / 2 + 40,'2/3',{
        font: '20px Arial Rounded MT',
        fill : '#D5D2EF',
      }).setOrigin(.5);
      this.playVideo = this.add.sprite(this.civa.x + 220,this.civa.y + 170,'icons','btn_vedio／02.png').setOrigin(.5).setDisplaySize(35,35);
    }

    private createSketch () : void {
      //创建画板
      this.sketch = this.add.image(window.innerWidth - 347,window.innerHeight / 2,'sketch').setOrigin(.5).setDisplaySize(529,552);
      this.add.image(this.sketch.x,this.sketch.y + 211,'icons','btn_tijiao.png').setOrigin(.5);
      this.add.image(this.sketch.x,this.sketch.y,'line').setOrigin(.5).setDisplaySize(317,247);
      this.penObj = this.add.sprite(this.sketch.x,this.sketch.y,'pen').setOrigin(0).setDepth(1001).setAlpha(0);
      this.area = this.add.renderTexture(this.sketch.x - this.sketch.width / 2 + 70,this.sketch.y - 150,400,300).setOrigin(0).setInteractive();
    }

    private initEmitHandle () : void {
      this.area.on('pointerdown',this.pointerHandle.bind(this,'down'));
      this.area.on('pointermove',this.pointerHandle.bind(this,'move'));
      this.area.on('pointerup',this.pointerEndHandle.bind(this,'end'));
      this.backToListBtn.on('pointerdown',this.backToListHandle.bind(this));
      this.clearDrawBtn.on('pointerdown',this.clearDrawHandle.bind(this));
    }

    private pointerHandle(...args) : void {
      //绘制
      if(!args[1]) return;
      clearTimeout(this.timer);
      let handle : string = args[0];
      let pointerObj : Phaser.Input.Pointer = args[1];
      handle === 'down' && (this.moveToX = pointerObj.x);
      handle === 'down' && (this.moveToY = pointerObj.y);
      this.penObj.setAlpha(1).setX(pointerObj.x - 30).setY(pointerObj.y);
      this.drawHandle(pointerObj.x,pointerObj.y); //绘制 
      this.timer = setTimeout(()=>{
        this.penObj.setAlpha(0);
      },500)
    }

    private drawHandle (x : number , y : number) : void {
      //书写中
      this.lineObj = this.lineObj || this.add.graphics();
      this.lineObj.setDepth(1000);
      this.lineObj.lineStyle(7, 0x8557B9, 1.0);
      this.lineObj.beginPath();
      this.lineObj.moveTo(this.moveToX, this.moveToY);
      this.lineObj.lineTo(x, y);
      this.moveToX = x;
      this.moveToY = y;
      this.lineObj.closePath();
      this.lineObj.strokePath();
    }

    private backToListHandle() : void {
      //返回游戏列表
      window.location.href = window.location.origin;
    }

    private clearDrawHandle() : void {
      //清除绘制线条
      this.lineObj.destroy();
      this.lineObj = null;
      this.clearDrawBtn.alpha = 1;
      this.tweens.add({
        targets : this.clearDrawBtn,
        delay : 3000,
        alpha : .6,
        ease: 'Sine.easeInOut',
        duration : 500
      })
    }

    private pointerEndHandle(...args) : void {
      //@ts-ignore
      this.penObj.alpha = 0;
    }

    private createBtn () : void {
      //创建按钮
      this.backToListBtn = this.add.image(25,25,'icons','btn_exit.png').setOrigin(0).setAlpha(.6).setDisplaySize(60,60).setInteractive();
      this.clearDrawBtn = this.add.image(25,window.innerHeight - 175,'icons','btn_shangyibu.png').setOrigin(0).setAlpha(.6).setDisplaySize(60,60).setInteractive();
      this.add.image(25,window.innerHeight - 85,'icons','btn_play.png').setOrigin(0).setAlpha(.6).setDisplaySize(60,60).setInteractive();
      this.add.image(window.innerWidth - 85,25,'icons','btn_music.png').setOrigin(0).setAlpha(.6).setDisplaySize(60,60).setInteractive();
    }

    private createMask () : void {
      //创建开始游戏遮罩
      let graphicsObj : Phaser.GameObjects.Graphics = this.add.graphics();
      graphicsObj.fillStyle(0x000000,.5);
      graphicsObj.fillRect(0,0,window.innerWidth,window.innerHeight).setDepth(1);
      let mask : Phaser.GameObjects.Image = this.add.image(window.innerWidth / 2, window.innerHeight / 2 , 'mask').setDepth(100);
      let zoneObj : Phaser.GameObjects.Zone = this.add.zone(window.innerWidth / 2 - 104.5,window.innerHeight / 2 + 138 ,209 , 53 ).setOrigin(0).setInteractive();
      let that : Game5PlayScene = this;
      zoneObj.on('pointerdown',function () {
        //点击开始游戏注销组件
        zoneObj.destroy();
        graphicsObj.destroy();
        mask.destroy();
        that.wordsAnims();//开始游戏展示word
        that.initEmitHandle(); //初始化事件
      });
    }

    private createBgi () : void {
      this.add.image(0,0,'game5Bgi').setDisplaySize(window.innerWidth,window.innerHeight).setOrigin(0);
    }

    update(time: number , delta : number): void {
    }
  };
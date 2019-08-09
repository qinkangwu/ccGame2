import 'phaser';
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import {Game6DataItem} from '../../interface/Game6';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const W = 1024;
const H = 552;
var index:number = 0; //题目的指针，默认为0


/**
 * 坐标根据画布进行重排
 */
var coordTranslate:Function = function (_x:number,_y:number):void{
  let x = Math.floor((_x/W)*WIDTH);
  let y = Math.floor((_y/H)*HEIGHT);
  this.x = x;
  this.y = y;
}

/**
 * 根据画布宽高返回一组相对宽高及坐标
 */

 var reactangleTranslate = function (_width:number,_height:number):any{
   return {
      width:Math.floor((_width/W)*WIDTH),
      height:Math.floor((_height/H)*HEIGHT)
   }
 }

/**
 * 尺寸根据画布按照宽度进行重排
 */
 var scaleWidthTranslate:Function = function (_width:number){
    let width = Math.floor((_width/W)*WIDTH);
    let xRatio = width / _width;
    this.setScale(xRatio);
 }

export default class Game6PlayScene extends Phaser.Scene {
    private bgm:Phaser.Sound.BaseSound; //背景音乐
    private phoneticData:Game6DataItem[] = []; //音标数据
    private bg:Phaser.GameObjects.Image; //背景图片 
    private btn_exit:Phaser.GameObjects.Image;  //退出按钮
    private btn_sound:Phaser.GameObjects.Sprite; //音乐按钮
    private staticScene:Phaser.GameObjects.Container; // 静态组

    private balls:Phaser.GameObjects.Container; //药品序列
    private nullballs:Phaser.GameObjects.Container; //空圆序列
    private arrows:Phaser.GameObjects.Container; //箭头序列
    //private speaker:Phaser.Sound.BaseSound; //音标播放
    //private btns:Phaser.GameObjects.Container; 

    constructor() {
      super({
        key: "Game6PlayScene"
      });
    }
  
    init(res:{data:any[]}){
      this.resize();
      this.phoneticData = res.data.map(function (v){
          delete v.uselessPhoneticSymbols;
          return v;
      });
    }
  
    preload(): void {
        this.phoneticData.forEach(v=>{
          this.load.audio(v.name,v.audioKey);
          v.phoneticSymbols.forEach(_v=>{
            this.load.audio(_v.name,_v.audioKey);
          })
        })
    }
  
    create(): void {
        this.createBGM();
        this.createStaticScene();
        this.createDynamicScene();
        this.gameStart();
    }
  
    update(time: number , delta : number): void {
      
    }

    /**
     * 创建音标播放器
     */
    private createSpeaker():void{
      //this.speaker = new Phaser.Sound.BaseSound();
    }

    /**
     * 重置画布尺寸与定位
     */
    private resize():void{
      var content:HTMLElement = document.querySelector("#content");
      content.style.backgroundColor = "#000000";
      var canvas = document.querySelector("canvas");
      canvas.className = "obj-cover-center";
      this.scale.resize(1024,552);
      canvas.setAttribute("style",`
      width: 100% !important;
      height: 100% !important;
      object-fit: contain;
      object-position: center;
      `)
    }

     /** * 游戏开始 */
    public gameStart():void{
        this.createBalls();
    }

    /* 建立动态场景 */
    private createDynamicScene():void{
        this.balls = new Phaser.GameObjects.Container(this);
        this.nullballs = new Phaser.GameObjects.Container(this);
        this.arrows = new Phaser.GameObjects.Container(this);
        this.add.existing(this.balls);
        this.add.existing(this.nullballs);
        this.add.existing(this.arrows);
    }

    /* 创建药瓶 */
    private createBalls():void{
        /**
         * 测试接口
         */
        //index = 6;
        let ballImgTexures:Array<string> = ["img_ballgreen","img_ballpurple","img_ballyellow"];
        let phoneticSymbols = this.phoneticData[index].phoneticSymbols.reverse();
        let ballIndex = phoneticSymbols.length - 1; 
        let nullballIndex = 0;
        phoneticSymbols.forEach((v,i)=>{
          let ballImg = this.physics.add.image(1024*0.5+10, 410,`${ballImgTexures[i]}`).setCircle(71.5,71.5*0.5+15,71.5*0.5+23);
          ballImg.setData("name",v.name);
          let ballText = new Phaser.GameObjects.Text(this,1024*0.5+10,410,v.name,{align:"center",fontSize:"45px"}).setOrigin(0.5);
          let ball = new Phaser.GameObjects.Container(this,0,0,[ballImg,ballText]);
          this.balls.add(ball);
        });
        this.createUpArrow();
        this.ballEvents(ballIndex,nullballIndex);
    }


    /**
     * 单个药品的上下交互
     */
    private ballEvents(ballIndex:number,nullballIndex:number):void{
        let that = this;
        let nullBallOffsetX = 241;
        let nullball = this.physics.add.image(201 + nullballIndex*nullBallOffsetX,67,"img_ballnull").setOrigin(0).setCircle(71.5*0.5,71.5*0.5,71.5*0.5);
        this.nullballs.add(nullball);

        let ball:Phaser.GameObjects.Container = (<Phaser.GameObjects.Container>this.balls.list[ballIndex]);
        let speaker:Phaser.Sound.BaseSound = that.sound.add(ball.list[0].getData("name"));
        speaker.on("complete",function (){
          speaker.destroy();  //播放一次就销毁
        })
        ball.list[0].setInteractive({pixelPerfect: true, alphaTolerance: 120, draggable: true});
        ball.list[0].on("drag",ballImgOnDrag);
        function ballImgOnDrag(pointer, dragX, dragY):void{
            (<Phaser.GameObjects.Image>ball.list[0]).setPosition(dragX,dragY);
            (<Phaser.GameObjects.Text>ball.list[1]).setPosition(dragX,dragY);
        }

        let collider = this.physics.add.overlap(ball.list[0],nullball,overlapHandler,null,this);


        function overlapHandler(){
            ball.list[0].off("drag",ballImgOnDrag);
            (<Phaser.GameObjects.Image>ball.list[0]).setPosition(nullball.x + 71.5*0.5+40,nullball.y + 71.5*0.5+25);
            (<Phaser.GameObjects.Text>ball.list[1]).setPosition(nullball.x + 71.5*0.5+35,nullball.y + 71.5*0.5+35);
            nullball.disableBody(true,true);
            speaker.play();
            collider.destroy();
            if(ballIndex===0){
              /**
               * 一轮拖拽结束
               */
              clearArrows();
              that.createLeftRightArrow();
              that.ballLeftRightDrag();
              return false;
            }
            goOnWheelDrag();
        }
        
        function goOnWheelDrag(){
          ballIndex-=1;
          nullballIndex+=1;
          that.ballEvents(ballIndex,nullballIndex); 
        }

        function clearArrows(){
          that.tweens.killAll();
          that.arrows.removeAll(); 
        }

    }

    /**
     * 创建左右拖拽
     */
    private ballLeftRightDrag():void{
       setTimeout(()=>{
        this.balls.list.forEach((v,i)=>{
          if(i!==1)[
              (<Phaser.GameObjects.Container>v).list[0].on("drag",onLeftRightDrag)
          ]
       })
       },1000);
  
       function onLeftRightDrag(pointer, dragX, dragY):void{
         (<Phaser.GameObjects.Image>this).setPosition(dragX,dragY);
         (<Phaser.GameObjects.Text>this.parentContainer.list[1]).setPosition(dragX,dragY);
       }

       /** work init 准备开始制作碰撞检测 */

    }

    /**
     * 创建上下循环的箭头及动画
     */
    private createUpArrow():void{
      let arrowUp = new Phaser.GameObjects.Image(this,1024*0.5+5,386,"tips_arrow_up").setOrigin(0.5).setAlpha(0);
      this.arrows.add(arrowUp);
      this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
        targets:arrowUp,
        y:386-20,
        alpha:1,
        duration:500,
        repeat:-1
      }))
    }

    /**
     * 创建左右循环的箭头及动画
     */
    private createLeftRightArrow():void{
      let arrowLeft = new Phaser.GameObjects.Image(this,567+128*0.5+100,65+168*0.5-10,"tips_arrow_left").setOrigin(0.5).setAlpha(1);   //在右边
      let arrowRight= new Phaser.GameObjects.Image(this,331+128*0.5-100,65+168*0.5-10,"tips_arrow_right").setOrigin(0.5).setAlpha(1);    //在左边

      this.arrows.add([arrowLeft,arrowRight]);

      this.tweens.add((<Phaser.Types.Tweens.TweenBuilderConfig>{
        targets:[arrowLeft,arrowRight],
        x:1024*0.5,
        alpha:0,
        duration:800,
        repeat:-1 
      }))

      if(this.balls.list.length<3){
        arrowLeft.alpha = 0;
      }

    }


    /* 创建背景音乐 ，并设置为自动播放*/
    private createBGM():void{
      this.bgm = this.sound.add('bgm');
      this.bgm.addMarker({
        name:"start",
        start:0
      } as Phaser.Types.Sound.SoundMarker);
      let config:Phaser.Types.Sound.SoundConfig = {
        loop:true,
        volume:0.3
      }
      this.bgm.play("start",config);
    }

    /* 搭建静态场景 */
    private createStaticScene():void{
      this.bg = new Phaser.GameObjects.Image(this,0,0,"bg").setOrigin(0);

      this.btn_exit = new Phaser.GameObjects.Image(this,25,25,"btn_exit").setOrigin(0);
      this.btn_exit.setInteractive();
      this.btn_exit.on("pointerdown",this.exitGame);

      this.btn_sound = new Phaser.GameObjects.Sprite(this,939,25,"btn_sound_on").setOrigin(0);
      this.btn_sound.setInteractive();
      this.btn_sound.on("pointerdown",this.onOffSound);
      this.staticScene = new Phaser.GameObjects.Container(this,0,0,[
        this.bg,
        this.btn_exit,
        this.btn_sound
      ]);
      this.add.existing(this.staticScene);
    }

    /* 退出游戏*/
    private exitGame():void{
        console.log("Game Over");
    }


    /* 关闭或播放音乐 */
    private onOffSound(this:any){
        let bgm = this.scene.bgm;
        if(bgm.isPlaying){
            this.setTexture("btn_sound_off");
            bgm.pause(); 
        }else{
          this.setTexture("btn_sound_on");
          bgm.play();  
        }
    }

  };
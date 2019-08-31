import 'phaser';
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import { game4DataItem , game4PhoneticSymbol , game4WordItem} from '../../interface/Game4';
import PlanAnims from "../../Public/PlanAnims";
import CreateBtnClass from "../../Public/CreateBtnClass";
import { cover } from "../../Public/jonny/core/cover";
import { Gold } from "../../Public/jonny/components/Gold";
import CreateGuideAnims from "../../Public/CreateGuideAnims";
import { SellingGold } from "../../Public/jonny/components/SellingGold";

const W = 1024;
const H = 552;

export default class Game4PlayScene extends Phaser.Scene {
    private ccData : Array<game4DataItem> = [] ; //数据
    private civa : Phaser.GameObjects.Sprite ; //civa机器人
    private words : Array<game4WordItem> = []; //音标数量
    private errorWords : Array<game4WordItem> = []; //混淆音标
    private ballonSprites : Array<Phaser.Physics.Arcade.Sprite> = []; //气球集合
    private lineSprites : Array<Phaser.GameObjects.Sprite> = []; //线集合
    private wolfObj : Phaser.GameObjects.Sprite ;  //大灰狼对象
    private textArr : Array<Phaser.GameObjects.Text> = []; //文字集合
    private arrowObj : Phaser.Physics.Arcade.Sprite ; //箭头obj
    private wordObj : Phaser.GameObjects.Sprite; //胡萝卜对象
    private currentWord : Phaser.GameObjects.Text; //当前的单词
    private index : number = -1 ; // 音标索引
    private clickLock : boolean = true; //点击锁
    private shootLock : boolean = true; //射箭锁
    private ccDataIndex : number = 0 ; //当前单词索引
    private bgm : Phaser.Sound.BaseSound ; //bgm
    private quiver : Phaser.GameObjects.Sprite ; //箭筒
    private quiverText : Phaser.GameObjects.Text;  // 箭筒文本
    private popObj : Phaser.GameObjects.Sprite ; //气泡
    private popText : Phaser.GameObjects.Text ; //气泡文本
    private currentClickIndex : number ; //当前点击的气球索引
    private quiverNum : number ; //箭筒数量
    private wrongObj : Phaser.GameObjects.Sprite; //错误提示对象
    private planAnims : PlanAnims; //飞机过长动画引用
    private createGuideAnims : CreateGuideAnims; //引导动画引用
    private goldObj : Gold ; //金币组件引用
    private goldNum : number = 0;
    // private arrowCirObj : Phaser.GameObjects.Graphics; //箭上的圆圈
    // private arrowText : Phaser.GameObjects.Text; //箭头上面的文本
    constructor() {
      super({
        key: "Game4PlayScene"
      });
    }
  
    init(data): void {
      //音标数据绑定
      this.ccData = data && data.data || {};
      this.loadMusic(this.ccData);
    }
  
    preload(): void {
      //this.getData(); //获取数据
      this.setWords(); //mock数据
      this.loadBgm(); //加载背景音乐跟音效
      PlanAnims.loadImg(this); //全局组件加载img
      SellingGold.loadImg(this); //全局组件加载Img
    }
    
  
    create(): void {
      //初始化渲染
      //@ts-ignore
      cover(this,'game4Mask',()=>{
        this.planAnims = new PlanAnims(this,this.ccData.length);
        this.drawCivaAndWolf(); //渲染civa跟狼
        this.createArrow();  //渲染箭头
        this.clickHandle(); //绑定点击事件
        this.createWord(); //渲染🥕
        this.createAnims(); //创建动画
        this.drawAnimsHandle(); //初始化动画
        this.createCollide(); //创建碰撞检测
        this.createQuiver(); //创建箭筒跟气泡
        this.createBgm(); //创建背景音乐
        new CreateBtnClass(this,{
          bgm : this.bgm
        });
        this.goldObj = new Gold(this,0);
        this.add.existing(this.goldObj);
      })
      this.createBackgroundImage(); //背景图
      // this.createMask() ; //创建遮罩层
    }


    private createMask () : void {
      let graphicsObj : Phaser.GameObjects.Graphics = this.add.graphics();
      graphicsObj.fillStyle(0x000000,.5);
      graphicsObj.fillRect(0,0,W,H).setDepth(500);
    }

    private loadBgm () : void {
      
    }

    private createBgm () : void {
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .3
      })
    }

    private setPopAndQuiver (isWrong? : boolean) : void {
      this.quiverText.setScale(0);
      !isWrong && this.quiverText.setText(this.words[this.index + 1 >= this.words.length ? this.words.length - 1 : this.index + 1].name);
      this.tweens.add({
        targets : this.quiverText,
        scaleX : 1.5,
        scaleY : 1.5,
        ease: 'Sine.easeInOut',
        duration : 100,
        onComplete : ()=>{
          this.tweens.add({
            targets : this.quiverText,
            scaleX : 1,
            scaleY : 1,
            ease: 'Sine.easeInOut',
            duration : 100,
          })
        }
      });
    }

    private createQuiver () : void {
      //创建气泡跟箭筒
      this.quiver = this.add.sprite(250,H - 100,'game4Icons2',`jianshi${this.words.length}.png`).setScale(0.8);
      this.quiverText = this.add.text(this.quiver.x,this.quiver.y + 40,this.words[0].name,{
        font: 'bold 37px Arial Rounded MT',
        fill : '#017dbd',
      }).setOrigin(.5);
      this.popObj = this.add.sprite(this.civa.x + 150,this.civa.y - 50,'game4Icons2','talk.png').setScale(.5).setOrigin(.5);
      this.popText = this.add.text(this.popObj.x,this.popObj.y - 10,this.ccData[this.ccDataIndex].name,{
        font: 'bold 50px Arial Rounded MT',
        fill : '#ff5054',
      }).setOrigin(.5);
      this.tweens.add({
        targets : [this.popObj],
        scaleX : 0.6,
        scaleY : 0.6,
        ease: 'Sine.easeInOut',
        duration : 500,
        yoyo : true,
        repeat : 2
      });
      this.tweens.add({
        targets : [this.popText],
        scaleX : 1.1,
        scaleY : 1.1,
        ease: 'Sine.easeInOut',
        duration : 500,
        yoyo : true,
        repeat : 2
      });
    }

    private loadMusic (data : Array<game4DataItem>) : void {
      //加载音频
      data && data.map((r :game4DataItem , i : number )=>{
        this.load.audio(r.id,r.audioKey);
        r.phoneticSymbols && r.phoneticSymbols.map((r2 : game4PhoneticSymbol,i2 : number)=>{
          this.load.audio(r2.id,r2.audioKey);
        })
      })
      this.load.start(); //preload自动运行，其他地方加载资源必须手动启动，不然加载失效
    }

    private createWord () : void {
      //创建胡萝卜单词
      this.wordObj = this.add.sprite(W / 2 , H /  2 + H , 'icons', 'huluobo.png').setOrigin(.5).setAlpha(1).setInteractive();
      this.currentWord = this.add.text(this.wordObj.x + 30, this.wordObj.y ,this.ccData[this.ccDataIndex].name,{
        font: 'bold 70px Arial Rounded MT',
        fill : '#fff',
        bold : true
      }).setOrigin(.5);
    }

    private createArrow () : void {
      //创建箭矢
      this.arrowObj = this.physics.add.sprite(this.civa.x + this.civa.width / 2,this.civa.y + this.civa.height / 2 + 60,'icons','jian.png').setOrigin(0.5).setAlpha(0);
      // this.arrowCirObj = this.add.graphics();
      // this.arrowCirObj.fillStyle(0xffffff, 0.8);
      // this.arrowCirObj.fillCircle(this.arrowObj.x,this.arrowObj.y,20);
      // this.arrowCirObj.setDepth(500);
      // this.arrowText = this.add.text(this.arrowObj.x,this.arrowObj.y,this.words[0].name,{
      //   font: 'bold 20px Arial Rounded MT',
      //   fill : '#00b1ff',
      //   bold : true
      // }).setOrigin(.5).setDepth(501);
      // console.log(this.arrowCirObj);
      // this.arrowObj.depth = 300;
    }

    private createCollide () : void {
      //重叠或碰撞检测
      //this.physics.add.collider(this.arrowObj,this.ballonSprites,this.collideCb.bind(this));
      this.physics.add.overlap(this.arrowObj,this.ballonSprites,this.overlapCb.bind(this))
    }

    private overlapCb (...args) : void {
      //重叠回调函数
      let item : Phaser.Physics.Arcade.Sprite = args[1];
      if(item.getData('index') === this.currentClickIndex){
        if(this.words[this.index].name === this.errorWords[this.currentClickIndex].name){
          this.colideHandle();  //碰撞事件触发
          this.clickLock = true; 
          this.shootLock = false;
          this.createArrow();
          this.createCollide();
          this.setPopAndQuiver();
          if(this.index === this.ballonSprites.length - 1){
            this.allBallonIsFinish();
          }
        }else{
          this.setPopAndQuiver(true);
          this.showWrongObjHandle();
          this.playMusic('wrong');
          this.shootLock = false;
          this.clickLock = true;
          this.index -- ;
          this.arrowObj.destroy();
          this.createArrow();
          this.createCollide();
        }
      }
    }

    private shuffle<T> (arr : T[]) : T[]{
      //Fisher-Yates shuffle 算法 打乱数组顺序
      for (let i :number = 1; i < arr.length ; i ++) {
        let random : number = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[random]] = [arr[random], arr[i]];   //es6  交换数组成员位置
      }
      return arr;
    }

    private collideCb () : void {
      //碰撞回调函数
      this.colideHandle();  //碰撞事件触发
      this.clickLock = true; 
      this.shootLock = false;
      this.createArrow();
      this.createCollide();
      if(this.index === this.ballonSprites.length - 1){
        this.allBallonIsFinish();
      }
    }
    private showWordHandle () : void {
      //显示胡萝卜
      this.tweens.add({
        targets : [this.currentWord,this.wordObj],
        y : `-=${H}`,
        ease: 'Sine.easeInOut',
        duration : 500,
        onComplete : ()=>{
          //@ts-ignore
          !this.showWordHandle.lock && (this.createGuideAnims = new CreateGuideAnims(this,this.wordObj.x + 200, this.wordObj.y));
          //@ts-ignore
          this.showWordHandle.lock = true;
        }
      })
    }

    private allBallonIsFinish () : void {
      //大灰狼掉入地下
      this.time.addEvent({
        delay : 800,
        callback : ()=>{
          this.playMusic(this.ccData[this.ccDataIndex].id);
        }
      });
      this.clickLock = true; 
      this.shootLock = true;
      this.tweens.add({
        targets : this.wolfObj,
        y : `+=${H}`,
        ease: 'Sine.easeInOut',
        duration : 500,
        onComplete : ()=>{
          this.wolfObj.destroy();
          this.showWordHandle();
          this.ballonSprites.length = 0;
          this.lineSprites.length = 0 ;
          this.textArr.length = 0 ;
        }
      })
    }

    private colideHandle () : void {
      //碰撞检测
      this.playMusic(this.errorWords[this.currentClickIndex].id);
      this.arrowObj.destroy();
      this.ballonSprites[this.currentClickIndex].destroy();
      this.ballonSprites[this.currentClickIndex] = null;
      this.lineSprites[this.currentClickIndex].destroy();
      this.lineSprites[this.currentClickIndex] = null;
      this.textArr[this.currentClickIndex].destroy();
      this.textArr[this.currentClickIndex] = null;
      this.changeQuiverNums(this.quiverNum - 1); //修改箭筒箭矢数量
    }

    private getAngel (px : number,py : number,mx : number,my : number) : number {
      //两点之间的顺时针夹角
      let x : number = Math.abs(px - mx);
      let y : number = Math.abs(py - my);
      let z : number = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
      let cos : number = y/z;
      let radina : number = Math.acos(cos);//用反三角函数求弧度
      let angle : number = Math.floor(180 / (Math.PI/radina));//将弧度转换成角度

      if(mx>px && my>py){//鼠标在第四象限
          angle = 180 - angle;
      }

      if(mx==px && my>py){//鼠标在y轴负方向上
          angle = 180;
      }

      if(mx>px && my==py){//鼠标在x轴正方向上
          angle = 90;
      }

      if(mx<px && my>py){//鼠标在第三象限
          angle = 180 + angle;
      }

      if(mx<px && my==py){//鼠标在x轴负方向
          angle = 270;
      }

      if(mx<px && my<py){//鼠标在第二象限
          angle = 360 - angle;
      }
      return angle;
    }

    private setArrowAngle () : void { 
      //调整箭头角度
      let angleNum : number = this.getAngel(this.civa.x + this.civa.width / 2,this.civa.y + this.civa.height / 2,this.ballonSprites[this.currentClickIndex].x,this.ballonSprites[this.currentClickIndex].y);
      this.arrowObj.setAngle( angleNum + 270); 
      this.arrowObj.setDepth(200);
    }

    private drawAnimsHandle () : void {
      //起始动画
      this.planAnims.show(this.ccDataIndex + 1,()=>{
        this.tweens.add({
          targets : [...this.ballonSprites,...this.lineSprites,...this.textArr,this.wolfObj],
          y : `-=${H}`,
          ease: 'Sine.easeInOut',
          duration : 1000,
          onComplete : ()=>{
            this.shootLock = false;
            this.tweens.add({
              targets : [...this.ballonSprites,...this.lineSprites,...this.textArr,this.wolfObj],
              y : `+=20`,
              ease: 'Sine.easeInOut',
              duration : 1000,
              yoyo : true,
              repeat : -1
            });
            //@ts-ignore
            if(!this.drawAnimsHandle.lock){
              let firstIndex : number = this.errorWords.findIndex((r)=>r === this.words[0]);
              let firstItem : Phaser.Physics.Arcade.Sprite = this.ballonSprites[firstIndex];
              this.createGuideAnims = new CreateGuideAnims(this,firstItem.x + 50,firstItem.y + 50);
            }
          }
        })   
      });
    }

    private transDataHandle (data : Array<game4WordItem>) : Array<game4WordItem> {
      //把超出4个音标的数据按顺序合并为4个
      let len : number = data.length;
      let diff : number = len - 4;
      let transData = [] ;
      let sortArr : Array<number> = [1,1,1,1];
      let sortIndex : number = 0;
      if(diff <= 4){
        //音标小于8
        for ( let i = 0 ; i < diff ; i ++){
          sortArr[sortArr.length - 1 - i]++;
        }
        sortArr.map((r : number , i : number)=>{
          r === 1 && (transData.push(data[sortIndex])) || (transData.push({
            id : data[sortIndex].id + ',' + data[sortIndex + 1].id,
            name : this.transName(data[sortIndex].name + ',' + data[sortIndex + 1].name),
            audioKey : data[sortIndex].audioKey + ',' + data[sortIndex + 1].audioKey
          }))
          sortIndex += r;
        })
      }else{
        //音标大于8
      }
      return transData;
    }

    private transName (name : string ) : string {
      // / b / + / b / = / bb /;
      let strArr : Array<string> = name.split(',');
      let str1 : string = strArr[0];
      let str2 : string = strArr[1];
      let lastStr : string = '';
      str1 = str1.replace(/\//g,'').replace(/ /g,'');
      str2 = str2.replace(/\//g,'').replace(/ /g,'');
      lastStr = `/${str1}${str2}/`
      return lastStr;
    }

    private setWords () : void{
      //初始化单词音标
      // this.ccData[this.ccDataIndex].phoneticSymbols.push(
      //   this.ccData[this.ccDataIndex].phoneticSymbols[0],
      //   this.ccData[this.ccDataIndex].phoneticSymbols[1],
      //   this.ccData[this.ccDataIndex].phoneticSymbols[0]
      // )
      let currentItem : Array<game4PhoneticSymbol> = this.ccData[this.ccDataIndex].phoneticSymbols;
      this.words = currentItem.length <= 4 && currentItem.map((r:game4PhoneticSymbol , i : number) =>{
        return {
          id : r.id,
          name : r.name,
          audioKey : r.audioKey
        }
      }) || this.transDataHandle(currentItem);
      this.quiverNum = this.words.length ; //箭筒箭矢数量初始化
      this.errorWords = this.shuffle([...this.words]); //打乱原始数据
      this.ballonSprites.length = 0;
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = null;
      if(sourceKey.split(',').length > 1){
        mp3 = this.sound.add(sourceKey.split(',')[0]);
        mp3.once('complete',()=>{
          this.playMusic(sourceKey.split(',')[1]);
        })
        mp3.play();
        return;
      }
      mp3 = this.sound.add(sourceKey);
      mp3.play();
    }

    private arrowEmitHandle () : void {
      //射箭
      if(this.clickLock) return;
      let currentItem : Phaser.Physics.Arcade.Sprite = this.ballonSprites[this.currentClickIndex];
      this.arrowObj.setVelocity(currentItem.x + currentItem.width / 2 - 200, -(currentItem.y + currentItem.height / 2));
      this.arrowObj.alpha = 1;
    }

    private base64ToBlob (code : string) : Blob {
        //将base64解码之后转成blob二进制数据
        let parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;

        let uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {type: contentType});
    }

    private clickHandle () : void {
      //点击场景触发
      this.input.on('pointerdown',(...args)=>{
        //@ts-ignore
        if(args[1].length === 0 || args[1][0] instanceof Phaser.GameObjects.Image ) return;
        this.playMusic('shoot');
        this.createGuideAnims && this.createGuideAnims.hideHandle(); //隐藏引导动画
        this.createGuideAnims = null;
        //@ts-ignore
        !this.drawAnimsHandle.lock && (this.drawAnimsHandle.lock = true); //第二次不展示引导动画
        this.currentClickIndex = args[1][0].getData('index');
        if(this.wordObj.y < H){
          this.tweens.add({
            targets : [this.wordObj , this.currentWord],
            scaleX : 0,
            scaleY : 0,
            duration : 300,
            ease : 'Sine.easeInOut',
            onComplete : ()=>{
              let goldAnims = new SellingGold(this,{
                callback : ()=>{
                  this.goldObj.setText(this.goldNum += 3);
                  this.wordObj.setScale(1);
                  this.currentWord.setScale(1);
                  this.wordObj.y += H;
                  this.currentWord.y += H;
                  if(++this.ccDataIndex >= this.ccData.length){
                    this.ccDataIndex = 0;
                  }
                  this.popText.setText(this.ccData[this.ccDataIndex].name);
                  this.index = -1;
                  this.civa.destroy();
                  this.setWords();
                  this.createWord();
                  this.drawCivaAndWolf();
                  this.drawAnimsHandle();
                  this.setPopAndQuiver();
                  this.changeQuiverNums(this.quiverNum);   
                }
              });
              goldAnims.goodJob();
            }
          })
        }
        if(this.shootLock) return;
        this.tweens.add({
          targets : args[1][0],
          duration : 200,
          ease: 'Sine.easeInOut',
          scaleX : 0.52,
          scaleY : 0.52,
          yoyo : true,
          repeat : 1
        })
        this.shootLock = true;
        if(++this.index >= this.words.length){
          this.index = 0 ;
        }
        this.civa.anims.play('shooting');
        this.time.addEvent({
          delay: 500,
          callback : ()=>{
            this.clickLock = false;
          }
        });
        this.setArrowAngle();
      })
    }

    private changeQuiverNums (index : number) : void{
      this.quiverNum = index < 1 && 1 || index;
      this.quiver.setFrame(`jianshi${this.quiverNum}.png`);
    }

    private createAnims () : void {
      //civa射箭动画
      this.anims.create({
        key : 'shooting',
        frames : this.anims.generateFrameNames('shoot',{start : 0 , end : 5 , zeroPad: 4 , prefix : 'civa' , suffix : '.png' }),
        frameRate : 6.666666666666667,
        repeat : 0,
        yoyo : false
      })
    }

    private drawCivaAndWolf () : void{
      //渲染场景
      this.civa = this.add.sprite(0,H - (240 + H * 0.15),'shoot','civa0001.png').setOrigin(0).setDepth(100);
      switch(this.words.length){
        case 2 :  
          this.ballonSprites.push(this.physics.add.sprite(W / 2 - 20 , H / 2 - 150 + H, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100).setImmovable().setInteractive().setData('index',0));
          this.ballonSprites.push(this.physics.add.sprite(W / 2 + 140 , H / 2 - 150 + H, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setImmovable().setInteractive().setData('index',1));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[0].x - 20, this.ballonSprites[0].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[0].x + 48, this.ballonSprites[0].y,'icons','line03.png').setOrigin(0));
          this.wolfObj = this.add.sprite(W / 2 + 50 , H / 2  + 100 + H,'icons' , 'dahuilang.png');
          for(let i = 0 ; i < this.ballonSprites.length ; i ++ ){
            let ballon = this.ballonSprites[i];
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.errorWords[i].name , {
              font: 'bold 45px Arial Rounded MT',
              fill : '#fff',
              bold : true
            }).setOrigin(0.5).setDepth(200));
          }
          break;
        case 3 :
          this.ballonSprites.push(this.physics.add.sprite(W / 2 - 120 , H / 2 - 150 + H, 'icons' , 'qiqiu03.png').setScale(.5).setDepth(100).setAngle(-20).setImmovable().setInteractive().setData('index',0));
          this.ballonSprites.push(this.physics.add.sprite(W / 2 + 20, H / 2 - 150 + H, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100).setImmovable().setInteractive().setData('index',1));
          this.ballonSprites.push(this.physics.add.sprite(W / 2 + 180 , H / 2 - 150 + H, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setImmovable().setInteractive().setData('index',2));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 205, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 20, this.ballonSprites[1].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 48, this.ballonSprites[1].y,'icons','line03.png').setOrigin(0));
          this.wolfObj = this.add.sprite(W / 2 + 50 , H / 2  + 100 + H,'icons' , 'dahuilang.png');
          for(let i : number = 0 ; i < this.ballonSprites.length ; i ++ ){
            let ballon = this.ballonSprites[i];
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.errorWords[i].name , {
              font: 'bold 45px Arial Rounded MT',
              fill : '#fff',
              bold : true
            }).setOrigin(0.5).setDepth(200));
          }
          break;
        case 4 :
          this.ballonSprites.push(this.physics.add.sprite(W / 2 - 160 , H / 2 - 150 + H, 'icons' , 'qiqiu03.png').setScale(.5).setDepth(100).setAngle(-20).setImmovable().setInteractive().setData('index',0));
          this.ballonSprites.push(this.physics.add.sprite(W / 2 - 30, H / 2 - 150 + H, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100).setImmovable().setInteractive().setData('index',1));
          this.ballonSprites.push(this.physics.add.sprite(W / 2 + 110 , H / 2 - 150 + H, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setImmovable().setInteractive().setData('index',2));
          this.ballonSprites.push(this.physics.add.sprite(W / 2 + 250 , H / 2 - 150 + H, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setAngle(20).setImmovable().setInteractive().setData('index',3));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 200, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 20, this.ballonSprites[1].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 28, this.ballonSprites[1].y,'icons','line03.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 50, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0).setFlip(true,false));
          this.wolfObj = this.add.sprite(W / 2 + 50 , H / 2  + 100 + H,'icons' , 'dahuilang.png');
          for(let i : number = 0 ; i < this.ballonSprites.length ; i ++ ){
            let ballon = this.ballonSprites[i];
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.errorWords[i].name , {
              font: 'bold 45px Arial Rounded MT',
              fill : '#fff',
              bold : true
            }).setOrigin(0.5).setDepth(200));
          }
          break;
        default :
          break;
      }
    }



    private createBackgroundImage () :void {
      let img : Phaser.GameObjects.Image = this.add.image(0,0,'game4Bgi').setOrigin(0).setDisplaySize(W,H);
      this.wrongObj = this.add.sprite(0,0,'game4WrongImg').setOrigin(0).setDisplaySize(W,H).setDepth(1000).setAlpha(0);
    }

    private showWrongObjHandle() : void{
      this.tweens.add({
        targets : this.wrongObj,
        alpha : 1,
        ease: 'Sine.easeInOut',
        duration : 300,
        yoyo : true,
        repeat : 2
      })
    }
  
    update(time: number , delta : number): void {
      this.arrowEmitHandle();
      // console.log((1000/delta).toFixed(3));   
      //this.arrowObj.angle += 0.1;
    }
  };
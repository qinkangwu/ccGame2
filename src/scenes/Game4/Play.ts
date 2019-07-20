import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import { game4DataItem , game4PhoneticSymbol , game4WordItem} from '../../interface/Game4';

export class Game4PlayScene extends Phaser.Scene {
    private ccData : Array<game4DataItem> = [] ; //数据
    private civa : Phaser.GameObjects.Sprite ; //civa机器人
    private words : Array<game4WordItem> = []; //音标数量
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
    }
    
  
    create(): void {
      //初始化渲染
      this.createBackgroundImage(); //背景图
      this.drawCivaAndWolf(); //渲染civa跟狼
      this.createArrow();  //渲染箭头
      this.clickHandle(); //绑定点击事件
      this.createWord(); //渲染🥕
      this.createAnims(); //创建动画
      this.drawAnimsHandle(); //初始化动画
      this.createCollide(); //创建碰撞检测
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

    private getData () : void{
      get(apiPath.getWordsData).then((res)=>{
        console.log(res);
      })
    }

    private createWord () : void {
      this.wordObj = this.add.sprite(window.innerWidth / 2 , window.innerHeight /  2 , 'icons', 'huluobo.png').setOrigin(.5).setAlpha(1).setAlpha(0);
      this.currentWord = this.add.text(this.wordObj.x + 30, this.wordObj.y ,'boot',{
        font: 'bold 70px Arial Rounded MT',
        fill : '#fff',
        bold : true
      }).setOrigin(.5).setAlpha(0);
    }

    private createArrow () : void {
      this.arrowObj = this.physics.add.sprite(this.civa.x + this.civa.width / 2,this.civa.y + this.civa.height / 2 + 60,'icons','jian.png').setOrigin(0.5).setAlpha(0);
    }

    private createCollide () : void {
      this.physics.add.collider(this.arrowObj,this.ballonSprites,this.collideCb.bind(this));
    }

    private collideCb () : void {
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
      this.tweens.add({
        targets : [this.currentWord,this.wordObj],
        alpha : 1,
        ease: 'Sine.easeInOut',
        duration : 500,
      })
    }

    private allBallonIsFinish () : void {
      //大灰狼掉入地下
      this.clickLock = true; 
      this.shootLock = true;
      this.tweens.add({
        targets : this.wolfObj,
        y : `+=${window.innerHeight}`,
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
      this.arrowObj.destroy();
      this.ballonSprites[this.index].destroy();
      this.ballonSprites[this.index] = null;
      this.lineSprites[this.index].destroy();
      this.lineSprites[this.index] = null;
      this.textArr[this.index].destroy();
      this.textArr[this.index] = null;
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
      let angleNum : number = this.getAngel(this.civa.x + this.civa.width / 2,this.civa.y + this.civa.height / 2,this.ballonSprites[this.index].x,this.ballonSprites[this.index].y);
      this.arrowObj.setAngle( angleNum + 270); 
    }

    private drawAnimsHandle () : void {
      //起始动画
      this.tweens.add({
        targets : [...this.ballonSprites,...this.lineSprites,...this.textArr,this.wolfObj],
        y : `-=${window.innerHeight}`,
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
          })
        }
      })
    }

    private transDataHandle (data : Array<game4WordItem>) : Array<game4WordItem> {
      //把超出4个音标的数据合并为4个
      let len : number = data.length;
      let diff : number = len - 4;
      let transData = [] ;
      if(diff <= 4){
        //音标小于8
        for ( let i : number = 0 ; i < 4 ; i ++ ){
          transData.push(data[i]);
        }
        for ( let i : number = diff ; i > 0 ; i -- ){
          let item : game4WordItem = data[3 + i];
          transData[4 - i] = {
            id : transData[4 - i].id + ',' + item.id,
            name : this.transName(transData[4 - i].name + ',' + item.name),
            audioKey : transData[4 - i].audioKey + ',' + item.audioKey
          };
        }
      }else{
        //音标大于8
      }
      console.log(transData);
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
      this.ccData[this.ccDataIndex].phoneticSymbols.push(
        this.ccData[this.ccDataIndex].phoneticSymbols[0],
        this.ccData[this.ccDataIndex].phoneticSymbols[0],
        this.ccData[this.ccDataIndex].phoneticSymbols[0]
        )
      let currentItem : Array<game4PhoneticSymbol> = this.ccData[this.ccDataIndex].phoneticSymbols;
      this.words = currentItem.length <= 4 && currentItem.map((r:game4PhoneticSymbol , i : number) =>{
        return {
          id : r.id,
          name : r.name,
          audioKey : r.audioKey
        }
      }) || this.transDataHandle(currentItem);
      console.log(currentItem);
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private arrowEmitHandle () : void {
      //射箭
      if(this.clickLock) return;
      let currentItem : Phaser.Physics.Arcade.Sprite = this.ballonSprites[this.index];
      this.arrowObj.setVelocity(currentItem.x + currentItem.width / 2 - 140, -(currentItem.y + currentItem.height / 2));
      this.arrowObj.alpha = 1;
    }

    private clickHandle () : void {
      //点击场景触发
      this.input.on('pointerdown',(...args)=>{
        if(this.wordObj.alpha === 1){
          this.wordObj.alpha = 0;
          this.currentWord.alpha = 0;
          this.civa.destroy();
          this.drawCivaAndWolf();
          this.drawAnimsHandle();
        }
        if(this.shootLock) return;
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
      this.civa = this.add.sprite(0,window.innerHeight - (240 + window.innerHeight * 0.15),'shoot','civa0001.png').setOrigin(0);
      switch(this.words.length){
        case 2 :  
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 - 20 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100).setImmovable());
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 140 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setImmovable());
          this.lineSprites.push(this.add.sprite(this.ballonSprites[0].x - 20, this.ballonSprites[0].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[0].x + 48, this.ballonSprites[0].y,'icons','line03.png').setOrigin(0));
          this.wolfObj = this.add.sprite(window.innerWidth / 2 + 50 , window.innerHeight / 2  + 100 + window.innerHeight,'icons' , 'dahuilang.png');
          for(let i = 0 ; i < this.ballonSprites.length ; i ++ ){
            let ballon = this.ballonSprites[i];
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.words[i].name , {
              font: 'bold 45px Arial Rounded MT',
              fill : '#fff',
              bold : true
            }).setOrigin(0.5).setDepth(200));
          }
          break;
        case 3 :
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 - 120 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu03.png').setScale(.5).setDepth(100).setAngle(-20).setImmovable());
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 20, window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100).setImmovable());
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 180 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setImmovable());
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 205, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 20, this.ballonSprites[1].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 48, this.ballonSprites[1].y,'icons','line03.png').setOrigin(0));
          this.wolfObj = this.add.sprite(window.innerWidth / 2 + 50 , window.innerHeight / 2  + 100 + window.innerHeight,'icons' , 'dahuilang.png');
          for(let i : number = 0 ; i < this.ballonSprites.length ; i ++ ){
            let ballon = this.ballonSprites[i];
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.words[i].name , {
              font: 'bold 45px Arial Rounded MT',
              fill : '#fff',
              bold : true
            }).setOrigin(0.5).setDepth(200));
          }
          break;
        case 4 :
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 - 160 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu03.png').setScale(.5).setDepth(100).setAngle(-20).setImmovable());
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 - 30, window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100).setImmovable());
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 110 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setImmovable());
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 250 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100).setAngle(20).setImmovable());
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 200, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 20, this.ballonSprites[1].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 28, this.ballonSprites[1].y,'icons','line03.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 50, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0).setFlip(true,false));
          this.wolfObj = this.add.sprite(window.innerWidth / 2 + 50 , window.innerHeight / 2  + 100 + window.innerHeight,'icons' , 'dahuilang.png');
          for(let i : number = 0 ; i < this.ballonSprites.length ; i ++ ){
            let ballon = this.ballonSprites[i];
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.words[i].name , {
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
      let img : Phaser.GameObjects.Image = this.add.image(0,0,'game4Bgi').setOrigin(0).setDisplaySize(window.innerWidth,window.innerHeight);
    }
  
    update(time: number , delta : number): void {
      this.arrowEmitHandle();
      // console.log((1000/delta).toFixed(3));   
      //this.arrowObj.angle += 0.1;
    }
  };
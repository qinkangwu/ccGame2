export class Game4PlayScene extends Phaser.Scene {
    private civa : Phaser.GameObjects.Sprite ; //civa机器人
    private words : Array<string> = []; //音标数量
    private ballonSprites : Array<Phaser.Physics.Arcade.Sprite> = []; //气球集合
    private lineSprites : Array<Phaser.GameObjects.Sprite> = []; //线集合
    private wolfObj : Phaser.GameObjects.Sprite ;  //大灰狼对象
    private textArr : Array<Phaser.GameObjects.Text> = []; //文字集合
    private arrowObj : Phaser.Physics.Arcade.Sprite ; //箭头obj
    private index : number = -1 ; // 音标索引
    private clickLock : boolean = true; //点击锁
    private shootLock : boolean = true; //射箭锁
    constructor() {
      super({
        key: "Game4PlayScene"
      });
    }
  
    init(data): void {
      //音标数据绑定
    //   this.ccData = data && data.data || {};
    }
  
    preload(): void {
      this.setWords(); //mock数据
    }
    
  
    create(): void {
      //初始化渲染
      this.createBackgroundImage(); //背景图
      this.drawCivaAndWolf(); //渲染civa跟狼
      this.createArrow();  //渲染箭头
      this.clickHandle(); //绑定点击事件
      this.createAnims(); //创建动画
      this.drawAnimsHandle(); //初始化动画
      this.createCollide(); //创建碰撞检测
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
    }

    private colideHandle () : void {
      this.arrowObj.destroy();
      this.ballonSprites[this.index].destroy();
      this.ballonSprites[this.index] = null;
      this.lineSprites[this.index].destroy();
      this.lineSprites[this.index] = null;
      this.textArr[this.index].destroy();
      this.textArr[this.index] = null;
    }

    private getAngel (px : number,py : number,mx : number,my : number) : number {
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
      let angleNum : number = this.getAngel(this.civa.x + this.civa.width / 2,this.civa.y + this.civa.height / 2,this.ballonSprites[this.index].x,this.ballonSprites[this.index].y);
      this.arrowObj.setAngle( angleNum + 270); 
    }

    private drawAnimsHandle () : void {
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

    private setWords () : void{
      //初始化单词音标
      this.words = ['/ a /','/ b /','/ c /','/ d /'];
      this.words.length = 4;
    }

    private arrowEmitHandle () : void {
      if(this.clickLock) return;
      let currentItem : Phaser.Physics.Arcade.Sprite = this.ballonSprites[this.index];
      this.arrowObj.setVelocity(currentItem.x + currentItem.width / 2 - 140, -(currentItem.y + currentItem.height / 2));
      this.arrowObj.alpha = 1;
    }

    private clickHandle () : void {
      //点击场景触发
      this.input.on('pointerdown',(...args)=>{
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
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.words[i] , {
              fontSize : 40,
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
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 20, this.ballonSprites[1].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 48, this.ballonSprites[1].y,'icons','line03.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 205, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0));
          this.wolfObj = this.add.sprite(window.innerWidth / 2 + 50 , window.innerHeight / 2  + 100 + window.innerHeight,'icons' , 'dahuilang.png');
          for(let i : number = 0 ; i < this.ballonSprites.length ; i ++ ){
            let ballon = this.ballonSprites[i];
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.words[i] , {
              fontSize : 40,
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
            this.textArr.push(this.add.text(ballon.x  , ballon.y , this.words[i] , {
              fontSize : 40,
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
  
    update(time: number): void {
      this.arrowEmitHandle();
      //this.arrowObj.angle += 0.1;
    }
  };
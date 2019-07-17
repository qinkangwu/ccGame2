export class Game4PlayScene extends Phaser.Scene {
    private civa : Phaser.GameObjects.Sprite ; //civa机器人
    private words : Array<string> = []; //音标数量
    private ballonSprites : Array<Phaser.Physics.Arcade.Sprite> = []; //气球集合
    private lineSprites : Array<Phaser.GameObjects.Sprite> = []; //线集合
    private wolfObj : Phaser.GameObjects.Sprite ;  //大灰狼对象
    private textArr : Array<Phaser.GameObjects.Text> = []; //文字集合
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
      this.clickHandle(); //绑定点击事件
      this.createAnims(); //创建动画
      this.drawAnimsHandle(); //初始化动画
    }

    private drawAnimsHandle () : void {
      console.log(this);
      this.tweens.add({
        targets : [...this.ballonSprites,...this.lineSprites,...this.textArr,this.wolfObj],
        y : `-=${window.innerHeight}`,
        ease: 'Sine.easeInOut',
        duration : 1000,
      })
    }

    private setWords () : void{
      //初始化单词音标
      this.words = ['/ a /','/ b /','/ c /','/ d /'];
      this.words.length = 3;
    }

    private clickHandle () : void {
      //点击场景触发
      this.input.on('pointerdown',(...args)=>{
        this.civa.anims.play('shooting');
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
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 - 20 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100));
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 140 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100));
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
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 - 120 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu03.png').setScale(.5).setDepth(100).setAngle(-20));
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 20, window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu01.png').setScale(.5).setDepth(100));
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 180 , window.innerHeight / 2 - 150 + window.innerHeight, 'icons' , 'qiqiu02.png').setScale(.5).setDepth(100));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 20, this.ballonSprites[1].y,'icons','line02.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x + 48, this.ballonSprites[1].y,'icons','line03.png').setOrigin(0));
          this.lineSprites.push(this.add.sprite(this.ballonSprites[1].x - 205, this.ballonSprites[1].y,'icons','line01.png').setOrigin(0));
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
        case 4 :
          break;
        default :
          break;
      }
    }

    private createBackgroundImage () :void {
      let img : Phaser.GameObjects.Image = this.add.image(0,0,'game4Bgi').setOrigin(0).setDisplaySize(window.innerWidth,window.innerHeight);
    }
  
    update(time: number): void {
      
    }
  };
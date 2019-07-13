export class Game4PlayScene extends Phaser.Scene {
    private civa : Phaser.GameObjects.Sprite ; //civa机器人
    private words : Array<string> = []; //音标数量
    private ballonSprites : Array<Phaser.Physics.Arcade.Sprite> = []; //气球集合
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
    }

    private setWords () : void{
      this.words = ['/ a /','/ b /','/ c /','/ d /'];
      this.words.length = 2;
      // this.words.length = 3;
    }

    private clickHandle () : void {
      this.input.on('pointerdown',(...args)=>{
        this.civa.anims.play('shooting');
      })
    }

    private createAnims () : void {
      this.anims.create({
        key : 'shooting',
        frames : this.anims.generateFrameNames('shoot',{start : 0 , end : 3 , zeroPad: 4 , prefix : 'civa' , suffix : '.png' }),
        frameRate : 10,
        repeat : 0,
        yoyo : true
      })
    }

    private drawCivaAndWolf () : void{
      this.civa = this.add.sprite(0,window.innerHeight - (240 + window.innerHeight * 0.15),'shoot').setOrigin(0);
      switch(this.words.length){
        case 2 :  
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 - 40 , window.innerHeight / 2 - 100 , 'icons' , 'qiqiu_01.png'));
          this.ballonSprites.push(this.physics.add.sprite(window.innerWidth / 2 + 120 , window.innerHeight / 2 - 100 , 'icons' , 'qiqiu_04.png'));
          this.add.sprite(window.innerWidth / 2 + 50 , window.innerHeight / 2  + 80,'icons' , 'dahuilang.png');
          break;
        case 3 :
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
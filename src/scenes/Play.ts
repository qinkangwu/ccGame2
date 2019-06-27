export class PlayScene extends Phaser.Scene {
    private ccData : object = {};   //音标数据
    private redSprite : Phaser.GameObjects.Sprite ;  //红气泡
    private blueSprite : Phaser.GameObjects.Sprite ; //蓝气泡
    private keySpritesArr : Array<Phaser.GameObjects.Sprite> = []; //键盘集合
    private textsArr : Array<Phaser.GameObjects.Text> = []; //文字集合 
    private imgsArr : Array<Phaser.GameObjects.Image> = []; //彩键集合
    private redText : Phaser.GameObjects.Text ; //元音音标字符
    private blueText : Phaser.GameObjects.Text ; // 辅音音标字符
    private dragX : number = 0;
    private clickTimer : number = 0;
    private show : Array<boolean> = [false,false];
    constructor() {
      super({
        key: "PlayScene"
      });
    }
  
    init(data): void {
      //音标数据绑定
      this.ccData = data && data || {};
      console.log(data);
    }
  
    preload(): void {
      
    }
    
  
    create(): void {
      //初始化渲染
      this.add.tileSprite(0,0,1024,552,'backgroundImg').setOrigin(0);
      this.drawBottomKeys();
      this.drawTopWord();
      this.createAnims();
    }

  
    update(time: number): void {
      
    }

    private dragStartHandle (...args) : void{
      //拖拽开始
      //@ts-ignore
      this.scene.dragX = args[0].worldX;
    }

    private dragMoveHandle (...args) : void {
      //拖拽中
      //@ts-ignore
      let x : number = args[0].worldX - this.scene.dragX;
      //@ts-ignore
      this.scene.dragX = args[0].worldX;
      //@ts-ignore
      this.scene.keySpritesArr.map((r : Phaser.GameObjects.Sprite,i : number)=>{
        r.x += x;
      });
      //@ts-ignore
      this.scene.textsArr.map((r : Phaser.GameObjects.Text,i : number)=>{
        r.x += x;
      })

      //@ts-ignore
      this.scene.imgsArr.map((r : Phaser.GameObjects.Image,i : number)=>{
        r.x += x;
      })
    }

    private dragEndHandle (...args) : void {
      //拖拽结束
      
    }

    private pointerDownHandle (...args) : void{
      //鼠标按下事件
      //@ts-ignore
      this.anims.play('redAnims',false);
      if(this.scene.show.some((r,i)=> !r)){
        //如果都已经显示出来就不必再调用此函数
        this.scene.showWordsHandle('red');
      }
    }
    private pointeUpHandle (...args) : void{
      //@ts-ignore
    }

    private createAnims () : void {
      //创建动画
      this.anims.create({
        key : 'redAnims',
        frames : this.anims.generateFrameNumbers('keys',{start : 0 , end : 1}),
        frameRate : 5,
        repeat : 0,
        yoyo : true
      });

      this.anims.create({
        key : 'blueAnims',
        frames : this.anims.generateFrameNumbers('keys',{start: 2 , end : 3}),
        frameRate : 5,
        repeat : 0,
        yoyo : true
      })
    }

    private drawBottomKeys() : void{
      //渲染键盘
      let dataArr = [1,1,1,1,1,1,1,1];
      let imgKey = 0;
      for ( let i = 0 ; i < dataArr.length ; i ++){
        //渲染白键
        let sprite : Phaser.GameObjects.Sprite = this.add.sprite(i === 0 && 15 || i * 115 + 15,313,'keys',0).setOrigin(0).setInteractive({
          draggable : true
        });
        sprite.setData('index',i); //记住是按的哪个键盘，可以拿到相应的音标
        //渲染音标字符
        let text : Phaser.GameObjects.Text = this.add.text(sprite.x + 26,457,'/ a /',{
          fontSize : 40,
          font: 'bold 40px Arial',
          fill : '#D25F5F',
          bold : true
        });
        this.keySpritesArr.push(sprite);
        this.textsArr.push(text);
        // sprite.on('dragstart',this.dragStartHandle.bind(sprite));
        // sprite.on('drag',this.dragMoveHandle.bind(sprite));
        // sprite.on('dragend',this.dragEndHandle.bind(sprite));
        sprite.on('pointerdown',this.pointerDownHandle.bind(sprite));
        sprite.on('pointerup',this.pointeUpHandle.bind(sprite));
        if(i % 3 === 2 || ( (i % 3 === 0 || i % 3 === 1) && i === (dataArr.length - 1))){
          //间隔渲染彩键
          continue;
        }
        //渲染彩键
        imgKey = (imgKey + 1 > 7 ? 1 : imgKey + 1);
        let img : Phaser.GameObjects.Image = this.add.image( sprite.x + 110,352,'icons',`ImgPiano0${imgKey}.png`).setDepth(100);
        this.imgsArr.push(img);
      }
    }

    private showWordsHandle (flag : string) : void {
      //先是音标字符
      this.show[flag === 'red' && 1 || 0 ] = true;
      this.tweens.add({
        targets : flag === 'red' && this.redSprite || this.blueSprite,
        scaleX : 1,
        scaleY : 1,
        alpha : 1,
        ease : 'Sine.easeInOut',
        duration : 1000,
        onComplete : ()=>{
          this.tweens.add({
            targets : flag === 'red' && this.redText || this.blueText,
            alpha : 1,
            ease : 'Sine.easeInOut',
            duration : 1000,
          })
        }
      })
    }

    private drawTopWord () : void {
      //渲染音标word气泡
      this.redSprite = this.add.sprite(193,74,'icons','bg_word_red.png').setOrigin(0).setAlpha(0).setScale(0);
      this.blueSprite = this.add.sprite(565,74,'icons','bg_word_blue.png').setOrigin(0).setAlpha(0).setScale(0);

      this.redText = this.add.text(this.redSprite.x + 85,124,'/ a /',{
          font: 'bold 53px Arial',
          fill : '#fff',
      }).setAlpha(0);

      this. blueText = this.add.text(this.blueSprite.x + 85,124,'/ a /',{
        font: 'bold 53px Arial',
        fill : '#fff',
      }).setAlpha(0);
      
    }
  };
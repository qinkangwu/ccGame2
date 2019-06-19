import { cirConfigInterface } from '../interface';

export class PlayScene extends Phaser.Scene {
    private leftIcon1 : Phaser.GameObjects.Image;
    private rightIcon2 : Phaser.GameObjects.Image;
    private cir : Phaser.GameObjects.Graphics;
    private textArr : Array<Phaser.GameObjects.Text> = [];

    constructor() {
      super({
        key: "PlayScene"
      });
    }
  
    init(/*params: any*/): void {

    }
  
    preload(): void {
      
    }
  
    create(): void {
      this.cameras.main.setBackgroundColor('#18457E');
      this.drawTopHandle();
      this.drawCirHandle({
        len : 8,
        width : 48,
        xPos : [100, 200, 300, 400, 600, 700, 800, 900]
      });
      this.addTextHandle();
      this.addTouchHandle();
    }

    private addTouchHandle () : void {
      this.input.on('gameobjectdown',(...args)=>{
        console.log(args[1].getData('index'));
      })
    }


    private addTextHandle() : void {
        //添加文本逻辑操作
        let arr : Array<string> = ['/ p /', '/ b /' , '/ t /' , '/ d /' , '/ i /' , '/ o /' , '/ a /' , '/ u /' ];
        let xArr : Array<number> = [100, 200, 300, 400, 600, 700, 800, 900];
        for ( let i = 0 ; i < arr.length ; i ++){
          this.addText(arr[i],i,xArr[i] ,window.innerHeight - 200 , {
            fontSize : 40,
            font: 'bold 40px Arial',
            fill : '#fff',
            bold : true
          });


          //添加event区域
          let zoneObj : Phaser.GameObjects.Zone = this.add.zone(xArr[i] - 50, window.innerHeight - 250, 100, 100);
          zoneObj.setData('index',i);
          zoneObj.depth = 100;
          zoneObj.setInteractive();
        }
      
    }

    private addText(text:string , index : number , x : number , y : number , style : object) : void {
      //添加文本到场景
      this.textArr[index] = this.add.text(x,y,text,style).setOrigin(.5,.5);
    }

    private drawCirHandle (cirConfig : cirConfigInterface,) : void {
      //画圆
      let { len  , width , xPos } = cirConfig;
      this.cir = this.add.graphics();
      for(let i = 0 ; i < len ; i++){
        this.cir.fillStyle(0x000000,.3);
        this.cir.fillCircle(xPos[i] + 5 , window.innerHeight - 195 , width);

        this.cir.fillStyle(i < 4 && 0x00A0A8 || 0xFF5969);
        this.cir.fillCircle(xPos[i],window.innerHeight - 200,width);

      }
    }

    private drawTopHandle () : void{
      //右上角左上角元素
      this.leftIcon1 = this.add.image(0,0,'icon1').setOrigin(0).setScale(.2);
      this.rightIcon2 = this.add.image(window.innerWidth - (this.leftIcon1.width * .2) , 0,'icon1').setOrigin(0).setScale(.2);
    }
  
    update(time: number): void {
      
    }
  };
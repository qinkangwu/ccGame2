import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';

export class Game5LoadScene extends Phaser.Scene {
  private centerText : Phaser.GameObjects.Text; //文本内容
  private DefaultLoadSeconds : number = 50; //每秒增加百分之多少
  private process : number = 0; //进度
  private timer  : Phaser.Time.TimerEvent  ;  //定时器id
  private imgLoadDone : boolean = false;  //图片是否加载完毕
  private dataLoadDone : boolean = true;   //数据是否加载完毕

  constructor() {
    super({
      key: "Game4LoadScene"
    });
  }

  init(/*params: any*/): void {
    //初始化加载进度
    this.centerText = this.add.text(window.innerWidth / 2 ,window.innerHeight /2 ,'0%',{
      fill : '#fff',
      font: 'bold 60px Arial',
      bold : true,
    }).setOrigin(.5,.5);

    // this.getData();

  }

  preload(): void {
    this.load.image('game5Bgi','assets/Game5/bg.png'); 
    this.load.image('mask','assets/Game5/mask.png');
    this.load.image('sketch','assets/Game5/huaban.png');
    this.load.image('civa','assets/Game5/civa.png');
    this.load.image('line','assets/Game5/line.png');
    this.load.image('pen','assets/Game5/pen.png');
    this.load.multiatlas('icons','assets/Game5/imgsJson.json','assets/Game5');
    this.load.on('complete',()=>{
      //资源加载完成的回调
      this.imgLoadDone = true;
    })

  }

  

  create(): void {
    this.loadHandle();
  }

  update(time: number): void {
      //console.log(this.load.progress);
  }

  private getData () : void {
    //获取数据
  }

  private loadHandle () : void {
    //模拟资源加载
     this.timer = this.time.addEvent({
      delay: 1000 / this.DefaultLoadSeconds,                // ms
      callback: ()=>{
        if(this.process >= 99){
          this.centerText.setText('99%');
          if(this.imgLoadDone && this.dataLoadDone){
            this.centerText.setText('100%');
            this.scene.start('Game5PlayScene');
          }
          return;
        }
        this.centerText.setText(++this.process + '%');
      },
      //args: [],
      callbackScope: this,
      loop: true
    });
  }

};
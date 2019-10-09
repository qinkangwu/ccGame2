import 'phaser';
import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import { game4DataItem } from '../../interface/Game4'
const W = 1024;
const H = 552;

export default class Game4LoadScene extends Phaser.Scene {
  private ccData : Array<game4DataItem> = []; //数据
  private centerText : Phaser.GameObjects.Text; //文本内容
  private DefaultLoadSeconds : number = 50; //每秒增加百分之多少
  private process : number = 0; //进度
  private timer  : Phaser.Time.TimerEvent  ;  //定时器id
  private imgLoadDone : boolean = false;  //图片是否加载完毕
  private dataLoadDone : boolean = false;   //数据是否加载完毕

  constructor() {
    super({
      key: "Game4LoadScene"
    });
  }

  init(/*params: any*/): void {
    //初始化加载进度
    this.centerText = this.add.text(W / 2 ,H /2 ,'0%',{
      fill : '#fff',
      font: 'bold 60px Arial',
      bold : true,
    }).setOrigin(.5,.5);

    this.getData();

  }

  preload(): void {
    this.load.image('game4Bgi','assets/Game4/bgi.png'); 
    this.load.image('game4WrongImg','assets/Game4/wrong.png'); 
    this.load.image('goldValue','assets/commonUI/goldValue.png');
    this.load.image('game4Mask','assets/mask/Game4.png');
    this.load.image('jian','assets/Game4/jian.png');
    this.load.image('talk','assets/Game4/talk.png');
    this.load.multiatlas('icons','assets/Game4/imgsJson.json','assets/Game4');
    this.load.multiatlas('game4Icons2','assets/Game4/imgsJson2.json','assets/Game4');
    this.load.multiatlas('shoot','assets/Game4/shoot.json','assets/Game4');
    this.load.audio('bgm','assets/Game4/bgm.mp3');
    this.load.audio('shoot','assets/Game4/shoot.mp3');
    this.load.audio('wrong','assets/Game4/wrong.mp3');
    this.load.audio('tipsSounds','assets/sounds/newJoin/ClickOnTheBalloonToShootDontLetTheWolfRunAway.mp3');
    this.load.audio('tipsSounds2','assets/sounds/newJoin/PayAttentionToTheBlueBag.mp3');
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
    get(apiPath.getWordsData).then((res)=>{
      res && res.code === '0000' && (this.ccData = res.result);
      res && res.code === '0000' && (this.dataLoadDone = true);
    })
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
            this.scene.start('Game4PlayScene',{
              data : this.ccData
            });
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
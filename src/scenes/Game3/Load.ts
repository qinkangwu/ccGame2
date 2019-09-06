import 'phaser';
import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import { game3BookIdParams, game3DataInterface } from '../../interface/Game3';

const W = 1024;
const H = 552;

export default class Game3LoadScene extends Phaser.Scene {
  private centerText : Phaser.GameObjects.Text; //文本内容
  private DefaultLoadSeconds : number = 50; //每秒增加百分之多少
  private process : number = 0; //进度
  private timer  : Phaser.Time.TimerEvent  ;  //定时器id
  private imgLoadDone : boolean = false;  //图片是否加载完毕
  private dataLoadDone : boolean = false;   //数据是否加载完毕
  private curData : Array<game3DataInterface> = [];
  private title : string;

  constructor() {
    super({
      key: "Game3LoadScene"
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
    this.load.image('pianoTopBg','assets/Game3/PianoTopBg.png'); 
    this.load.image('fiveLines','assets/Game3/fiveLines.png'); 
    this.load.image('game3Mask','assets/Game3/mask.png'); 
    this.load.image('leftIcon','assets/Game3/leftIcon.png'); 
    this.load.image('rightIcon','assets/Game3/rightIcon.png'); 
    this.load.multiatlas('game3Icons3','assets/Game3/imgsJson3.json','assets/Game3');
    this.load.multiatlas('icons','assets/Game3/imgsJson1.json','assets/Game3');
    this.load.spritesheet('keys','assets/Game3/imgsJson2.png',{frameWidth : 220 , frameHeight : 438 , margin: 1, spacing: 2});
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

  private getParams () : game3BookIdParams {
    //把hash的参数转换成对象
    let hash : string = window.location.hash;
    let bookIdMatch : RegExpMatchArray = hash.match(/bookId=(.+)&u/);
    let unitIdMatch : RegExpMatchArray = hash.match(/unitId=(.+)&t/);
    let titleMatch : RegExpMatchArray = hash.match(/title=(.+)/);
    let bookId : string = bookIdMatch && bookIdMatch[1];
    let unitId : string = unitIdMatch && unitIdMatch[1];
    let title : string = titleMatch && titleMatch[1];
    return {bookId , unitId , title};
  }

  private getData () : void {
    //获取数据
    let params = this.getParams();
    params.title && (this.title = decodeURIComponent(params.title));
    delete params.title;
    params.bookId = params.bookId || '476351b78d8111e9b8a3d481d7d1b146';
    params.unitId = params.unitId || '02decbcb988511e9b6d5d481d7d1b146';
    this.title = this.title || '小学-EEC1 Unit5 Part A';
    params.bookId && get(apiPath.getUnitDetail + '?' + makeParams(params)).then((res)=>{
      res && res.code === '0000' && (this.curData = res.result);
      this.dataLoadDone = true;
    },()=>{
      // this.dataLoadDone = true;
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
            this.scene.start('Game3PlayScene',{
              data : this.curData,
              title : this.title,
              params : this.getParams()
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
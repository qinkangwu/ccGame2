import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import { item } from "../../interface/Game8";
import 'phaser';

const W = 1024;
const H = 552;

export default class Game8LoadScene extends Phaser.Scene {
  private ccData : item[] = [];
  private centerText : Phaser.GameObjects.Text; //文本内容
  private DefaultLoadSeconds : number = 33; //每秒增加百分之多少
  private process : number = 0; //进度
  private timer  : Phaser.Time.TimerEvent  ;  //定时器id
  private imgLoadDone : boolean = false;  //图片是否加载完毕
  private dataLoadDone : boolean = false;   //数据是否加载完毕

  constructor() {
    super({
      key: "Game8LoadScene"
    });
  }

  init(/*params: any*/): void {
    //初始化加载进度
    this.centerText = this.add.text(W / 2 ,H /2 ,'0%',{
      fill : '#fff',
      font: 'bold 60px Arial',
      bold : true,
      // shadow: {
      //           color: '#fff',
      //           fill: true,
      //           offsetX: 2,
      //           offsetY: 2,
      //           blur: 8
      // }
    }).setOrigin(.5,.5);

    this.getData();

  }

  preload(): void {
    this.load.image('bgi','assets/Game8/bgi.png');
    this.load.image('bmf','assets/Game8/bmf.png');
    this.load.audio('bgm','assets/Game5/bgm.mp3');
    this.load.multiatlas('game8Icons','assets/Game8/imgsJson.json','assets/Game8');
    this.load.multiatlas('game8Icons2','assets/Game8/imgsJson2.json','assets/Game8');
    this.load.image('path1','assets/Game8/path1.png');
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
    get(apiPath.getGame8Data).then(res=>{
      res && res.code === '0000' && (this.ccData = res.result);
      this.dataLoadDone = true;
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
            // this.tweens.add({
            //   targets : this.centerText,
            //   duration : 500,
            //   alpha : 0
            // })
            this.scene.start('Game8PlayScene',{
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
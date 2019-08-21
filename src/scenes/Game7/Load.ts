import 'phaser';
import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import { Game7DataItem } from "../../interface/Game7";
import {resize} from '../../Public/jonny/core'; 

const W = 1024;
const H = 552;

export default class Game7LoadScene extends Phaser.Scene {
  private ccData : Game7DataItem[] = [];
  private centerText : Phaser.GameObjects.Text; //文本内容
  private DefaultLoadSeconds : number = 50; //每秒增加百分之多少
  private process : number = 0; //进度
  private timer  : Phaser.Time.TimerEvent  ;  //定时器id
  private imgLoadDone : boolean = false;  //图片是否加载完毕
  private dataLoadDone : boolean = false;   //数据是否加载完毕

  constructor() {
    super({
      key: "Game7LoadScene"
    });
  }

  init(/*params: any*/): void {
    //初始化加载进度
    // resize.call(this,W,H);
    this.centerText = this.add.text(W / 2 ,H /2 ,'0%',{
      fill : '#fff',
      font: 'bold 60px Arial',
      bold : true,
    }).setOrigin(.5,.5);

    this.getData();

  }

  preload(): void {
    this.load.image('game7Bgi','assets/Game7/bgi.png');
    this.load.image('machine','assets/Game7/machine.png');
    this.load.image('mask','assets/Game7/mask.png');
    this.load.audio('bgm','assets/Game7/bgm.mp3');
    this.load.image('recordIcon','assets/Game7/btn_luyin.png');
    this.load.image('recordLoading','assets/Game7/recordLoading.png');
    this.load.multiatlas('icons','assets/Game7/imgsJson.json','assets/Game7');
    this.load.multiatlas('icons2','assets/Game7/imgsJson2.json','assets/Game7');
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
    get(apiPath.getGame7Data).then(res=>{
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
            this.scene.start('Game7PlayScene',{
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
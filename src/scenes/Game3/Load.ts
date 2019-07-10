import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import { game3BookIdParams, game3DataInterface } from '../../interface/Game3';

export class Game3LoadScene extends Phaser.Scene {
  private centerText : Phaser.GameObjects.Text; //文本内容
  private DefaultLoadSeconds : number = 33; //每秒增加百分之多少
  private process : number = 0; //进度
  private timer  : Phaser.Time.TimerEvent  ;  //定时器id
  private imgLoadDone : boolean = false;  //图片是否加载完毕
  private dataLoadDone : boolean = false;   //数据是否加载完毕
  private curData : Array<game3DataInterface> = [];

  constructor() {
    super({
      key: "Game3LoadScene"
    });
  }

  init(/*params: any*/): void {
    //初始化加载进度
    this.centerText = this.add.text(window.innerWidth / 2 ,window.innerHeight /2 ,'0%',{
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
    this.load.image('game3Bgi','assets/Game3/PianoPageBg.png'); 
    this.load.multiatlas('icons','assets/Game3/imgsJson.json','assets/Game3');
    this.load.spritesheet('keys','assets/Game3/imgsJson2.png',{frameWidth : 110 , frameHeight : 229 , margin: 1, spacing: 2});
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
    let bookIdMatch : RegExpMatchArray = hash.match(/bookId=(.+)&/);
    let unitIdMatch : RegExpMatchArray = hash.match(/unitId=(.+)/);
    let bookId : string = bookIdMatch && bookIdMatch[1];
    let unitId : string = unitIdMatch && unitIdMatch[1];
    return {bookId , unitId};
  }

  private getData () : void {
    //获取数据
    let params = this.getParams();
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
            // this.tweens.add({
            //   targets : this.centerText,
            //   duration : 500,
            //   alpha : 0
            // })
            this.scene.start('Game3PlayScene',{
              data : this.curData
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
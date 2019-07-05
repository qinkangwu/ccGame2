import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';

export class LoadScene extends Phaser.Scene {
  private centerText : Phaser.GameObjects.Text; //文本内容
  private DefaultLoadSeconds : number = 33; //每秒增加百分之多少
  private process : number = 0; //进度
  private timer  : Phaser.Time.TimerEvent  ;  //定时器id
  private imgLoadDone : boolean = false;  //图片是否加载完毕
  private dataLoadDone : boolean = true;   //数据是否加载完毕

  constructor() {
    super({
      key: "LoadScene"
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
    this.load.image('backgroundImg','assets/PianoPageBg.png'); 
    this.load.multiatlas('icons','assets/imgsJson.json','assets');
    this.load.spritesheet('keys','assets/imgsJson2.png',{frameWidth : 110 , frameHeight : 229 , margin: 1, spacing: 2});
    this.load.audio('audioMp3','https://labs.phaser.io/assets/audio/tech/bass.mp3')
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

  private getParams () : object {
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
    get(apiPath.getUnitDetail + '?' + makeParams(params)).then((res)=>{
      console.log(res);
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
            this.scene.start('PlayScene');
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
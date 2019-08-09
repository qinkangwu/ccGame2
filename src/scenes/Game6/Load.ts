import 'phaser';
import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import {Game6DataItem,game6asset} from '../../interface/Game6';

export default class Game6LoadScene extends Phaser.Scene {
  private ccData : Array<Game6DataItem> = [];
  private centerText : Phaser.GameObjects.Text; //文本内容
  private assets:game6asset[] = [{"url":"assets/Game6/bg.png","key":"bg"},{"url":"assets/Game6/bgm.mp3","key":"bgm"},{"url":"assets/Game6/btn_exit.png","key":"btn_exit"},{"url":"assets/Game6/btn_last_1.png","key":"btn_last_1"},{"url":"assets/Game6/btn_last_2.png","key":"btn_last_2"},{"url":"assets/Game6/btn_luyin.png","key":"btn_luyin"},{"url":"assets/Game6/btn_luyin_progress.png","key":"btn_luyin_progress"},{"url":"assets/Game6/btn_sound_off.png","key":"btn_sound_off"},{"url":"assets/Game6/btn_sound_on.png","key":"btn_sound_on"},{"url":"assets/Game6/img_ballgreen.png","key":"img_ballgreen"},{"url":"assets/Game6/img_ballnull.png","key":"img_ballnull"},{"url":"assets/Game6/img_ballpurple.png","key":"img_ballpurple"},{"url":"assets/Game6/img_ballyellow.png","key":"img_ballyellow"},{"url":"assets/Game6/img_cloud.png","key":"img_cloud"},{"url":"assets/Game6/tips_arrow_left.png","key":"tips_arrow_left"},{"url":"assets/Game6/tips_arrow_right.png","key":"tips_arrow_right"},{"url":"assets/Game6/tips_arrow_up.png","key":"tips_arrow_up"},{"url":"assets/Game6/tips_goodjob.png","key":"tips_goodjob"},{"url":"assets/Game6/tips_tryagain.png","key":"tips_tryagain"}];

  constructor() {
    super({
      key: "Game6LoadScene"
    });
    this.ccData = [];
  }

  init(): void {
    this.centerText = this.add.text(window.innerWidth / 2 ,window.innerHeight /2 ,'0%',{
      fill : '#fff',
      font: 'bold 60px Arial',
      bold : true,
    }).setOrigin(.5,.5);
  }

  preload(): void {
    this.load.audio('bgm','assets/Game6/bgm.mp3');
    this.assets.forEach((v)=>{
      this.load.image(v.key,v.url);
    })
    this.load.on("progress",(e:any)=>{
        e = Math.floor(e);
        this.centerText.setText(`${e*100}%`);
    })
    this.load.on("complete",(e:any)=>{
      this.getData();
    })
    }

  create(): void {
    
  }

  private getData(){
    get(apiPath.getWordsData).then((res)=>{
      res&&res.code==='0000'&&(this.ccData = res.result);
    }).then(()=>{
      this.scene.start('Game6PlayScene',{
        data : this.ccData,
        index:0
      });
    })
  }

};
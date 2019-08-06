import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import {game6DataItem,game6asset} from '../../interface/Game6';

export class Game6LoadScene extends Phaser.Scene {
  private ccData : Array<game6DataItem> = [];
  private centerText : Phaser.GameObjects.Text; //文本内容
  private assets:game6asset[] = [{"src":"assets/Game6/bg.png","id":"bg"},{"src":"assets/Game6/btn_exit.png","id":"btn_exit"},{"src":"assets/Game6/btn_last_1.png","id":"btn_last_1"},{"src":"assets/Game6/btn_last_2.png","id":"btn_last_2"},{"src":"assets/Game6/btn_luyin.png","id":"btn_luyin"},{"src":"assets/Game6/btn_luyin_progress.png","id":"btn_luyin_progress"},{"src":"assets/Game6/btn_sound_off.png","id":"btn_sound_off"},{"src":"assets/Game6/btn_sound_on.png","id":"btn_sound_on"},{"src":"assets/Game6/img_ballgreen.png","id":"img_ballgreen"},{"src":"assets/Game6/img_ballnull.png","id":"img_ballnull"},{"src":"assets/Game6/img_ballpurple.png","id":"img_ballpurple"},{"src":"assets/Game6/img_ballyellow.png","id":"img_ballyellow"},{"src":"assets/Game6/img_cloud.png","id":"img_cloud"},{"src":"assets/Game6/tips_arrow_left.png","id":"tips_arrow_left"},{"src":"assets/Game6/tips_arrow_right.png","id":"tips_arrow_right"},{"src":"assets/Game6/tips_arrow_up.png","id":"tips_arrow_up"}];

  constructor() {
    super({
      key: "Game6LoadScene"
    });
  }

  init(/*params: any*/): void {
    this.centerText = this.add.text(window.innerWidth / 2 ,window.innerHeight /2 ,'0%',{
      fill : '#fff',
      font: 'bold 60px Arial',
      bold : true,
    }).setOrigin(.5,.5);
  }

  preload(): void {
    this.load.image('bg','assets/Game6/bg.png'); 
    this.assets.forEach((v)=>{
      this.load.image(v.id,v.src);
    })
    this.load.on("progress",(e:any)=>{
        e = Math.floor(e);
        this.centerText.setText(`${e*100}%`);
    })
    }

  create(): void {
    this.getData();
  }

  private getData(){
    get(apiPath.getWordsData).then((res)=>{
      res&&res.code==='0000'&&(this.ccData = res.result);
    }).then(()=>{
      this.scene.start('Game4PlayScene',{
        data : this.ccData
      });
    })
  }

};
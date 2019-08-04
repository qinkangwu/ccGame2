import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import {game6DataItem } from '../../interface/Game6'

export class Game6LoadScene extends Phaser.Scene {
  private ccData : Array<game6DataItem> = [];
  private centerText : Phaser.GameObjects.Text; //文本内容

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
    this.load.image('game4Bgi','assets/Game6/bgi.png'); 
    this.load.image('game4WrongImg','assets/Game6/wrong.png'); 
    this.load.multiatlas('icons','assets/Game6/imgsJson.json','assets/Game6');
    this.load.multiatlas('icons2','assets/Game6/imgsJson2.json','assets/Game6');
    this.load.multiatlas('shoot','assets/Game6/shoot.json','assets/Game6');
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
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';

const W = 1024;
const H = 552;

export default class Game12PlayScene extends Phaser.Scene {
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    constructor() {
      super({
        key: "Game12PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      this.createBgi(); //背景
      this.createBgm(); //背景音乐
      this.createTopContent() ; //创建上面的内容
      this.createContent(); //创建下面的内容
      new CreateBtnClass(this,{
        bgm : this.bgm,
      }); //公共按钮组件
    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .2
      })
    }

    private createBgi () : void {
      //背景
      this.add.image(0,0,'bgi').setDisplaySize(W,H).setOrigin(0);
    }

    private createTopContent() : void {
      this.add.image(228.5,129.5,'leftContent').setOrigin(.5);
      this.add.image(775.5,129.5,'rightContent').setOrigin(.5);
    }

    private createContent () : void {
      for(let i = 0 ; i < 10 ; i ++){
        if(i < 5){
          this.add.image(97 + (i * 115) + (i * 63),272,'content').setOrigin(0);
        }else{
          this.add.image(97 + ((i - 5) * 115) + ((i - 5) * 63),412,'content').setOrigin(0);
        }
      }
    }

    update(time: number , delta : number): void {
    }
  };
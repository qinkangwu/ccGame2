import "phaser";
import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import CreateBtnClass from '../../Public/CreateBtnClass';
import CreateMask from '../../Public/CreateMask';

const W = 1024;
const H = 552;

export default class Game10PlayScene extends Phaser.Scene {
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private goldIcon : Phaser.GameObjects.Image; //金币数量
    private goldText : Phaser.GameObjects.Text; //金币文本
    private lifeIcon : Phaser.GameObjects.Image; //金币数量
    private lifeText : Phaser.GameObjects.Text; //金币文本
    private comment : Phaser.GameObjects.Image; //提示按钮
    private content : Phaser.GameObjects.Text; //内容
    private keywordsArr : Phaser.GameObjects.Sprite[] = [] ; // 键盘集合
    private keywordsArr2 : Phaser.GameObjects.Text[] = [] ;//键盘文本集合
    private goldNumber : object = {
      n : 0,
      l : 0,
      c : 5
    }; //金币数量文本
    private sholdGetGold : Phaser.GameObjects.Text; //答对获取到的金币
    private wordsArr : string[] = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']; //基础单词随机组合数组
    private submitBtn : Phaser.GameObjects.Sprite; //提交键盘
    private wordGraphics : Phaser.GameObjects.Graphics ; //字符末尾
    private graphicsTweens : Phaser.Tweens.Tween; //字符末尾动画引用
    constructor() {
      super({
        key: "Game10PlayScene"
      });
    }
  
    init(data): void {
    }
  
    preload(): void {
    }
    
  
    create(): void {
      this.createBgi(); //背景
      this.createBgm(); //bgm
      this.createGold(); //金币
      this.renderKeyBorad(); //渲染键盘
      new CreateBtnClass(this,{
        bgm : this.bgm,
        previewCallback : ()=>{
          this.setContent('');
        },
        commentCallback : ()=>{},
        previewPosition : {
          y : H - 140,
          _s : true,
          alpha : 1
        }
      }); //公共按钮组件
      new CreateMask(this,()=>{
        this.initAnims();
        this.renderWordGraphics();
      }); //遮罩层
    }

    private initAnims() : void {
      //入场动画
      this.keywordsArr.map((r , i )=>{
        this.tweens.add({
          targets : [r,this.keywordsArr2[i]],
          ease: 'Power3',
          delay : i * 100,
          duration : 500,
          y : `+=${H}`
        })
      })
      this.tweens.add({
        targets : this.submitBtn,
        ease: 'Power3',
        delay : 1000,
        duration : 500,
        y : `+=${H}`
      });
      this.anims.create({
        key : 'submit',
        frames : this.anims.generateFrameNames('game10icons1',{start : 0 , end : 2 , zeroPad: 0 , prefix : 'btn_submit' , suffix : '.png' }),
        frameRate : 10,
        repeat : 0,
        yoyo : true
      });
      this.anims.create({
        key : 'keydown',
        frames : this.anims.generateFrameNames('game10icons3',{start : 0 , end : 2 , zeroPad: 0 , prefix : 'btn_keybord' , suffix : '.png' }),
        frameRate : 10,
        repeat : 0,
        yoyo : true
      });
    }

    private createGold () : void {
      //创建按钮
      this.goldIcon = this.add.image(55,H - 55,'game10icons2','gold.png')
        .setOrigin(.5)
        .setDisplaySize(60,60)
        .setInteractive()
      //@ts-ignore
      this.goldText = this.add.text(this.goldIcon.x + 14,this.goldIcon.y + 17,this.goldNumber.n + '',{
        fontSize: "14px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#fff',
      }).setOrigin(.5);
      this.lifeIcon = this.add.image(55 , H - 147.5 , 'game10icons2' , 'life.png');
      //@ts-ignore
      this.lifeText = this.add.text(this.lifeIcon.x + 14,this.lifeIcon.y + 12,this.goldNumber.l + '',{
        fontSize: "14px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#fff',
      }).setOrigin(.5);
      //@ts-ignore
      this.sholdGetGold = this.add.text(326,430,this.goldNumber.c,{
        fontSize: "35px",
        fill : '#F9752F',
      }).setOrigin(.5);
    }

    private renderKeyBorad() : void {
      //渲染键盘
      for(let i = 0 ; i < 10 ; i ++) {
        if(i < 4){
          let item : Phaser.GameObjects.Sprite = this.add.sprite(600 + (i * 77),227,'game10icons3','btn_keybord1.png')
            .setOrigin(0)
            .setDisplaySize(89,87)
            .setInteractive()
            .setData('index',i)
          this.keywordsArr.push(item);
          this.keywordsArr2.push(
            this.add.text(item.x + item.width / 4 + 2, item.y + item.height / 4 - 5, this.wordsArr[i],{
              fontSize: "40px",
              fontFamily:"Arial Rounded MT Bold",
              fill : '#F293B9',
            }).setOrigin(.5)
          )
        }else if ( i >= 4 && i < 8 ){
          let item : Phaser.GameObjects.Sprite = this.add.sprite(600 + ((i - 4) * 77),314,'game10icons3','btn_keybord1.png')
            .setOrigin(0)
            .setDisplaySize(89,87)
            .setInteractive()
            .setData('index',i)
          this.keywordsArr.push(item);
          this.keywordsArr2.push(
            this.add.text(item.x + item.width / 4 + 2, item.y + item.height / 4 - 5, this.wordsArr[i],{
              fontSize: "40px",
              fontFamily:"Arial Rounded MT Bold",
              fill : '#F293B9',
            }).setOrigin(.5)
          )
        }else{
          let item : Phaser.GameObjects.Sprite = this.add.sprite(600 + ((i - 8) * 77),400,'game10icons3','btn_keybord1.png')
            .setOrigin(0)
            .setDisplaySize(89,87)
            .setInteractive()
            .setData('index',i)
          this.keywordsArr.push(item);
          this.keywordsArr2.push(
            this.add.text(item.x + item.width / 4 + 2, item.y + item.height / 4 - 5, this.wordsArr[i],{
              fontSize: "40px",
              fontFamily:"Arial Rounded MT Bold",
              fill : '#F293B9',
            }).setOrigin(.5)
          )
        }
      }
      this.submitBtn = this.add.sprite(753,400,'game10icons1','btn_submit1.png')
        .setOrigin(0)
        .setDisplaySize(166,87)
        .setInteractive()
        .setData('submitBtn',true);
      this.submitBtn.on('pointerdown',this.itemClickHandle.bind(this,this.submitBtn));
      this.keywordsArr.map((r,i)=>{
        r && (r.y -= H );
        this.keywordsArr2[i].y && ( this.keywordsArr2[i].y -= H );
        r.on('pointerdown',this.itemClickHandle.bind(this,r))
      });
      this.submitBtn.y -= H;
    }


    private itemClickHandle(...args) : void {
      //键盘点击事件
      let obj = args[0];
      if(!(obj instanceof Phaser.GameObjects.Sprite)) return;
      if(obj.getData('submitBtn')){
        //提交按钮
        obj.play('submit');
        return;
      }
      obj.play('keydown');
      this.setContent(this.content.text += this.wordsArr[obj.getData('index')]);
    }

    private setContent(content : string) : void {
      content = content.substr(0,6);
      this.clearGraphics();
      this.content.setText(content);
      this.renderWordGraphics();
    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .3
      })
    }

    private createBgi () : void {
      //背景
      this.add.image(0,0,'bgi').setDisplaySize(W,H).setOrigin(0);
      this.content = this.add.text(640,56,'',{
        fontSize: "80px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#77F0FF',
      }).setOrigin(0);
    }

    private clearGraphics() : void {
      if(!this.wordGraphics) return;
      this.wordGraphics.clear();
      this.wordGraphics.destroy();
      this.wordGraphics = null;
      this.graphicsTweens.stop();
      this.tweens.remove(this.graphicsTweens);
    }

    private renderWordGraphics () : void {
      //渲染字符末尾的矩形
      this.wordGraphics = this.wordGraphics || this.add.graphics();
      this.wordGraphics.fillStyle(0x77F0FF);
      this.wordGraphics.fillRoundedRect(this.content.x + this.content.width,this.content.y + this.content.height,42,8,4);
      this.graphicsTweens = this.tweens.add({
        targets : this.wordGraphics,
        alpha : 0,
        yoyo : true,
        repeat : -1,
        duration : 500
      })
    }

    update(time: number , delta : number): void {
    }
  };
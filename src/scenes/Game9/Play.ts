import 'phaser';
import { Game9DataItem } from '../../interface/Game9';
import { cover, rotateTips } from '../../Public/jonny/core';
import { Button, ButtonContainer, ButtonMusic, ButtonExit } from '../../Public/jonny/components';
import PlanAnims from '../../Public/PlanAnims';

const vol = 0.3; //背景音乐的音量
var index: number; //题目的指针，默认为0

//机器人
class CivaMen extends Phaser.GameObjects.Image{
  public dx:number;
  public dy:number;
  constructor(scene:Phaser.Scene,x: number, y: number, texture: string,dx:number,dy:number){
    super(scene,x,y,texture);
    this.dx = dx;
    this.dy = dy;
    this.init();
  }

  private init(){
    this.setOrigin(0.5,0);   //注册点设置为脚板底
  }

  public jumpIn():void{
    /**
     * work init
     */
  }
}


export default class Game9PlayScene extends Phaser.Scene {
  private status: string;//存放过程的状态

  private ccData: Array<Game9DataItem> = [];

  //静态开始
  private stage: Phaser.GameObjects.Container; // 舞台
  private bgm: Phaser.Sound.BaseSound; //背景音乐
  private clickSound: Phaser.Sound.BaseSound; //点击音效
  private correctSound: Phaser.Sound.BaseSound; //正确音效
  private wrongSound: Phaser.Sound.BaseSound; //错误音效
  private cover: Phaser.GameObjects.Container;  //封面
  private bg: Phaser.GameObjects.Image; //背景图片
  private btnExit: Button;  //退出按钮
  private btnSound: ButtonMusic; //音乐按钮
  private originalSoundBtn: Button; //原音按钮
  private tryAginListenBtn: Button; //在听一次按钮
  private planAnims: PlanAnims;
  //静态结束

  //动态开始
  private wordSpeaker: Phaser.Sound.BaseSound;   //单词播放器
  private cookies: Phaser.GameObjects.Container[] = []; //饼干包含文字
  private nullCookies: Phaser.GameObjects.Image[] = []; //空饼干
  private civaMen:CivaMen; //机器人 
  //动态开始

  //层次
  private layer0: Phaser.GameObjects.Container;  //bg,
  private layer1: Phaser.GameObjects.Container;  //nullcookie
  private layer2: Phaser.GameObjects.Container;  //cookie,civa
  private layer3: Phaser.GameObjects.Container;  //civa
  private layer4: Phaser.GameObjects.Container;  //btnExit,btnSound

  constructor() {
    super({
      key: "Game9PlayScene"
    });
  }

  init(res: { data: any[], index: number }) {
    index = res.index;
    this.ccData = res.data;
    console.log(this.ccData);
  }

  preload(): void {

  }

  create(): void {
    if (index === 0) {
      this.scene.pause();
      rotateTips.init();
      cover(this, "cover", () => {
        this.planAnims.show(index + 1)
      });
    } else {
      this.planAnims.show(index + 1);
    }
    this.createStage();
    this.createActors();
  }

  update(time: number, delta: number): void {
    this.btnSound.mountUpdate();
  }

  /**
   * 创建静态场景
   */
  createStage() {
    let that = this;

    for (let i = 0; i < 5; i++) {
      this[`layer${i}`] = new Phaser.GameObjects.Container(this);
      this.add.existing(this[`layer${i}`]);
    }

    let bg = this.add.image(0, 0, "bg").setOrigin(0);
    this.btnExit = new ButtonExit(this);
    this.btnSound = new ButtonMusic(this);
    this.originalSoundBtn = new Button(this, 25 + 60 * 0.5, 467 + 60 * 0.5, "originalSoundBtn");
    this.tryAginListenBtn = new Button(this, 89, 435 + 50, "try-agin-btn");
    this.tryAginListenBtn.setOrigin(0, 1);
    this.layer0.add(bg);
    this.layer4.add([this.btnExit, this.btnSound, this.originalSoundBtn, this.tryAginListenBtn]);
    this.originalSoundBtn.on("pointerdown", this.playWord.bind(that));

    this.bgm = this.sound.add('bgm');
    this.bgm.addMarker({
      name: "start",
      start: 0
    } as Phaser.Types.Sound.SoundMarker);
    let config: Phaser.Types.Sound.SoundConfig = {
      loop: true,
      volume: vol
    }

    this.bgm.play("start", config);
    this.clickSound = this.sound.add('click');
    this.correctSound = this.sound.add('correct');
    this.wrongSound = this.sound.add('wrong');

    this.planAnims = new PlanAnims(this, this.ccData.length);
  }

  /**
   * 创建演员们
   */
  createActors(): void {
    //单词发生器
    let wordSound = this.ccData[index].name;
    this.wordSpeaker = this.sound.add(wordSound);

    //音标发生器
    //this.phonetic = new Audio();

    //饼干－－－－
    let cookiesPool = this.ccData[index].phoneticSymbols.concat(this.ccData[index].uselessPhoneticSymbols);
    cookiesPool.sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5);//两次乱序
    cookiesPool.forEach((v, i) => {
      let _ix = i;
      _ix = _ix % 4;
      let _iy = Math.floor(i / 4);
      let _x = 287 + 158 * _ix;
      let _y = 70.05 + 183 * _iy;
      let _cookieImg = new Phaser.GameObjects.Image(this, 0, 0, "cookie");
      _cookieImg.setAlpha(1);
      let _cookieText = new Phaser.GameObjects.BitmapText(this, 0, 0 + 5, "GenJyuuGothic47", v.name, 35, 0).setOrigin(0.5);
      let _cookie = new ButtonContainer(this, new Phaser.Geom.Rectangle(-60, -47, 120, 91), Phaser.Geom.Rectangle.Contains).setAlpha(1);
      _cookie.name = v.name;
      _cookie.minAlpha = 1;
      _cookie.pointerdownFunc = this.playPhonetic.bind(this, _cookie.name);
      _cookie.add([_cookieImg, _cookieText]);
      _cookie.x = _x;
      _cookie.y = _y;
      _cookie.setData("initPosition", { x: _cookie.x, y: _cookie.y });
      _cookie.setData("hit", 0);
      _cookie.setDepth(2);
      this.layer2.add(_cookie);
      this.cookies.push(_cookie);
    })


    //饼干 初始化--------------
    this.cookies.forEach((cookie, index) => {
      let i = index;
      i = i % 4;
      cookie.y += (50 + i * 50);
      cookie.setAlpha(0);
    })

    //空饼干--------
    let phoneticSymbols = this.ccData[index].phoneticSymbols;
    let offsetX: number = 0;
    let cookies = this.cookies;
    phoneticSymbols.forEach((v, i, arr) => {
      switch (arr.length) {
        case 1:
          offsetX = (cookies[i].x + cookies[i + 3].x) >> 1;
          break;
        case 2:
          offsetX = (cookies[i * 2].x + cookies[i * 2 + 1].x) >> 1;
          break;
        case 3:
          offsetX = (cookies[i].x + cookies[i + 1].x) >> 1;
          break;
        case 4:
          offsetX = cookies[i].x;
          break;
      }
      let _nullCookieImg = new Phaser.GameObjects.Image(this, offsetX, 472, "null-cookie");
      _nullCookieImg.setDepth(1);
      _nullCookieImg.name = v.name;
      _nullCookieImg.setAlpha(0);
      this.layer1.add(_nullCookieImg);
      this.nullCookies.push(_nullCookieImg);
      this.physics.world.enable(_nullCookieImg);
      (<Phaser.Physics.Arcade.Body>_nullCookieImg.body).setSize(_nullCookieImg.width * 0.2, _nullCookieImg.height * 0.2);
    });

    if (index === 0) {
      setTimeout(this.gameStart.bind(this, cookiesPool), 3500);
    } else {
      this.gameStart(cookiesPool);
    }
  }

  /**
   * 游戏开始
   */
  private gameStart(cookiesPool): void {
    var nullCookieAni = () => {
      this.nullCookies.forEach((nullcookie, i) => {
        this.tweens.add({
          targets: nullcookie,
          alpha: 1,
          delay: 500 * i,
          duration: 500,
          OnComplete:()=>{
            this.dragEvent();
          }
        })
      })
    }


    let cookieIndex = 0;
    let bounceAni = () => {
      let that = this;
      this.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
        targets: this.cookies[cookieIndex],
        duration: 300,
        alpha: 1,
        y: this.cookies[cookieIndex].getData("initPosition").y,
        ease: "Bounce.easeOut",
        onComplete: function () {
          cookieIndex += 1;
          if (cookieIndex === 2) {
            that.wordSpeaker.play();
          }
          if (cookieIndex > cookiesPool.length - 1) {
            nullCookieAni(); 
            return false;
          } else {
            bounceAni();
          }
        }
      })
    };

    bounceAni();

  }

  /**
   * 播放目前的单词
   */
  private playWord(): void {
    this.wordSpeaker.play();
  }

  /**
   * 播放饼干上的音标
   */
  private playPhonetic(key): void {
    let _phonetic: Phaser.Sound.BaseSound = this.sound.add(key);
    _phonetic.play();
    _phonetic.on("complete", function () {
      _phonetic.destroy();
    });
  }


  /**
   * 执行拖拽的互动 
   */
  private dragEvent(): void {
    let that = this;

    let hits: number = 0; //碰撞次数
    this.physics.world.enable(this.cookies);
    this.cookies.forEach(cookieEvent);

    function cookieEvent(cookie: ButtonContainer) {
      (cookie.body as Phaser.Physics.Arcade.Body)
        .setCollideWorldBounds(true)
        .setSize(cookie.shape.width, cookie.shape.height)
        .setOffset(cookie.shape.x, cookie.shape.y);
      that.input.setDraggable(cookie, true);
      cookie.on("dragstart", cookieOnDragStart);
      cookie.on("drag", cookieOnDrag);
      cookie.on("dragend", cookieOnDragEnd);
    }

    function cookieOnDrag(pointer, dragX, dragY) {
      if (!this.interactive) {
        return false;
      }
      this.x = dragX;
      this.y = dragY;
    }

    function cookieOnDragStart(pointer, startX, startY) {
      if (!this.interactive) {
        return false;
      }
      that.clickSound.play();
    }


    function cookieOnDragEnd() {
      if (!this.interactive) {
        return false;
      }
      that.clickSound.play();
      if (this.getData("hit") === 0) {
        this.setPosition(
          this.getData("initPosition").x,
          this.getData("initPosition").y
        );
      }
    }

    let collisionNullcookies: Phaser.GameObjects.Image[] = [];
    let collider_1 = that.physics.add.overlap(that.cookies, that.nullCookies, overlapHandler_1, null, this);

    function overlapHandler_1(...args) {
      let hits:number=0;

      args[0].setData("hit", 1);
      args[0].setPosition(args[1].x, args[1].y);
      that.layer2.remove(args[0]);
      that.layer1.add(args[0]);
      args[0].interactive = false;

      that.physics.world.disable(args[0]);

      let collideCookie = args[1].getData("cookie");
      if (collideCookie !== undefined && collideCookie.getData("hit") === 1) {
        collideCookie.setData("hit", 0);
        (collideCookie as Phaser.GameObjects.Container).setPosition(
          collideCookie.getData("initPosition").x,
          collideCookie.getData("initPosition").y
        )
        collideCookie.interactive = true;
        setTimeout(() => {
          that.layer2.add(collideCookie);
          that.layer1.remove(collideCookie);
          that.physics.world.enable(collideCookie);
        }, 1000);
      }
      args[1].setData("cookie", args[0]);
      args[1].setData("collision",1);
      that.playPhonetic(args[0].name);
      that.nullCookies.forEach((nullCookie,i)=>{
        let result = nullCookie.getData("collision");
        if(result!==undefined){
          hits+=result; 
        } 
        if(hits===that.nullCookies.length){
            dragEnd(); 
        }
      })
    }

    function dragEnd() {
      console.log("拖拽结束");
      that.cookies.forEach(v => {
        v.off("dragstart");
        v.off("drag");
        v.off("dragend");
      })
    }


  }

}
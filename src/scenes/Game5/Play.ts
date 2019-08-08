import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import { game5DataItem } from "../../interface/Game5";

export class Game5PlayScene extends Phaser.Scene {
    private ccData : game5DataItem[] ; //数据
    private backToListBtn : Phaser.GameObjects.Image ; //返回列表按钮
    private clearDrawBtn : Phaser.GameObjects.Image; //清除按钮
    private submitBtn : Phaser.GameObjects.Image ; //提交按钮
    private musicBtn : Phaser.GameObjects.Image ; //音乐播放按钮
    private sketch : Phaser.GameObjects.Image ; //画板
    private civa : Phaser.GameObjects.Sprite ; //civa
    private wordsObj : Phaser.GameObjects.Text; //单词板
    private wordsNumObj : Phaser.GameObjects.Text; //单词索引
    private playVideo : Phaser.GameObjects.Sprite; //播放视频按钮
    private penObj : Phaser.GameObjects.Sprite; //画笔
    private area : Phaser.GameObjects.RenderTexture; //绘制区域
    private timer : number ; //定时器id
    private bgm : Phaser.Sound.BaseSound ; //背景音乐
    private bgmAnims : Phaser.Tweens.Tween; //背景音乐旋转动画
    private bgmFlag : boolean = true ; //音乐开关
    private guijiObj : Phaser.Textures.Frame; //笔迹图片
    private dataIndex : number = 0 ; //数据当前索引
    private isDraw : boolean = false; //是否有绘画
    private sketchWords : Phaser.GameObjects.Text; //画板路径字符
    private tips : Phaser.GameObjects.Sprite; //鼓励标语
    private particles : Phaser.GameObjects.Particles.ParticleEmitterManager ; // 粒子控制器
    private emitters  : Phaser.GameObjects.Particles.ParticleEmitter ;  //粒子发射器
    private playBtn : Phaser.GameObjects.Image ; //播放音频按钮
    constructor() {
      super({
        key: "Game5PlayScene"
      });
    }
  
    init(data): void {
      data && data.data && (this.ccData = data.data);
    }
  
    preload(): void {
      this.load.audio('bgm','assets/Game5/bgm.mp3');
      this.load.audio('error','assets/Game5/error.mp3');
    }
    
  
    create(): void {
      this.createBgi(); //背景
      this.createBtn(); //按钮
      this.createSketch(); //创建画板
      this.createCiva() ; //创建civa
      this.createMask(); //展示遮罩
      this.createBgm(); //播放背景音乐
      this.createEmitter(); //创建粒子系统
      this.loadMusic(this.ccData);
      // this.createDom(); //渲染html
    }

    private loadMusic (data : Array<game5DataItem>) : void {
      //加载音频
      data && data.map((r :game5DataItem , i : number )=>{
        this.load.audio(r.id,r.audioKey);
      })
      this.load.start(); //preload自动运行，其他地方加载资源必须手动启动，不然加载失效
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private createEmitter () : void {
      //创建粒子效果发射器
      this.particles = this.add.particles('particles');
      this.emitters = this.particles.createEmitter({
        lifespan : 1000,
        speed : { min: 300, max: 400},
        alpha : {start: 0.7, end: 0 },
        scale: { start: 0.7, end: 0 },
        rotate: { start: 0, end: 360, ease: 'Power2' },
        blendMode: 'ADD',
        on : false
      })
    }

    private boom () : void {
      this.emitters.explode(40,this.tips.x,this.tips.y);
    }

    private createBgm () : void{
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .3
      })
    }

    private wordsAnims () : void {
      //words展示动画
      this.tweens.add({
        targets : [this.civa,this.wordsObj,this.wordsNumObj,this.playVideo],
        y : `+=${window.innerHeight}`,
        ease: 'Sine.easeInOut',
        duration : 500,
      })
    }

    private createDom () : void {
      let elem : Phaser.GameObjects.DOMElement = this.add.dom(window.innerWidth / 2 ,window.innerHeight / 2).createFromCache('htmlDemo');
      elem.setOrigin(.5);
      elem.setDepth(1000);
    }

    private submitHandle () : void {
      //提交操作
      if(!this.isDraw) return this.playMusic('error');
      this.tipsAnims();
      this.area.clear();
      this.isDraw = false;
      this.clearDrawHandle(false);
      this.dataIndex = this.dataIndex + 1 > this.ccData.length - 1 ? 0 : this.dataIndex + 1;
      this.tweens.add({
        targets : [this.civa,this.wordsObj,this.wordsNumObj,this.playVideo],
        duration : 500,
        y : `-=${window.innerHeight}`,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.nextTipsHandle();
          this.tweens.add({
            targets : [this.civa,this.wordsObj,this.wordsNumObj,this.playVideo],
            duration : 500,
            y : `+=${window.innerHeight}`,
            ease : 'Sine.easeInOut',
          })
        }
      })
    }

    private tipsAnims () : void {
      this.boom();
      this.tweens.timeline({
        targets : this.tips,
        ease : 'Sine.easeInOut',
        duration : 100,
        tweens : [
          {
            scaleX : 1,
            scaleY : 1
          },
          {
            scaleX : .8,
            scaleY : .8
          },
          {
            scaleX : 1,
            scaleY : 1
          }
        ]
      });
      this.time.addEvent({
        delay : 1000,
        callback : ()=>{
          this.tips.setScale(0);
        }
      })
    }

    private nextTipsHandle () : void {
      this.wordsObj.setText(this.ccData[this.dataIndex].name);
      this.sketchWords.setText(this.ccData[this.dataIndex].name.split('').join(' '));
      this.wordsNumObj.setText(`${this.dataIndex + 1}/${this.ccData.length}`);
    }
    
    private createCiva () : void {
      //创建civa
      this.civa = this.add.sprite(107 , -window.innerHeight ,'civa').setOrigin(0).setDisplaySize(267 , 528);
      this.wordsObj = this.add.text(this.civa.x + this.civa.width / 2,this.civa.y + 230,this.ccData[this.dataIndex].name,{
        font: 'Bold 115px Arial Rounded MT',
        fill : '#856EB4',
      }).setOrigin(0.5);
      this.wordsNumObj = this.add.text(this.civa.x + this.civa.width / 2 , this.civa.y + this.civa.height / 2 + 40,`${this.dataIndex + 1}/${this.ccData.length}`,{
        font: '20px Arial Rounded MT',
        fill : '#D5D2EF',
      }).setOrigin(.5);
      this.playVideo = this.add.sprite(this.civa.x + 220,this.civa.y + 170,'icons','btn_vedio／02.png').setOrigin(.5).setDisplaySize(35,35);
    }

    private createSketch () : void {
      //创建画板
      this.sketch = this.add.image(window.innerWidth - 347,window.innerHeight / 2,'sketch').setOrigin(.5).setDisplaySize(529,552);
      this.submitBtn = this.add.image(this.sketch.x,this.sketch.y + 211,'icons','btn_tijiao.png').setOrigin(.5).setInteractive().setData('isBtn',true).setData('_s',true);
      this.add.image(this.sketch.x,this.sketch.y,'line').setOrigin(.5).setDisplaySize(317,247);
      this.penObj = this.add.sprite(this.sketch.x,this.sketch.y,'pen').setOrigin(0).setDepth(900).setAlpha(0);
      this.area = this.add.renderTexture(this.sketch.x - this.sketch.width / 2 + 70,this.sketch.y - 150,400,300).setOrigin(0).setInteractive().setDepth(899);
      this.guijiObj = this.textures.getFrame('guiji');
      this.guijiObj.width = 10;
      this.guijiObj.height = 10;
      this.sketchWords = this.add.text(this.sketch.x,this.sketch.y,this.ccData[this.dataIndex].name.split('').join(' '),{
        font: '200px sxdc',
        fill : '#F98E56'
      }).setOrigin(.5).setAlpha(.1);
    }

    private initEmitHandle () : void {
      //绑定事件
      this.area.on('pointerdown',this.pointerHandle.bind(this,'down'));
      this.area.on('pointermove',this.pointerHandle.bind(this,'move'));
      this.area.on('pointerup',this.pointerEndHandle.bind(this,'end'));
      this.backToListBtn.on('pointerdown',this.backToListHandle.bind(this));
      this.clearDrawBtn.on('pointerdown',this.clearDrawHandle.bind(this));
      this.submitBtn.on('pointerdown',this.submitHandle.bind(this));
      this.musicBtn.on('pointerdown',this.switchMusic.bind(this,this.bgmFlag));
      this.playBtn.on('pointerdown',this.playAudioHandle.bind(this));
      this.input.on('pointerdown',this.globalClickHandle.bind(this));
      this.input.on('gameobjectover',this.gameOverHandle.bind(this));
      this.input.on('gameobjectout',this.gameOutHandle.bind(this));
    }

    private gameOutHandle (...args) : void {
      let obj : object = args[1];
      if(!obj) return;
      //@ts-ignore
      let isBtn : boolean = obj.getData('isBtn');
      //@ts-ignore
      let _s : boolean = obj.getData('_s');
      if(!isBtn || _s) return;
      //@ts-ignore
      obj.alpha = .6;
    }

    private gameOverHandle(...args) : void {
      let obj : object = args[1];
      if(!obj) return;
      //@ts-ignore
      let isBtn : boolean = obj.getData('isBtn');
      if(!isBtn) return;
      //@ts-ignore
      obj.alpha = 1;
      this.tweens.add({
        targets : obj,
        scaleX : 1.2,
        scaleY : 1.2,
        duration : 200,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.tweens.add({
            targets : obj,
            scaleX : 1,
            scaleY : 1,
            duration : 200,
            ease : 'Sine.easeInOut',
          })
        }
      })
    }

    private globalClickHandle (...args) : void {
      //点击按钮缩放
      let obj : object = args[1][0];
      if(!obj) return;
      //@ts-ignore
      let isBtn : boolean = obj.getData('isBtn');
      if(!isBtn) return;
      this.tweens.add({
        targets : obj,
        scaleX : 1.2,
        scaleY : 1.2,
        duration : 200,
        ease : 'Sine.easeInOut',
        onComplete : ()=>{
          this.tweens.add({
            targets : obj,
            scaleX : 1,
            scaleY : 1,
            duration : 200,
            ease : 'Sine.easeInOut',
          })
        }
      })

    }

    private playAudioHandle () : void {
      this.playBtn.alpha = 1 ;
      this.tweens.add({
        targets : this.playBtn,
        delay : 3000,
        alpha : .6,
        ease: 'Sine.easeInOut',
        duration : 500
      })
      this.playMusic(this.ccData[this.dataIndex].id);
    }

    private pointerHandle(handle : string , pointer : Phaser.Input.Pointer) : void {
      //绘制
      if(!pointer || !pointer.isDown) return;
      clearTimeout(this.timer);
      this.isDraw = true;
      this.penObj.setAlpha(1).setX(pointer.x - 30).setY(pointer.y);
      this.drawHandle(pointer,handle); //绘制 
      this.timer = setTimeout(()=>{
        this.penObj.setAlpha(0);
      },500);
    }

    private drawHandle (pointerObj : Phaser.Input.Pointer, handle : string) : void {
      //书写中
      let pointers : any[] = pointerObj.getInterpolatedPosition(40);
      handle === 'move' && pointers.forEach((p)=>{
        this.area.draw(this.guijiObj,p.x - this.area.x - 5,p.y - this.area.y - 5,1);
      });
      handle === 'down' && this.area.draw(this.guijiObj,pointerObj.x - this.area.x - 5,pointerObj.y - this.area.y - 5,1);
    }

    private backToListHandle() : void {
      //返回游戏列表
      window.location.href = window.location.origin;
    }

    private clearDrawHandle(clickBtn : boolean = true) : void {
      //清除绘制线条
      this.area.clear();
      this.isDraw = false;
      clickBtn && (this.clearDrawBtn.alpha = 1);
      this.tweens.add({
        targets : this.clearDrawBtn,
        delay : 3000,
        alpha : .6,
        ease: 'Sine.easeInOut',
        duration : 500
      })
    }

    private pointerEndHandle() : void {
      //@ts-ignore
      this.penObj.alpha = 0;
    }

    private createBtn () : void {
      //创建按钮
      this.backToListBtn = this.add.image(55,55,'icons','btn_exit.png').setOrigin(.5).setAlpha(.6).setDisplaySize(60,60).setInteractive().setData('isBtn',true);
      this.clearDrawBtn = this.add.image(55,window.innerHeight - 145,'icons','btn_shangyibu.png').setOrigin(.5).setAlpha(.6).setDisplaySize(60,60).setInteractive().setData('isBtn',true);
      this.playBtn = this.add.image(55,window.innerHeight - 55,'icons','btn_play.png').setOrigin(.5).setAlpha(.6).setDisplaySize(60,60).setInteractive().setData('isBtn',true);
      this.musicBtn = this.add.image(window.innerWidth - 60,55,'icons','btn_music.png').setOrigin(.5).setAlpha(.6).setDisplaySize(60,60).setInteractive().setData('isBtn',true);
      this.bgmAnims = this.tweens.add({
        targets : this.musicBtn,
        duration : 2000,
        repeat : -1,
        angle : 360,
      })
    }

    private switchMusic () : void {
      //开起关闭背景音乐
      this.bgmFlag = !this.bgmFlag;
      this.bgmFlag && this.bgmAnims.resume() || this.bgmAnims.pause();
      this.bgmFlag && this.bgm.resume() || this.bgm.pause();
      this.bgmFlag && this.musicBtn.setFrame('btn_music.png') || this.musicBtn.setFrame('btn_play_2.png');
      !this.bgmFlag && (this.musicBtn.angle = 0); 
      this.musicBtn.alpha = 1;
      this.tweens.add({
        targets : this.musicBtn,
        delay : 3000,
        alpha : .6,
        ease: 'Sine.easeInOut',
        duration : 500
      })
    }

    private createMask () : void {
      //创建开始游戏遮罩
      let graphicsObj : Phaser.GameObjects.Graphics = this.add.graphics();
      graphicsObj.fillStyle(0x000000,.5);
      graphicsObj.fillRect(0,0,window.innerWidth,window.innerHeight).setDepth(1);
      let mask : Phaser.GameObjects.Image = this.add.image(window.innerWidth / 2, window.innerHeight / 2 , 'mask').setDepth(100);
      let zoneObj : Phaser.GameObjects.Zone = this.add.zone(window.innerWidth / 2 - 104.5,window.innerHeight / 2 + 138 ,209 , 53 ).setOrigin(0).setInteractive();
      let that : Game5PlayScene = this;
      zoneObj.on('pointerdown',function () {
        //点击开始游戏注销组件
        zoneObj.destroy();
        graphicsObj.destroy();
        mask.destroy();
        that.wordsAnims();//开始游戏展示word
        that.initEmitHandle(); //初始化事件
      });
    }

    private createBgi () : void {
      this.add.image(0,0,'game5Bgi').setDisplaySize(window.innerWidth,window.innerHeight).setOrigin(0);
      this.tips = this.add.sprite(window.innerWidth / 2 , window.innerHeight / 2 , 'tips').setOrigin(.5).setDepth(1002).setScale(0);
    }

    update(time: number , delta : number): void {
    }
  };
import "phaser";
import { config } from "../interface/TipsParticlesEmitter";
const W = 1024;
const H = 552;
/**
 * @param scene 当前场景
 * @param config 回调函数对象
 */
export default class TipsParticlesEmitter_New {
    private scene :Phaser.Scene;
    private config : config ; 
    private tips : Phaser.GameObjects.Sprite; //图片
    private particles : Phaser.GameObjects.Particles.ParticleEmitterManager ; // 粒子控制器
    private emitters  : Phaser.GameObjects.Particles.ParticleEmitter ;  //粒子发射器
    private graphicsObj : Phaser.GameObjects.Graphics; //mask
    private tryAgainBtn : Phaser.GameObjects.Image; //再试一次按钮
    private nextBtn : Phaser.GameObjects.Image; //换一个
    private lock : boolean = false;  //节流锁
    constructor(scene : Phaser.Scene,config : config){
        this.scene = scene;
        this.config = config;
        this.loadImg();
    }

    private init () : void {
        this.createEmitter(); //注册发射器
    }

    private boom () : void {
        this.emitters.explode(40,this.tips.x,this.tips.y);
    }

    private createEmitter () : void {
        //创建粒子效果发射器
        this.particles = this.scene.add.particles('particles').setDepth(99);
        this.emitters = this.particles.createEmitter({
          lifespan : 1000,
          speed : { min: 300, max: 400},
          alpha : {start: 0.7, end: 0 },
          scale: { start: 0.7, end: 0 },
          rotate: { start: 0, end: 360, ease: 'Power2' },
          blendMode: 'ADD',
          on : false,
        });
    }

    private createMask () : void {
      //创建开始游戏遮罩
      this.graphicsObj = this.scene.add.graphics();
      this.graphicsObj.fillStyle(0x000000,.5);
      this.graphicsObj.fillRect(0,0,1024,552).setDepth(1);
    }

    private playMusic(sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.scene.sound.add(sourceKey);
      mp3.play();
    }

    public success() : void {
        if(this.lock) return;
        this.lock = true;
        this.tips = this.scene.add.sprite(W / 2 , 208 ,'glodGoodJob')
                      .setOrigin(.5)
                      .setScale(0)
                      .setDepth(100);
        this.playMusic('success');
        this.createMask();
        this.boom();
        this.scene.tweens.timeline({
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
        this.scene.time.addEvent({
          delay : 1000,
          callback : ()=>{
            this.clearHandle();
            this.config.successCb ();
          }
        })
    }

    public tryAgain() : void {
      if(this.lock) return;
      this.playMusic('success');
      this.lock = true;
      this.tips = this.scene.add.sprite(W / 2 , 208 ,'tipsTryagain')
                    .setOrigin(.5)
                    .setScale(0)
                    .setDepth(100);
      this.tryAgainBtn = this.scene.add.image(W / 2 , 421 , 'btnAgain' )
                          .setOrigin(.5)
                          .setAlpha(0)
                          .setDepth(100)
                          .setInteractive();
      this.createMask();
      this.scene.tweens.add({
        targets : this.tryAgainBtn,
        alpha : 1,
        ease : 'Sine.easeInOut',
        duration : 300
      });
      this.scene.tweens.timeline({
        targets : this.tips,
        ease : 'Sine.easeInOut',
        duration : 100,
        tweens : [
          {
            scaleX : 1,
            scaleY : 1,
            angle : 10
          },
          {
            scaleX : .8,
            scaleY : .8,
            angle : -10
          },
          {
            scaleX : 1,
            scaleY : 1,
            angle : 0
          }
        ],
        onComplete : ()=>{
          this.tryAgainBtn.on('pointerdown',this.tryAgainHandle.bind(this))
        }
      })
      
    }

    public error () : void {
      if(this.lock) return;
      this.playMusic('success');
      this.lock = true;
      this.tips = this.scene.add.sprite(W / 2 , 208 - H ,'tipsNo')
                    .setOrigin(.5)
                    .setDepth(100);
      this.tryAgainBtn = this.scene.add.image(551 , 364 + 100 , 'btnAgainOnce')
                          .setOrigin(0)
                          .setDepth(100)
                          .setInteractive()
                          .setAlpha(0);
      this.nextBtn = this.scene.add.image(293.5 , 364 + 100 , 'btnChange')
                      .setOrigin(0)
                      .setDepth(100)
                      .setInteractive()
                      .setAlpha(0);
      this.createMask();
      this.scene.tweens.add({
        targets : this.tips,
        y : `+=${H}`,
        ease : 'Sine.easeIn',
        duration : 700
      });
      this.scene.time.addEvent({
        delay : 500,
        callback : ()=>{
          this.scene.tweens.add({
            targets : [this.tryAgainBtn , this.nextBtn],
            alpha : 1,
            y : '-=100',
            ease : 'Sine.easeInOut',
            duration : 800,
            onComplete : ()=>{
              this.tryAgainBtn.on('pointerdown',this.tryAgainHandle.bind(this));
              this.nextBtn.on('pointerdown',this.nextHandle.bind(this));
            }
          });
        }
      })
    }

    private nextHandle() : void {
      this.playMusic('clickMp3');
      this.clearHandle();
      this.config.nextCb.call(this.scene);
    }

    private clearHandle () : void {
      this.tips && this.tips.destroy();
      this.tips = null;
      this.graphicsObj && this.graphicsObj.destroy();
      this.graphicsObj = null;
      this.tryAgainBtn && this.tryAgainBtn.destroy();
      this.tryAgainBtn && this.tryAgainBtn.off('pointerdown');
      this.tryAgainBtn = null;
      this.nextBtn && this.nextBtn.destroy();
      this.nextBtn && this.nextBtn.off('pointerdown');
      this.nextBtn = null;
      this.lock = false;
    }
    
    private tryAgainHandle() : void {
      this.playMusic('clickMp3');
      this.clearHandle();
      this.config.tryAgainCb.call(this.scene);
    }
    

    private loadImg () : void {
        this.scene.load.image('glodGoodJob','assets/commonUI/glodGoodJob.png');
        this.scene.load.image('tipsTryagain','assets/commonUI/tipsTryagain.png');
        this.scene.load.image('tipsNo','assets/commonUI/tipsNo.png');
        this.scene.load.image('particles','assets/Game5/particles.png');
        this.scene.load.image('btnAgain','assets/commonUI/btnAgain.png');
        this.scene.load.image('btnAgainOnce','assets/commonUI/btnAgainOnce.png');
        this.scene.load.image('btnChange','assets/commonUI/btnChange.png');
        this.scene.load.audio('success','assets/Game5/success.mp3');
        this.scene.load.audio('clickMp3','assets/sounds/clickMp3.mp3');
        this.scene.load.on('complete',this.init.bind(this));
        this.scene.load.start();
    }
}
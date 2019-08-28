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
    public index : number = 0 ;//当前错误次数
    private graphicsObj : Phaser.GameObjects.Graphics; //mask
    private tryAgainBtn : Phaser.GameObjects.Image; //再试一次按钮
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

    private tipsAnims () : void {
        this.boom();
        
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
        this.tips && this.tips.destroy();
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
            this.tips.setScale(0);
            this.graphicsObj.destroy();
            this.graphicsObj = null;
            this.lock = false;
            this.config.successCb ();
          }
        })
    }

    /**
     * @returns boolean => true : 第二次失败
     */
    public error() : boolean {
        this.playMusic('success');
        this.index = this.index + 1 > 2 ? 1 : this.index + 1;
        this.index === 1 && this.tryAgain();
        return this.index === 2;
    }

    private tryAgain() : void {
      if(this.lock) return;
      this.lock = true;
      this.tips && this.tips.destroy();
      this.tips = this.scene.add.sprite(W / 2 , 208 ,'tipsTryagain')
                    .setOrigin(.5)
                    .setScale(0)
                    .setDepth(100);
      this.tryAgainBtn = this.scene.add.image(W / 2 , 421 , 'btnAgain' )
                          .setOrigin(.5)
                          .setAlpha(0)
                          .setDepth(100);
      this.createMask();
      this.boom();
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
          this.tips.setScale(0);
          this.graphicsObj.destroy();
          this.graphicsObj = null;
          this.lock = false;
          this.tryAgainBtn.on('pointerdown',()=>{
            console.log(1);
          })
        }
      })
      
    }
    

    private loadImg () : void {
        this.scene.load.image('glodGoodJob','assets/commonUI/glodGoodJob.png');
        this.scene.load.image('tipsTryagain','assets/commonUI/tipsTryagain.png');
        this.scene.load.image('tipsNo','assets/commonUI/tipsNo.png');
        this.scene.load.image('particles','assets/Game5/particles.png');
        this.scene.load.image('btnAgain','assets/commonUI/btnAgain.png');
        this.scene.load.audio('success','assets/Game5/success.mp3');
        this.scene.load.audio('clickMp3','assets/sounds/clickMp3.mp3');
        this.scene.load.on('complete',this.init.bind(this));
        this.scene.load.start();
    }
}
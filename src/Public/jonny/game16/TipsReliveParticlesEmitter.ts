import "phaser";
import { config } from "../../../interface/TipsParticlesEmitter";
const W = 1024;
const H = 552;
/**
 * @param scene 当前场景
 * @param config 回调函数对象
 */
export default class TipsReliveParticlesEmitter {
  private scene: Phaser.Scene;
  private config: config;
  private tips: Phaser.GameObjects.Sprite; //图片
  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager; // 粒子控制器
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter;  //粒子发射器
  private graphicsObj: Phaser.GameObjects.Graphics; //mask
  private tryAgainBtn: Phaser.GameObjects.Image; //再试一次按钮
  private nextBtn: Phaser.GameObjects.Image; //换一个
  private lock: boolean = false;  //节流锁
  constructor(scene: Phaser.Scene, config?: config) {
    this.scene = scene;
    this.config = config;
    this.init();
  }

  private init(): void {
    this.createEmitter(); //注册发射器
  }

  private boom(): void {
    this.emitters.explode(40, this.tips.x, this.tips.y);
  }

  private createEmitter(): void {
    //创建粒子效果发射器
    this.particles = this.scene.add.particles('particles').setDepth(2000);
    this.emitters = this.particles.createEmitter({
      lifespan: 1000,
      speed: { min: 300, max: 400 },
      alpha: { start: 0.7, end: 0 },
      scale: { start: 0.7, end: 0 },
      rotate: { start: 0, end: 360, ease: 'Power2' },
      blendMode: 'ADD',
      on: false,
    });
  }

  private createMask(): void {
    //创建开始游戏遮罩
    this.graphicsObj = this.scene.add.graphics();
    this.graphicsObj.fillStyle(0x000000, .8);
    this.graphicsObj.fillRect(0, 0, 1024, 552).setDepth(1999);
  }

  private playMusic(sourceKey: string): void {
    //播放音频
    let mp3: Phaser.Sound.BaseSound = this.scene.sound.add(sourceKey);
    mp3.play();
  }

  public success(cb: Function): void {
    if (this.lock) return;
    this.lock = true;
    this.config && this.config.renderBefore && this.config.renderBefore();
    this.tips = this.scene.add.sprite(W / 2, 208, 'glodGoodJob')
      .setOrigin(.5)
      .setScale(0)
      .setDepth(2000);
    this.playMusic('success');
    this.createMask();
    this.boom();
    this.scene.tweens.timeline({
      targets: this.tips,
      ease: 'Sine.easeInOut',
      duration: 100,
      tweens: [
        {
          scaleX: 1,
          scaleY: 1
        },
        {
          scaleX: .8,
          scaleY: .8
        },
        {
          scaleX: 1,
          scaleY: 1
        }
      ]
    });
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.clearHandle();
        cb && cb.call(this.scene);
      }
    })
  }

  public tryAgain(cb: Function): void {
    if (this.lock) return;
    this.playMusic('TryAgain');
    this.lock = true;
    this.config && this.config.renderBefore && this.config.renderBefore();
    this.tips = this.scene.add.sprite(W / 2, 208, 'tipsTryagain')
      .setOrigin(.5)
      .setScale(0)
      .setAngle(0)
      .setDepth(2000);
    this.tryAgainBtn = this.scene.add.image(W / 2, 421, 'btnAgain')
      .setOrigin(.5)
      .setAlpha(0)
      .setDepth(2001)
      .setInteractive();
    this.createMask();
    this.scene.tweens.add({
      targets: this.tryAgainBtn,
      alpha: 1,
      ease: 'Sine.easeInOut',
      duration: 300
    });

    // this.scene.tweens.add({
    //   targets : this.tips,
    //   ease : (x)=>{
    //     let factor = .4 ;
    //     let y = Math.pow(2, -10 * x) * Math.sin((x - factor / 4) * (2 * Math.PI) / factor) + 1
    //     return y ;
    //   },
    //   angle : 0,
    //   duration : 300,
    //   onComplete : ()=>{
    //     this.tryAgainBtn.on('pointerdown',this.tryAgainHandle.bind(this))
    //   }
    // })
    this.scene.tweens.timeline({
      targets: this.tips,
      ease: 'Sine.easeInOut',
      duration: 100,
      tweens: [
        {
          scaleX: 1,
          scaleY: 1,
          angle: 5
        },
        {
          scaleX: 1,
          scaleY: 1,
          angle: -3
        },
        {
          scaleX: 1,
          scaleY: 1,
          angle: 0
        }
      ],
      onComplete: () => {
        this.tryAgainBtn.on('pointerdown', this.tryAgainHandle.bind(this, cb.bind(this.scene)))
      }
    })

  }

  public error(nextCb: Function, tryagainCb: Function): void {
    if (this.lock) return;
    this.playMusic('ohNo');
    this.lock = true;
    this.config && this.config.renderBefore && this.config.renderBefore();
    this.tips = this.scene.add.sprite(W / 2, 208 - H, 'tipsNo')
      .setOrigin(.5)
      .setDepth(2000);
    this.tryAgainBtn = this.scene.add.image(293.5, 364+20, 'reliveBtn')
      .setOrigin(0)
      .setDepth(2001)
      .setInteractive()
      .setAlpha(0);
    this.nextBtn = this.scene.add.image(551, 364 + 20, 'btn_cxks')
      .setOrigin(0)
      .setDepth(2001)
      .setInteractive()
      .setAlpha(0);
    this.createMask();
    this.scene.tweens.add({
      targets: this.tips,
      y: `+=${H}`,
      ease: 'Sine.easeIn',
      duration: 700
    });
    this.scene.tweens.add({
      targets: [this.tryAgainBtn, this.nextBtn],
      alpha: 1,
      delay: 500,
      y: '-=20',
      ease: 'Sine.easeInOut',
      duration: 800,
      onComplete: () => {
        this.tryAgainBtn.on('pointerdown', this.tryAgainHandle.bind(this, tryagainCb.bind(this.scene)));
        this.nextBtn.on('pointerdown', this.nextHandle.bind(this, nextCb.bind(this.scene)));
      }
    });
  }

  private nextHandle(cb: Function): void {
    this.playMusic('clickMp3');
    this.clearHandle();
    cb();
  }

  private clearHandle(): void {
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

  private tryAgainHandle(cb: Function): void {
    this.playMusic('clickMp3');
    this.clearHandle();
    cb();
  }


  public static loadImg(scene: Phaser.Scene): void {
    scene.load.image('glodGoodJob', 'assets/commonUI/tipsGoodjob.png');
    scene.load.image('tipsTryagain', 'assets/commonUI/tipsTryagain.png');
    scene.load.image('tipsNo', 'assets/commonUI/tipsNo.png');
    scene.load.image('particles', 'assets/Game5/particles.png');
    scene.load.image('btnAgain', 'assets/commonUI/btnAgain.png');
    scene.load.image('btnAgainOnce', 'assets/commonUI/btnAgainOnce.png');
    scene.load.image('btnChange', 'assets/commonUI/btnChange.png');
    scene.load.image('reliveBtn', 'assets/Game16/reliveBtn.png');
    scene.load.image('btn_cxks', 'assets/Game16/btn_cxks.png');
    scene.load.audio('success', 'assets/sounds/newJoin/goodJob.mp3');
    scene.load.audio('TryAgain', 'assets/sounds/newJoin/TryAgain.mp3');
    scene.load.audio('ohNo', 'assets/sounds/newJoin/ohNo.mp3');
    scene.load.audio('clickMp3', 'assets/sounds/clickMp3.mp3');
  }
}
import "phaser";
const W = 1024;
const H = 552;
/**
 * @param scene 当前场景
 */
export default class TipsParticlesEmitter {
    private scene ;
    private tips : Phaser.GameObjects.Sprite; //图片
    private tips1 : Phaser.GameObjects.Sprite; //图片
    private tips2 : Phaser.GameObjects.Sprite; //图片
    private tips3 : Phaser.GameObjects.Sprite; //图片
    private particles : Phaser.GameObjects.Particles.ParticleEmitterManager ; // 粒子控制器
    private emitters  : Phaser.GameObjects.Particles.ParticleEmitter ;  //粒子发射器
    public index : number = 0 ;//当前错误次数
    constructor(scene){
        this.scene = scene;
        this.loadImg();
    }

    private init () : void {
        this.tips1 = this.scene.add.sprite(W / 2 , H / 2 , 'tips1').setOrigin(.5).setDepth(1002).setScale(0);
        this.tips2 = this.scene.add.sprite(W / 2 , H / 2 , 'tips2').setOrigin(.5).setDepth(1002).setScale(0);
        this.tips3 = this.scene.add.sprite(W / 2 , H / 2 , 'tips3').setOrigin(.5).setDepth(1002).setScale(0);
        this.createEmitter(); //注册发射器
    }

    private boom () : void {
        this.emitters.explode(40,this.tips.x,this.tips.y);
    }

    private createEmitter () : void {
        //创建粒子效果发射器
        this.particles = this.scene.add.particles('particles');
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

    private tipsAnims () : void {
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
          }
        })
    }

    private playMusic(sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.scene.sound.add(sourceKey);
      mp3.play();
    }

    public success() : void {
        // let tips1 : Phaser.Textures.Frame = this.scene.textures.getFrame('tips1');
        this.playMusic('successMp3');
        this.tips = this.tips2;
        this.index = 0;
        this.tipsAnims();
    }

    /**
     * @returns boolean => true : 第二次失败
     */
    public error() : boolean {
        this.playMusic('successMp3');
        this.index = this.index + 1 > 2 ? 1 : this.index + 1;
        this.index === 1 && (this.tips = this.tips1);
        this.index === 2 && (this.tips = this.tips3);
        this.tipsAnims();
        return this.index === 2;
    }

    private loadImg () : void {
        this.scene.load.image('tips1','assets/Game7/tips1.png');
        this.scene.load.image('tips2','assets/Game7/tips2.png');
        this.scene.load.image('tips3','assets/Game7/tips3.png');
        this.scene.load.image('particles','assets/Game5/particles.png');
        this.scene.load.audio('error','assets/Game5/error.mp3');
        this.scene.load.audio('successMp3','assets/Game5/success.mp3');
        this.scene.load.on('complete',this.init.bind(this));
        this.scene.load.start();
    }
}
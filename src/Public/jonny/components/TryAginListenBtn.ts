import "phaser";
import { EASE } from "../Animate";
import { Button } from "./Button";

export class TryAginListenBtn extends Button {
  public sound: Phaser.Sound.BaseSound;
  public ableTips: Array<number>;  //是否提示再听一遍
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 0, 0, "listenAgain");
    this.setOrigin(0, 1);
    this.x = x;
    this.y = y;
    this.minAlpha = 1;
    this.ableTips = [0,0];
    this.sound = this.scene.sound.add("ClickTheButtonAndListenAgain");
    this.init();
  }

  init(): void {
    this.setScale(0);
    this.setRotation((Math.PI / 180) * -30);
    this.setAlpha(1);
  }

  public animate():void{
    this.scene.tweens.timeline(<Phaser.Types.Tweens.TimelineBuilderConfig>{
      targets: this,
      tweens: [
        {
          scale: 1,
          rotation: 0,
          duration: 500,
          ease: EASE.spring
        },
        {
          rotation: Phaser.Math.DegToRad(-30),
          yoyo: true,
          repeat: 3,
          duration: 500,
          repeatDelay: 300,
          ease: EASE.spring
        }
      ],
      onStart: () => {
        this.sound.play();
      },
      onComplete: () => {
        this.init();
      }
    });
  }

  public checkout(times: number) {
    switch (times) {
      case 1:
        setTimeout(() => {
          if (this.ableTips[0] === 0) {
            this.animate();
          }
        }, 3000);
        break;
      case 2:
        setTimeout(() => {
          if (this.ableTips[1] === 0) {
            this.animate();
          }
        }, 5000);
        break;
    }
  }

  public static loadAssets(scene: Phaser.Scene) {
    scene.load.image("listenAgain", "assets/commonUI/listenAgain.png");
    scene.load.audio("ClickTheButtonAndListenAgain", "assets/sounds/newJoin/ClickTheButtonAndListenAgain.mp3");
  }
}
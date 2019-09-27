import "phaser";
import { EASE} from "../Animate";
import { Button } from "./Button";

export class TryAginListenBtn extends Button {
    public sound:Phaser.Sound.BaseSound;
    public animate:Phaser.Tweens.Timeline;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, 0, 0, "listenAgain");
        this.setOrigin(0, 1);
        this.x = x;
        this.y = y;
        this.minAlpha = 1;
        this.sound = this.scene.sound.add("ClickTheButtonAndListenAgain");
        this.animate =  this.scene.tweens.timeline(<Phaser.Types.Tweens.TimelineBuilderConfig>{
            targets: this,
            paused: true,
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
            ]
          });
        this.init();
    }

    init(): void {
        this.setScale(0);
        this.setRotation((Math.PI / 180) * -30);
        this.setAlpha(1);
        this.pointerdownFunc = ()=>{
           this.sound.play(); 
        }
    }

    public static loadAssets(scene:Phaser.Scene){
        scene.load.image("listenAgain","assets/commonUI/listenAgain.png");
        scene.load.audio("ClickTheButtonAndListenAgain","assets/sounds/newJoin/ClickTheButtonAndListenAgain.mp3");
    }
}
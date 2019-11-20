import "phaser";
import { EASE } from "../core/Animate";

export class TextDialog extends Phaser.GameObjects.Container {
    question: Phaser.GameObjects.Text;
    bg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, questionContent: string) {
        super(scene, x, y);
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "bg_talk_pop").setOrigin(79 / 367, 256 / 256);
        this.question = new Phaser.GameObjects.Text(scene, 103, -129, questionContent, {
            align: "center",
            fontFamily: "Helvetica",
            color: "#C44CDE",
            fontSize: "28px",
            wordWrap: { width: 300 },
            resolution: 2
        });
        this.question.setOrigin(0.5);
        this.add([this.bg, this.question]);
    }

    public init() {
        this.bg.scale = 0;
        this.question.alpha = 0;
    }

    public admission(): Promise<boolean> {
        return new Promise(resolve => {
            this.scene.tweens.timeline(<Phaser.Types.Tweens.TimelineBuilderConfig>{
                tweens: [
                    {
                        targets: this.bg,
                        duration: 500,
                        ease: EASE.spring,
                        scale: 1
                    },
                    {
                        targets: this.question,
                        duration: 500,
                        alpha: 1
                    }
                ],
                onComplete: () => {
                    resolve(true);
                }
            })
        })
    }
}
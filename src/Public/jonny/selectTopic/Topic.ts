import "phaser";

/**
  * @member bg 
  * @member question 
  */
export class Topic extends Phaser.GameObjects.Container {

    bg: Phaser.GameObjects.Image;
    question: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, questionContent: string) {
        super(scene, 72 + 880 * 0.5, 68 + 160 * 0.5);
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "tigan");
        this.question = new Phaser.GameObjects.Text(scene, 0, 10, questionContent, <Phaser.Types.GameObjects.Text.TextStyle>{
            align: "center",
            fontFamily: "Helvetica",
            color: "#FF6E09",
            fontSize: "30px",
            wordWrap: <Phaser.Types.GameObjects.Text.TextWordWrap>{ width: 656 },
            resolution:2
        }).setOrigin(0.5);
        this.add([this.bg, this.question]);
    }
}
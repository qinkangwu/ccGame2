import "phaser";
import { QueryTopic } from '../../../interface/Game13';

export class OrderUI extends Phaser.GameObjects.Container {
    public bg: Phaser.GameObjects.Image;
    public topic: Phaser.GameObjects.BitmapText;
    public answers: Phaser.GameObjects.Container[] = [];
    private queryTopic: QueryTopic;
    constructor(scene: Phaser.Scene, queryTopic: QueryTopic) {
        super(scene, 510, 777);  //normal position is 510,290
        this.queryTopic = queryTopic;
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "orderUI");
        this.topic = new Phaser.GameObjects.BitmapText(scene, -335, -90, "ArialRoundedBold", queryTopic.questioncontent, 45, 0).setOrigin(0);
        this.topic.setTint(0xFF6E09);
        this.createAnswer();
        this.add([this.bg, this.topic]);
        this.add(this.answers);
    }

    private createAnswer() {
        this.queryTopic.answers.forEach((answer, index) => {
            let _answer = new Phaser.GameObjects.Container(this.scene, -270 + index * 270, 132);
            _answer.setData("isRight", answer.isright);
            let _bg = new Phaser.GameObjects.Graphics(this.scene);
            _bg.fillStyle(0xFF6E09, 1);
            _bg.fillRoundedRect(0 - 166 * 0.5, 0 - 74.5 * 0.5, 166, 74.5, 10);
            _bg.visible = false;
            let _textSize = answer.answercontent.length <= 11 ? 30 : 25; 
            let _text = new Phaser.GameObjects.BitmapText(this.scene, 0, 7, "ArialRoundedBold", answer.answercontent,_textSize, 1).setOrigin(0.5);
            _text.setTint(0xFF6E09);
            _answer.add([_bg, _text]);
            _answer.setInteractive(new Phaser.Geom.Circle(0, 0, 74.5 * 0.7), Phaser.Geom.Circle.Contains);
            this.answers.push(_answer);
        })
    }

    /**
    * 入场
    */
    public admission(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                y: 290,
                delay: 1000,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

    /**
    * 退场
    */
    public leave(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                y: 777,
                duration: 500,
                ease:"Sine.easeOut",
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }
}
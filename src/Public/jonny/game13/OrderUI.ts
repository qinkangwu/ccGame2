/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";
import { QueryTopic } from '../../../interface/Game13';

export class OrderUI extends Phaser.GameObjects.Container {
    public bg: Phaser.GameObjects.Image;
    public topic: Phaser.GameObjects.Text;
    public answers: Phaser.GameObjects.Container[] = [];
    public topicIndexText:Phaser.GameObjects.BitmapText;
    private queryTopic: QueryTopic;
    constructor(scene: Phaser.Scene, queryTopic: QueryTopic,topicIndex:string="1/19") {
        super(scene, 510, 777);  //normal position is 510,290
        this.queryTopic = queryTopic;
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, "orderUI");
        //this.topic = new Phaser.GameObjects.BitmapText(scene, -335, -90, "ArialRoundedBold", queryTopic.question, 45, 0).setOrigin(0);
        let topicStyle:Phaser.Types.GameObjects.Text.TextStyle = {
            color:"#ffffff", fontSize:"35px"
        }
        this.topic = new Phaser.GameObjects.Text(scene, -335, -90, queryTopic.question,topicStyle).setOrigin(0);
        this.topic.setTint(0xFF6E09);
        this.topicIndexText = new Phaser.GameObjects.BitmapText(this.scene,-324,-168.95,"ArialRoundedBold",topicIndex,30,1).setOrigin(0.5);
        this.topicIndexText.tint = 0xFF6E09;
        this.createAnswer();
        this.add([this.bg, this.topic,this.topicIndexText]);
        this.add(this.answers);
    }

    private createAnswer() {
         let answerIndex:string[] = ["A","B","C"];
         let rightAnswer = this.queryTopic.right;
        this.queryTopic.answers.forEach((answer, index) => {
            let _answer = new Phaser.GameObjects.Container(this.scene, -270 + index * 270, 132);
            console.log(answer===rightAnswer);
            if(answer===rightAnswer){
                _answer.setData("isRight","1");
            }else{
                _answer.setData("isRight","0");
            }
            console.log(_answer.getData("isRight"));
            let _bg = new Phaser.GameObjects.Graphics(this.scene);
            _bg.fillStyle(0xFF6E09, 1);
            _bg.fillRoundedRect(0 - 166 * 0.5, 0 - 74.5 * 0.5, 166, 74.5, 10);
            _bg.visible = false;
            let _textSize = answer.length <= 11 ? "30px" : "20px"; 
            //let _text = new Phaser.GameObjects.BitmapText(this.scene, 0, 7, "ArialRoundedBold", answerIndex[index] + "." + answer,_textSize, 1).setOrigin(0.5);
            let _textStyle:Phaser.Types.GameObjects.Text.TextStyle = {
                align:"center",
                color:"#ffffff",
                fontSize:_textSize
            };
            let _text = new Phaser.GameObjects.Text(this.scene,0,7,`${answerIndex[index]}.${answer}`,_textStyle);
            _text.setOrigin(0.5).setTint(0xFF6E09);
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
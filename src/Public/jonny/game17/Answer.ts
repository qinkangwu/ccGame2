import "phaser";
import { AnswerConfig } from "./../../../interface/Game17";

export class Answer extends Phaser.GameObjects.Container{
    bg:Phaser.GameObjects.Image;
    serial:Phaser.GameObjects.BitmapText;
    answercontent:Phaser.GameObjects.BitmapText;
    shape:Phaser.Geom.Circle;
    name:string;
    isright:string;
    interactive:boolean = true;
    constructor(scene:Phaser.Scene,config:AnswerConfig){
        super(scene,config.position.x,config.position.y);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,config.bgTexture);
        this.answercontent = new Phaser.GameObjects.BitmapText(scene,0,30,"ArialRoundedBold",config.answercontent,40).setOrigin(0.5);
        this.serial =  new Phaser.GameObjects.BitmapText(scene,config.serial.position.x,config.serial.position.y,"ArialRoundedBold",config.serial.value,30,1).setOrigin(0.5);
        this.shape = new Phaser.Geom.Circle(0,0,this.bg.width*0.4);
        this.name = config.answercontent;
        this.isright = config.isright;
        this.add([this.bg,this.serial,this.answercontent]);
        this.setInteractive(this.shape,Phaser.Geom.Circle.Contains);
        //this.drawHitArea();
    }

    public drawHitArea():void{
        let graphics = new Phaser.GameObjects.Graphics(this.scene).lineStyle(2,0xff0000,1).strokeCircleShape(this.shape);
        this.add(graphics);
    }
}
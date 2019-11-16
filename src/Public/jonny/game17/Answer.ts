import "phaser";
import { AnswerConfig } from "./../../../interface/Game17";

export class Answer extends Phaser.GameObjects.Container{
    bg:Phaser.GameObjects.Image;
    serial:Phaser.GameObjects.BitmapText;
    answerContent:Phaser.GameObjects.Text;
    shape:Phaser.Geom.Circle;
    name:string;
    isRight:number;
    interactive:boolean = true;
    constructor(scene:Phaser.Scene,config:AnswerConfig){
        super(scene,config.position.x,config.position.y);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,config.bgTexture);
        //this.answerContent = new Phaser.GameObjects.BitmapText(scene,0,30,"ArialRoundedBold",config.answerContent,30,1).setOrigin(0.5);
        this.answerContent = new Phaser.GameObjects.Text(scene,0,30,config.answerContent,({
            align:"center",
            fontFamily:"Arial Rounded MT Bold",
            color:"#ffffff",
            fontSize:"30px"
        } as Phaser.Types.GameObjects.Text.TextSyle)).setOrigin(0.5);
        this.serial =  new Phaser.GameObjects.BitmapText(scene,config.serial.position.x,config.serial.position.y,"ArialRoundedBold",config.serial.value,30,1).setOrigin(0.5);
        this.shape = new Phaser.Geom.Circle(0,0,this.bg.width*0.4);
        this.name = config.answerContent;
        this.isRight = config.isRight;
        this.add([this.bg,this.serial,this.answerContent]);
        this.setInteractive(this.shape,Phaser.Geom.Circle.Contains);
        //this.drawHitArea();
    }

    public drawHitArea():void{
        let graphics = new Phaser.GameObjects.Graphics(this.scene).lineStyle(2,0xff0000,1).strokeCircleShape(this.shape);
        this.add(graphics);
    }
}
import 'phaser';
import { Bounds, Vec2 } from "../core";

let colorIndex = 0;

export class Carriage extends Phaser.GameObjects.Container{
    public bgNull:Phaser.GameObjects.Image;
    public bg:Phaser.GameObjects.Image;
    public text:Phaser.GameObjects.BitmapText;
    public shape: Phaser.Geom.Rectangle;
    public initPosition:Vec2;
    public isHit:boolean = false;
    public swicthAnimateTween:Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene,textContent:string,x:number,y:number){
        super(scene,x,y);
        colorIndex+=1;
        colorIndex = colorIndex > 5 ? 1 : colorIndex;
        let texture = textContent.length > 8 ? "largeCarriage" : `smallCarriage${colorIndex}`;
        let textureNull = textContent.length > 8 ? "largeCarriageNull" : "smallCarriageNull";
        this.bgNull = new Phaser.GameObjects.Image(scene,0,0,textureNull);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,texture);
        this.text = new Phaser.GameObjects.BitmapText(scene,0,0,"ArialRoundedBold30",textContent,20,1).setOrigin(0.5);
        this.add([this.bgNull,this.bg,this.text]);
        this.shape = new Phaser.Geom.Rectangle(-this.bg.width*0.5,-this.bg.height*0.5,this.bg.width,this.bg.height);
        // this.swicthAnimateTween = this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
        //     targets:this.bg,
        //     alpha:0,
        //     duration:500,
        //     yoyo:true,
        //     repeat:-1,
        //     paused:true
        // });    
        this.initPosition = new Vec2(this.x,this.y);
        this.init();
    }

    private init(){
        this.setInteractive(this.shape, <Phaser.Types.Input.HitAreaCallback>Phaser.Geom.Rectangle.Contains);
        this.scene.input.setDraggable(this, true);
        //this.drawHitArea();
    }

    private drawHitArea() {
        let graphics = new Phaser.GameObjects.Graphics(this.scene);
        graphics.lineStyle(1, 0x0000ff);
        graphics.strokeRect(this.shape.x, this.shape.y, this.shape.width,this.shape.height);
        this.add(graphics);
    }

    public bounceAnimate():void{
        this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:this,
            scale:1.2,
            duration:200,
            yoyo:true,
            ease:"Sine.easeInOut"
        });    
    }

    public scaleMin(): void {
        this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets: this,
            scale: 0,
            duration: 200,
            ease: "Sine.easeInOut"
        });
    }


    public syncBounds(): Bounds {
        return new Bounds(this.getBounds());
    }
}
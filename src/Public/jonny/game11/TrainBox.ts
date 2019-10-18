import { Bounds, Vec2 } from "../core";
import "phaser";
/**
  * 注册点为火车车厢的车底(0.5);
  */
export class TrainBox extends Phaser.GameObjects.Container {
    public body: Phaser.Physics.Arcade.Body;
    public bg: Phaser.GameObjects.Image;
    public text: Phaser.GameObjects.BitmapText;
    public shape: Phaser.Geom.Circle;
    public interactive: Boolean;
    public initPosition: Vec2;
    public worldTransformMatrix:Phaser.GameObjects.Components.TransformMatrix;  //世界矩阵
    public startPosition: Vec2;
    public movePosition: Vec2;
    public isHit: boolean = false;  //是否被碰撞
    public isDroging:number= 0;  //是否在拖拽的状态
    public insertObj:Phaser.GameObjects.Container = null; // 插入对象
    public tipsArrowUp:Phaser.GameObjects.Image; //指示
    public tipsArrowAnimate:Phaser.Tweens.Tween; //指示动画
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string, matterShape: object) {
        super(scene, x, y);
        this.initPosition = new Vec2(x, y);
        this.startPosition = new Vec2(x, y);
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, texture);
        this.text = new Phaser.GameObjects.BitmapText(scene, 0, 0 - 28, "ArialRoundedBold30", text, 30).setOrigin(0.5);
        this.text.tint = 0xFF7F3A;
        this.shape = new Phaser.Geom.Circle(0, 0-20, 193 * 0.25);
        this.tipsArrowUp = new Phaser.GameObjects.Image(scene,0,-117,"tipsArrowUp");
        this.tipsArrowAnimate = this.scene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets:this.tipsArrowUp,
            duration:500,
            paused:true,
            repeat:-1,
            y:`-=10`,
            yoyo:true
        });
        this.add([this.tipsArrowUp,this.bg, this.text]);
        this.init();
        this.setBody();
        this.drawHitArea();
    }

    private init() {
        this.x += 1000;
        this.setInteractive(this.shape, <Phaser.Types.Input.HitAreaCallback>Phaser.Geom.Circle.Contains);
        this.scene.input.setDraggable(this, true);
        this.interactive = true;
    }

    private drawHitArea() {
        let graphics = new Phaser.GameObjects.Graphics(this.scene);
        graphics.lineStyle(1, 0xff0000);
        graphics.strokeCircle(this.shape.x, this.shape.y, this.shape.radius);
        this.add(graphics);
    }

    public admission(delay: number = 0): Promise<any> {
        return Promise.resolve({
            then: resolve => {
                this.scene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
                    targets: this,
                    duration: 1000,
                    delay: delay,
                    ease: "Sine.easeInOut",
                    x: this.initPosition.x,
                    onComplete: () => {
                        resolve("ok");
                    }
                })
            }
        })
    }

    public backStart(): Promise<any> {
        return Promise.resolve({
            then: resolve => {
                this.scene.physics.world.disable(this);
                this.scene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
                    targets: this,
                    duration: 500,
                    ease: "Sine.easeInOut",
                    x: this.startPosition.x,
                    y: this.startPosition.y,
                    onComplete: () => {
                        resolve("ok");
                    }
                })
            }
        })
    }

    public setBody() {
        let offset = 80;
        this.scene.physics.world.enable(this);
        this.body.setSize(218-offset,193-offset);
        this.body.setOffset(-1*(218-offset)*0.5,-1*(193-offset)*0.5);
        this.body.allowDrag = true;
    }


    public static loadImg(scene: Phaser.Scene) {
        scene.load.image("symbolTrainBox", "assets/Game11/symbolTrainBox.png");
        scene.load.image("trainBox", "assets/Game11/trainBox.png");
    }

    public syncBounds(): Bounds {
        return new Bounds(this.getBounds());
    }

    public syncBodyBounds():Bounds{
        return new Bounds(
            new Phaser.Geom.Rectangle(
                this.body.x,
                this.body.y,
                this.body.width,
                this.body.height
                // this.body.x+100,
                // this.body.y+100,
                // this.body.width-100,
                // this.body.height-100
            )
        )
    }

}
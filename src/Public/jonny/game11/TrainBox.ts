import { Bounds, Vec2 } from "../core";
import "phaser";
/**
  * 注册点为火车车厢的车底(0.5,1);
  */
export class TrainBox extends Phaser.GameObjects.Container {
    public body: Phaser.Physics.Arcade.Body;
    public bg: Phaser.GameObjects.Image;
    public text: Phaser.GameObjects.BitmapText;
    public shape: Phaser.Geom.Circle;
    public interactive: Boolean;
    //public parentContainerIndex:number;   //所在容器的序列号
    //public upIndex:number = null;   //在上面的序号
    //public initPositionDown: Vec2;
    public initPosition: Vec2;
    public worldTransformMatrix:Phaser.GameObjects.Components.TransformMatrix;  //世界矩阵
    public startPosition: Vec2;
    public movePosition: Vec2;
    // public matterShape: Object;
    public isTrack: boolean;  //是否被轨迹球跟踪过，探知答案！
    public isDrogUp: number;  //是否被拖到轨道上去了,是为1，否为0
    public isHit: boolean = false;  //是否被碰撞
    public isDroging:boolean = false;  //是否在拖拽的状态
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string, matterShape: object) {
        super(scene, x, y);
        this.initPosition = new Vec2(x, y);
        this.startPosition = new Vec2(x, y);
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, texture);
        this.text = new Phaser.GameObjects.BitmapText(scene, 0, 0 - 28, "ArialRoundedBold30", text, 30).setOrigin(0.5);
        this.text.tint = 0xFF7F3A;
        this.isTrack = false;
        this.isDrogUp = 0;
        this.shape = new Phaser.Geom.Circle(0, 0, 193 * 0.5);
        this.add([this.bg, this.text]);
        this.init();
        //this.drawHitArea();
        this.setBody();
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
                        this.isDrogUp = 0;
                        this.isTrack = false;
                        resolve("ok");
                    }
                })
            }
        })
    }

    public setBody() {
        this.scene.physics.world.enable(this);
        this.body.setSize(100,100);
        this.body.setOffset(-50,-50);
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
      //console.log(this.body.x,this.body.y,this.body.width,this.body.height);
        return new Bounds(
            new Phaser.Geom.Rectangle(
                this.body.x,
                this.body.y,
                this.body.width,
                this.body.height
            )
        )
    }
}
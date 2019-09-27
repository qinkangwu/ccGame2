import { Bounds } from "../core";
import "phaser";
/**
  * 注册点为火车车厢的车底(0.5,1);
  */
export class TrainBox extends Phaser.GameObjects.Container {
    public bg: Phaser.GameObjects.Image;
    public text: Phaser.GameObjects.BitmapText;
    public shape: Phaser.Geom.Circle;
    public interactive: Boolean;
    public initPosition: Phaser.Math.Vector2;
    public startPosition: Phaser.Math.Vector2;
    public movePosition: Phaser.Math.Vector2;
    public matterShape: Object;
    public isTrack: Boolean;  //是否被轨迹球跟踪过，探知答案！
    public isDrogUp: number;  //是否被拖到轨道上去了,是为1，否为0
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string, matterShape: object) {
        super(scene, x, y);
        this.initPosition = new Phaser.Math.Vector2(x, y);
        this.bg = new Phaser.GameObjects.Image(scene, 0, 0, texture);
        this.text = new Phaser.GameObjects.BitmapText(scene, 0, 0 - 28, "ArialRoundedBold30", text, 30).setOrigin(0.5);
        this.text.tint = 0xFF7F3A;
        this.isTrack = false;
        this.isDrogUp = 0;
        this.shape = new Phaser.Geom.Circle(0, 0, 193 * 0.5);
        this.matterShape = matterShape;
        this.add([this.bg, this.text]);
        this.init();
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

    public static loadImg(scene: Phaser.Scene) {
        scene.load.image("symbolTrainBox", "assets/Game11/symbolTrainBox.png");
        scene.load.image("trainBox", "assets/Game11/trainBox.png");
    }

    public syncBounds(): Bounds {
        return new Bounds(this.getBounds());
    }
}
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
    public blockedDown:Boolean;
    public platform:Phaser.Physics.Arcade.Sprite;
    public startPosition:Phaser.Math.Vector2;
    public movePosition:Phaser.Math.Vector2;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, text: string) {
        super(scene, x, y);
        this.bg = new Phaser.GameObjects.Image(scene, -109, -192, texture).setOrigin(0, 0);
        this.text = new Phaser.GameObjects.BitmapText(scene, 0, -130.95, "ArialRoundedBold30", text, 30).setOrigin(0.5);
        this.text.tint = 0xFF7F3A;
        this.shape = new Phaser.Geom.Circle(0, -193 * 0.5, 193 * 0.5);
        this.blockedDown = false;
        this.add([this.bg, this.text]);
        this.init();
        //this.drawHitArea();
        this.setBody();
    }

    private init() {
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

    private setBody() {
        this.scene.physics.world.enable(this);
        this.body.collideWorldBounds = true;
        // this.body.setSize(218,193);
        // this.body.setOffset(-218*0.5,-193);
        this.body.setCircle(193 * 0.5, -193 * 0.5, -193);
        this.body.allowGravity = false;
        this.body.allowRotation = true;
        this.body.allowDrag = true;
        this.body.immovable = false;
        this.body.onOverlap = true;
        this.body.mass = 500;
        this.body.gravity = new Phaser.Math.Vector2(0, 10);
        this.body.checkWorldBounds();
    }

    public static loadImg(scene: Phaser.Scene) {
        scene.load.image("symbolTrainBox", "assets/Game11/symbolTrainBox.png");
        scene.load.image("trainBox", "assets/Game11/trainBox.png");
    }
}
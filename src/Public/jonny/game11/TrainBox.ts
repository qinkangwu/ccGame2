import "phaser";
/**
  * 注册点为火车车厢的车底(0.5,1);
  */
export class TrainBox extends Phaser.GameObjects.Container {
    public body: Phaser.Physics.Arcade.Body;
    public bg:Phaser.GameObjects.Image;
    public text:Phaser.GameObjects.BitmapText;
    public shape:Phaser.Geom.Circle;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string,text:string) {
        super(scene, x, y);
        this.bg = new Phaser.GameObjects.Image(scene,-109,-192,texture).setOrigin(0,0);
        this.text = new Phaser.GameObjects.BitmapText(scene,0,-130.95,"ArialRoundedBold30",text,30).setOrigin(0.5);
        this.text.tint = 0xFF7F3A;
        this.shape = new Phaser.Geom.Circle(0, -110, 110);
        this.add([this.bg,this.text]);
        this.init();
        this.drawHitArea();
        this.setBody();
    }

    private init() {
        this.setInteractive(this.shape,<Phaser.Types.Input.HitAreaCallback>Phaser.Geom.Circle.Contains);
    }

    private drawHitArea(){
        let graphics = new Phaser.GameObjects.Graphics(this.scene); 
        graphics.lineStyle(1,0xff0000);
        graphics.strokeCircle(this.shape.x,this.shape.y,this.shape.radius);
        this.add(graphics);
    }

    private setBody() {
        this.scene.physics.world.enable(this);
        this.body.setCircle(110, -110,-110*2);
        this.body.allowGravity = true;
        this.body.gravity = new Phaser.Math.Vector2(0,200);
    }

    public static loadImg(scene: Phaser.Scene) {
        scene.load.image("symbolTrainBox", "assets/Game11/symbolTrainBox.png");
        scene.load.image("trainBox", "assets/Game11/trainBox.png");
    }
}
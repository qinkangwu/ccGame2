import "phaser";

export class TrainBox extends Phaser.GameObjects.Image{
    public body:Phaser.Physics.Arcade.Body;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string){
        super(scene,x,y,texture);
        this.setBody();
    }

     private setBody(){
        this.scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);
        this.body.setCircle(104.5,104.5,104.5);
    }

    public static loadImg(scene:Phaser.Scene){
        scene.load.image("symbolTrainBox","assets/Game11/symbolTrainBox.png");
        scene.load.image("trainBox","assets/Game11/trainBox.png");
    }
}
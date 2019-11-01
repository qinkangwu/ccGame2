import 'phaser';

export class Ship extends Phaser.GameObjects.Container{
    public bg:Phaser.GameObjects.Image;
    public text:Phaser.GameObjects.BitmapText;
    constructor(scene: Phaser.Scene, x: number, y: number,textContent){
        super(scene,x,y);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,"ship");
        this.text = new Phaser.GameObjects.BitmapText(scene,0,0,"yuantiChinese",textContent,20,1).setOrigin(0.5);
        this.add([this.bg,this.text]);
    }
}
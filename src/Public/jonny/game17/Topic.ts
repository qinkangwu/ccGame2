import "phaser";

export class Topic extends Phaser.GameObjects.Container{
    bg:Phaser.GameObjects.Image;
    text:Phaser.GameObjects.BitmapText;
    civa:Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene,textContent:string,civaTexture){
        super(scene,72+880*0.5,68+160*0.5);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,"tigan01");
        this.text =  new Phaser.GameObjects.BitmapText(scene, 0, 10, "ArialRoundedBold",textContent, 80-textContent.length, 1).setOrigin(0.5);
        this.text.tint = 0xFF6E09;
        this.civa = new Phaser.GameObjects.Image(scene,360,-60,civaTexture);
        this.add([this.bg,this.text,this.civa]);
    }
}
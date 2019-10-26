import "phaser";

export class ClearCar extends Phaser.GameObjects.Image{
    constructor(scene: Phaser.Scene){
        super(scene,560,347,"clearCar");
        this.init();
    }

    private init(){
        this.setDepth(1).setVisible(false);
    }

   
}
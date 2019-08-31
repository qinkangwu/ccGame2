import 'phaser';

export class Gold extends Phaser.GameObjects.Container{
    private goldImg:Phaser.GameObjects.Image;    
    public goldText:Phaser.GameObjects.Text;

    constructor(scene:Phaser.Scene){
        super(scene);
        
    }

    public static loadImg():void{
        console.log(this.prototype.scene);
    }
}
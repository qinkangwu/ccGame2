export class Stage extends Phaser.GameObjects.Container{
    public startX:Number;
    public moveX:Number;
    public offsetX:Number;
    public drag:Boolean;
    constructor(scene: Phaser.Scene){
        super(scene)
    }
}
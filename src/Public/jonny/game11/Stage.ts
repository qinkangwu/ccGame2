/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

export class Stage extends Phaser.GameObjects.Container{
    public startX:Number;
    public moveX:Number;
    public offsetX:Number;
    public drag:Boolean;
    constructor(scene: Phaser.Scene){
        super(scene)
    }
}
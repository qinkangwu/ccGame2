import 'phaser';

export class StaticAni{
    public alphaScaleFuc(obj, _scaleX: number, _scaleY: number, _alpha: number):void {
        obj.scaleX = _scaleX;
        obj.scaleY = _scaleY;
        obj.alpha = _alpha;
    }
}

export class TweenAni{
    public alphaScaleYoyoFunc(scene:Phaser.Scene,obj:Phaser.GameObjects.Image,scaleX:number,scaleY:number,alpha:number){
        scene.tweens.add({
            targets : obj,
            scaleX : scaleX,
            scaleY : scaleY,
            alpha:alpha,
            duration : 200,
            ease : 'Sine.easeInOut',
            yoyo:true
         })
    }
}

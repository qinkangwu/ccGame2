import "phaser";

export class DirtyCar extends Phaser.GameObjects.Image{
    constructor(scene: Phaser.Scene){
        super(scene,1403,347,"dirtyCar");
        this.init();
    }

    private init(){
        this.setDepth(1).setVisible(true);
    }
    
     /**
     * 入场
     */
    public admission(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                x: 560,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }
}
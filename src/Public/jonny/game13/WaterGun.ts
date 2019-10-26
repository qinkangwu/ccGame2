import "phaser";

export class WaterGun extends Phaser.GameObjects.Image{
    constructor(scene: Phaser.Scene){
        super(scene,213.5+65.5*0.5,-255*0.5,"waterGun");
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
                y: 255*0.5,
                delay:500,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }
}
import "phaser";

export class CarMask extends Phaser.Display.Masks.GeometryMask {
    debug:boolean;
    scene:Phaser.Scene;
    rag:Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene,debug:boolean=false) {
        super(scene, new Phaser.GameObjects.Graphics(scene));
        this.rag = new Phaser.GameObjects.Image(scene,175,665,"rag").setDepth(1);
        scene.add.existing(this.rag);
        this.scene = scene;
        this.debug = debug;
        this.init();
    }

    private init() {
        this.geometryMask
            .fillStyle(0xffffff)
            .fillCircle(0, 0, 1038 * 0.5)
            .setDepth(1)
            .setPosition(675, 325);
        if(this.debug){
            this.scene.add.existing(this.geometryMask);
        }
    }

     /**
     * 入场
     */
    public admission(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.rag,
                y: 475-140,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

    public carWash(): Promise<number> {
        let count:number = 0;
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.geometryMask,
                x: 1464,
                duration: 4000,
                onUpdate:()=>{
                    count+=0.3;
                    this.rag.y+=Math.sin(count)*40;
                    this.rag.x = this.geometryMask.x - 500;
                },
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

    public washOver(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.rag,
                y: '+=300',
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }




}
import "phaser";

export class Path extends Phaser.Display.Masks.GeometryMask {
    debug:boolean;
    scene:Phaser.Scene;
    pathImg:Phaser.GameObjects.Image;
    name:string;
    constructor(scene: Phaser.Scene,x:number,y:number,texture:string,name:string,debug:boolean=false) {
        super(scene, new Phaser.GameObjects.Graphics(scene));
        this.pathImg = new Phaser.GameObjects.Image(scene,x,y,texture).setDepth(2);
        scene.add.existing(this.pathImg);
        this.scene = scene;
        this.debug = debug;
        this.name = name;
        this.init();
    }

    private init() {
        this.geometryMask
            .fillStyle(0xff00)
            .fillRect(0, 0,547.95,117.95)
            .setAlpha(0.5)
            .setDepth(1)
            .setPosition(this.pathImg.x-this.pathImg.width*1.8, this.pathImg.y-this.pathImg.height*0.5);
        if(this.debug){
            this.scene.add.existing(this.geometryMask);
        }
        this.pathImg.mask = this;
    }

    /**
     * 显示路线
     */
    public showDirection(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.geometryMask,
                x: this.pathImg.x-this.pathImg.width*0.5,
                duration: 1000,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

     /**
     * 隐藏路线
     */
    public hideDirection(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this.geometryMask,
                x: this.pathImg.x+this.pathImg.width*0.5,
                duration: 1000,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

    /**
     * 显示路线
     */
    public reStart(){
        this.pathImg.alpha = 1;
        this.geometryMask.x = this.pathImg.x-this.pathImg.width*1.8;
        // return new Promise<number>(resolve => {
        //     this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
        //         targets: this.geometryMask,
        //         x: this.pathImg.x-this.pathImg.width*1.8,
        //         duration: 1000,
        //         onComplete: () => {
        //             resolve(1);
        //         }
        //     });
        // })
    }
}
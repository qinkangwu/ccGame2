import "phaser";

export class Car extends Phaser.GameObjects.Container {
    public positionX:{
        start:number;
        init:number;
        leave:number;
    }
    public clearCar: Phaser.GameObjects.Image;   //干净的车
    public dirtyCar: Phaser.GameObjects.Image;   //脏的车
    public bitmapShape:Phaser.GameObjects.Graphics; //遮罩的形状
    public bitmapMask: Phaser.Display.Masks.GeometryMask;  //遮罩
    public rag:Phaser.GameObjects.Image; //拖把
    constructor(scene: Phaser.Scene) {
        super(scene);   //初始化是一款很脏的汽车
        this.positionX = {
            start:1403,
            init:560,
            leave:-380
        }
        this.x = this.positionX.start;
        this.y = 347;
        this.clearCar = new Phaser.GameObjects.Image(this.scene, 0, 0, "clearCar");
        this.dirtyCar = new Phaser.GameObjects.Image(this.scene, 0, 0, "dirtyCar");
        this.rag = new Phaser.GameObjects.Image(this.scene,-407,204,"rag");
        this.bitmapShape = this.createShape();
        this.add([this.dirtyCar,this.clearCar]);
        this.bitmapMask = this.bitmapShape.createGeometryMask();
        this.setMask(this.bitmapMask);
    }

    /**
     * 遮罩形状
     */
    private createShape(): Phaser.GameObjects.Graphics {
        //var bitmapshape = this.scene.make.graphics(null,true);
        var bitmapshape = new Phaser.GameObjects.Graphics(this.scene);
        bitmapshape.fillStyle(0xffffff);
        bitmapshape.fillCircle(0, 0,345*0.5);
        bitmapshape.setPosition(-548.5+400,0);
        return bitmapshape;
    }

    /**
     *  洗车
     */
    // public carWash(): Promise<number> {
    //     return new Promise<number>(resolve => {
    //         this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
    //             targets:this.bitmapShape,
    //             x:547,
    //             duration:500,
    //             onComplete:()=>{
    //                 resolve(1);
    //             }
    //         });
    //     })
    // }

    /**
     * 入场
     */
    public admission(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                x: this.positionX.init,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }

    /**
     * 进场
     */
    public leave(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: this,
                x: this.positionX.leave,
                duration: 500,
                onComplete: () => {
                    resolve(1);
                }
            });
        })
    }
}
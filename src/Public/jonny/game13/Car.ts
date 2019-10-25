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
    constructor(scene: Phaser.Scene) {
        super(scene);   //初始化是一款很脏的汽车
        this.positionX = {
            start:1045,
            init:560,
            leave:-380
        }
        this.x = this.positionX.start;
        this.y = 347;
        this.clearCar = new Phaser.GameObjects.Image(this.scene, 0, 0, "clearCar");
        this.dirtyCar = new Phaser.GameObjects.Image(this.scene, 0, 0, "dirtyCar");
        this.add([this.clearCar,this.dirtyCar]);
        this.bitmapShape = this.createShape();
        this.bitmapMask = this.bitmapShape.createGeometryMask();
        this.dirtyCar.setMask(this.bitmapMask);
    }

    /**
     * 遮罩形状
     */
    private createShape(): Phaser.GameObjects.Graphics {
        var bitmapshape = this.scene.make.graphics(null);
        bitmapshape.fillStyle(0xffffff);
        bitmapshape.fillCircle(0, 0,785*0.5);
        bitmapshape.setPosition(this.positionX.leave,this.y);
        return bitmapshape;
    }

    /**
     *  洗车
     */
    public carWash(): Promise<number> {
        return new Promise<number>(resolve => {
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets:this.bitmapShape,
                x:this.positionX.init,
                duration:500,
                onComplete:()=>{
                    resolve(1);
                }
            });
        })
    }

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
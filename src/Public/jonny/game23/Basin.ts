import "phaser";

export class Basin extends Phaser.GameObjects.Container {
    bg:Phaser.GameObjects.Image;
    text:Phaser.GameObjects.Text;
    name:string;
    constructor(scene: Phaser.Scene,name:string){
        super(scene,496,505);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,"bg_basin");
        this.text = new Phaser.GameObjects.Text(scene,0,0+7,name,{align:"center",color:"#2c98e6",resolution:2,fontFamily:"sans-serif",fontSize:"18px"}).setOrigin(0.5);
        this.name = name;
        this.add([this.bg,this.text]);
    }

    public init():Basin{
        this.alpha = 0;
        return this;
    }

    /**
     * 淡入
     */
    public show():Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                alpha:1,
                duration:500,
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }

    /**
     * 淡出
     */
    public hide():Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                alpha:0,
                scale:0,
                duration:500,
                onComplete:()=>{
                    resolve(1);
                }
            })
        }) 
    }

    /**
     * 移动到左边
     */
    public moveLeft():Promise<number>{
        return this.move(91);
    }

    /**
     * 移动到右边
     */
    public moveRight():Promise<number>{
        return this.move(761);
    }

     /**
     * 移动到中间
     */
    public moveCenter():Promise<number>{
        return this.move(492);
    }

    /**
     * 移动到玩具的位置
     */
    public move(x:number):Promise<number>{
        return new Promise(resolve=>{
            this.scene.add.tween({
                targets:this,
                x:x,
                duration:500,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    resolve(1);
                }
            })
        })
    }

   

}
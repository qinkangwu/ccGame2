import { ButtonContainer} from "../components";
import "phaser";

export class Cookie extends ButtonContainer{
    private image:Phaser.GameObjects.Image;
    private bitmapText:Phaser.GameObjects.BitmapText;

    public initPosition:{
        x:number,
        y:number
    }

    public hit:number;

    constructor(scene:Phaser.Scene,shape:any,callback: Phaser.Types.Input.HitAreaCallback,text:string){
        super(scene,shape,callback);
        this.image = new Phaser.GameObjects.Image(this.scene, 0, 0, "cookie");
        this.bitmapText = new Phaser.GameObjects.BitmapText(this.scene, 0, 0 + 5, "GenJyuuGothic47", text, 35, 0).setOrigin(0.5);
        this.add([this.image, this.bitmapText]);
    }
} 
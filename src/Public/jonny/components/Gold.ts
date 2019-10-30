import 'phaser';

export class Gold extends Phaser.GameObjects.Container{
    public static imgPosition = {
        x:968.95,
        y:149.75 
    }

    private goldImg:Phaser.GameObjects.Image;    
    private goldText:Phaser.GameObjects.Text;

    constructor(scene:Phaser.Scene,value:number|string){
        super(scene);
        value=value.toString();
        this.goldImg = new Phaser.GameObjects.Image(scene,Gold.imgPosition.x,Gold.imgPosition.y, "goldValue");
        this.goldText = new Phaser.GameObjects.Text(scene,981.45, 167.45,value, <Phaser.Types.GameObjects.Text.TextSyle>{ align: "center", fontSize: `16px`, fontFamily: "Arial", stroke: "#000", strokeThickness: 0 }).setOrigin(0.5).setResolution(2);
       
        this.add([this.goldImg,this.goldText]);
    }

    public setText(value:number|string):void{
        if(typeof value==="number"){
            value = value.toString();
        }
        this.goldText.setText(value);
    }

    public static loadImg(scene:Phaser.Scene):void{
        scene.load.image("gold","assets/commonUI/goldValue.png"); 
    }
}
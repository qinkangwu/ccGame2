import 'phaser';

export class Gold extends Phaser.GameObjects.Container{
    private goldImg:Phaser.GameObjects.Image;    
    private goldText:Phaser.GameObjects.Text;

    constructor(scene:Phaser.Scene,value:number|string){
        super(scene);
        value=value.toString();
        this.goldImg = new Phaser.GameObjects.Image(scene,0,0, "goldValue");
        this.goldText = new Phaser.GameObjects.Text(scene,9,13,value, <Phaser.Types.GameObjects.Text.TextStyle>{ align: "center", fontSize: `8px`, fontFamily: "Arial", stroke: "#000", strokeThickness: 0 }).setOrigin(0.5).setResolution(2);
        this.add([this.goldImg,this.goldText]);
        this.x = 968.95;
        this.y = 149.75;
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
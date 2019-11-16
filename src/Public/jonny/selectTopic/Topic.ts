import "phaser";

export class Topic extends Phaser.GameObjects.Container{
    bg:Phaser.GameObjects.Image;
    question:Phaser.GameObjects.Text;
    //civa:Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene,questionContent:string,civaTexture:string,civaFrame:string=null){
        super(scene,72+880*0.5,68+160*0.5);
        this.bg = new Phaser.GameObjects.Image(scene,0,0,"tigan01");
        //this.question =  new Phaser.GameObjects.BitmapText(scene, 0, 10, "ArialRoundedBold",questionContent,95-questionContent.length, 1).setOrigin(0.5);
        this.question =  new Phaser.GameObjects.Text(scene, 0, 10, questionContent,<Phaser.Types.GameObjects.Text.TextSyle>{
            align:"center",
            fontFamily:"Arial Rounded MT Bold",
            color:"#ffffff",
            fontSize:"30px",
            wordWrap:<Phaser.Types.GameObjects.Text.TextWordWrap>{width:656}
        }).setOrigin(0.5);
        this.question.tint = 0xFF6E09;
       // this.civa = this.scene.add.sprite(380,-90,civaTexture,civaFrame).setDepth(3);
        this.add([this.bg,this.question]);
    }
}
import "phaser";

export class OrderUI extends Phaser.GameObjects.Container{
    private leftBg:Phaser.GameObjects.Image;
    private rightBg:Phaser.GameObjects.Image;
    private bottomBar:Phaser.GameObjects.Image;
    private subject:Phaser.GameObjects.Image;
    public angel:Phaser.GameObjects.Image;
    public devil:Phaser.GameObjects.Image;
    private falseBtn:Phaser.GameObjects.Image;
    private trueBtn:Phaser.GameObjects.Image;
    private wordImg:Phaser.GameObjects.Image;
    private word:Phaser.GameObjects.BitmapText;
    private whiteBar:Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene,wordImgTexture:string,wordText:string){
        super(scene);
        this.leftBg = new Phaser.GameObjects.Image(scene,256,276,"leftBg");
        this.rightBg = new Phaser.GameObjects.Image(scene,768,276,"rightBg");
        this.bottomBar = new Phaser.GameObjects.Image(scene,512,489,"bottomBar");
        this.subject = new Phaser.GameObjects.Image(scene,512,300,"bg_subject").setDisplaySize(718,432);
        this.angel = new Phaser.GameObjects.Image(scene,125,123,"civa_angle_02");
        this.devil = new Phaser.GameObjects.Image(scene,901,123,"civa_devil_02");
        this.trueBtn = new Phaser.GameObjects.Image(scene,321,476,"btn_true");
        this.trueBtn.name = "true";
        this.falseBtn = new Phaser.GameObjects.Image(scene,703,476,"btn_false");
        this.falseBtn.name = "false";
        this.wordImg = new Phaser.GameObjects.Image(scene,512,253,wordImgTexture);
        this.wordImg.displayWidth = 200;
        this.wordImg.displayHeight = 200;
        this.word = new Phaser.GameObjects.BitmapText(scene,512,406,"ArialRoundedBold",wordText,45,1).setOrigin(0.5);
        this.word.tint = 0x006EFF;
        this.whiteBar = new Phaser.GameObjects.Graphics(scene).fillStyle(0xffffff).fillRect(0,0,1024,552);
        this.add([this.leftBg,this.rightBg,this.bottomBar,this.subject,this.angel,this.devil,this.trueBtn,this.falseBtn,this.wordImg,this.word,this.whiteBar]);
        this.hide();
    }

    hide(){
        this.whiteBar.visible = true;
    }

    show(){
        this.whiteBar.visible = false;
    }

}
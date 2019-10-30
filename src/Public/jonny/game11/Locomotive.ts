import "phaser";

export class Locomotive extends Phaser.GameObjects.Container{
    public body: Phaser.Physics.Arcade.Body;
    public bg:Phaser.GameObjects.Image;
    public dialog:Phaser.GameObjects.Image;
    public text:Phaser.GameObjects.BitmapText;
    pitStop:Phaser.Tweens.Timeline;
    constructor(scene: Phaser.Scene,text:string){
        super(scene,1000,142);
        this.init();
        this.bg = new Phaser.GameObjects.Image(scene,0,0,"locomotive").setOrigin(0.5,1);
        this.dialog = new Phaser.GameObjects.Image(scene,90,-200,"dialog");
        // this.text = new Phaser.GameObjects.Text(scene,90,-200,text,<Phaser.Types.GameObjects.Text.TextSyle>{
        //     align:"center",
        //     color:"#FF6E09",
        //     fontSize:"20px",
        //     fontFamily:"verdana",
        //     stroke:"#FF6E09",
        //     strokeThickness:1,
        // });
        // this.text.setOrigin(0.5).setResolution(2);
        this.text = new Phaser.GameObjects.BitmapText(scene,90,-200,"STYuantiSC40",text,20,1);
        this.text.letterSpacing = 5;
        this.text.setTint(0xFF6E09).setOrigin(0.5);
        this.add([this.bg,this.dialog,this.text]);
        this.pitStop = this.scene.tweens.timeline({
            targets:this,
            paused:true,
            repeat:-1,
            yoyo:true,
            tweens:[
                {
                    scaleX:0.98,
                    scaleY:1,
                    duration:250,
                    ease:"Sine.easeOut"
                }
            ]    
        })
    }

    init(){
        this.setScale(1,0.98);
        //this.setOrigin(0.5,1);
        //this.setPosition(1167.75,93.7);
    }

    public admission():Promise<any>{
        let animate = {
            then:resolve=>{
                this.scene.add.tween({
                    targets:this,
                    duration:5000,
                    ease:"Sine.easeOut",
                    x:0,
                    onStart:()=>{
                       this.pitStop.play(); 
                    },
                    onComplete:()=>{
                       resolve("ok");
                    }
                })
            }
        }
        return Promise.resolve(animate);
    }
    
    public static loadImg(scene:Phaser.Scene){
        scene.load.image("locomotive","assets/Game11/locomotive.png");
        scene.load.image("dialog","assets/Game11/dialog.png");
        scene.load.bitmapFont('STYuantiSC40', 'assets/font/STYuantiSC40/font.png', 'assets/font/STYuantiSC40/font.xml');
    }




}
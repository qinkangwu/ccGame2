import "phaser"

export class CoverDoublePlayer extends Phaser.GameObjects.Container {
    bg: Phaser.GameObjects.Graphics;
    image: Phaser.GameObjects.Image;
    text:Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene,texture: string) {
        super(scene,0,0);
        this.bg = new Phaser.GameObjects.Graphics(scene)
            .fillStyle(0x000000)
            .fillRect(0, 0, scene.game.renderer.width, scene.game.renderer.height)
            .setAlpha(0.6);
        this.image = new Phaser.GameObjects.Image(scene,scene.game.renderer.width * 0.5, scene.game.renderer.height * 0.5,texture);
        this.text = new Phaser.GameObjects.Text(scene,1024*0.5,552*0.5,"等待对手进入...",({color:"#ffffff",fontSize:"30px"} as Phaser.Types.GameObjects.Text.TextStyle)).setOrigin(0.5).setAlpha(0);
        this.add([this.bg,this.image,this.text]);
        this.init();
    }

    private init(){
        var canvas = document.querySelector("canvas");
        var startHandler = ()=>{
            canvas.removeEventListener("click", startHandler);
            canvas.removeEventListener("touchstart", startHandler);
            this.image.destroy(); 
            this.scene.scene.resume();
            this.text.alpha = 1;
        }
        canvas.addEventListener("click", startHandler);
        canvas.addEventListener("touchstart", startHandler);
    }

}
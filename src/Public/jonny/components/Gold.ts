/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline/guiyang
 */

import 'phaser';

export class Gold extends Phaser.GameObjects.Container{
    private goldImg:Phaser.GameObjects.Image;    
    private goldText:Phaser.GameObjects.Text;
    private value:number;

    constructor(scene:Phaser.Scene,value:number){
        super(scene);
        this.value = value;
        this.goldImg = new Phaser.GameObjects.Image(scene,0,0, "goldValue");
        this.goldText = new Phaser.GameObjects.Text(scene,0,0,value.toString(), <Phaser.Types.GameObjects.Text.TextStyle>{ align: "center", fontSize: `8px`, fontFamily: "sans-serif" }).setResolution(2).setOrigin(0.5);
        this.goldText.x = 12;
        this.goldText.y = 17-5;
        this.add([this.goldImg,this.goldText]);
        this.x = 968.95;
        this.y = 149.75;
    }

    public setText(value:number){
        if(value < this.value){
            let tempGoldImg = new Phaser.GameObjects.Image(this.scene,0,0,"goldValue");
            this.add(tempGoldImg);
            this.scene.add.tween({
                targets:tempGoldImg,
                duration:500,
                y:"+=50",
                alpha:0,
                scale:1.7,
                ease:"Sine.easeOut",
                onComplete:()=>{
                    this.remove(tempGoldImg);
                }
            })
        }
        this.goldText.setText(value.toString());
        this.value = value;
    }

    public static loadImg(scene:Phaser.Scene):void{
        scene.load.image("gold","assets/commonUI/gold.png"); 
        scene.load.image("gold","assets/commonUI/goldValue.png"); 
    }
}
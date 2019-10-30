import "phaser";
import { EASE } from '../core/Animate'
import { Gold } from "./Gold";

interface Config {
    callback?: Function;  //动画结束的回调函数，可选
}

/**
 * src/Public/jonny/components/SellingGold.ts
 * @parame parentScene: Phaser.Scene; 
 * @parame config?:{
 * texture:string,  默认为 assets/commonUI/gold.png，须先载入纹理,否则需要重新传递此参数 | 可选
 * callback:Phaser.Types.Tweens.TweenOnCompleteCallback    动画结束的回调函数 | 可选
 * } 
 * 子对象golds的深度自己设置
 */

export class SellingGold {
    private parentScene: Phaser.Scene;
    private goldValue: number;
    public golds: Phaser.GameObjects.Container;
    private callback: Function;
    private count: number = 0;
    private bg: Phaser.GameObjects.Graphics;

    constructor(parentScene: Phaser.Scene, config?: Config) {
        this.parentScene = parentScene;
        this.callback = config.callback || function () { };
        this.golds = this.parentScene.add.container(0, 0);
        this.bg = this.parentScene.add.graphics();

    }

    /**
     *  正确
     */
    public goodJob(_goldValue) {
        if (_goldValue === 0) return this.callback.call(this.parentScene);
        this.bg.fillStyle(0x000000);
        this.bg.fillRect(0, 0, 1024, 552);
        this.bg.setAlpha(0.7);
        this.goldValue = _goldValue;

        let goldCoinsLight: Phaser.GameObjects.Image;
        goldCoinsLight = this.parentScene.add.image(347 + 331 * 0.5, 67 + 331 * 0.5, "goldCoinsLight");
        let goldCoins: Phaser.GameObjects.Image;
        goldCoins = this.parentScene.add.image(406 + 193 * 0.5, 146 + 167 * 0.5, "goldCoins");
        let goldCoinsValue: Phaser.GameObjects.Image;
        goldCoinsValue = this.parentScene.add.image(445 + 136 * 0.5, 346 + 65 * 0.5, "goldCoinsValue");
        let goldCoinsValueText: Phaser.GameObjects.BitmapText;
        goldCoinsValueText = this.parentScene.add.bitmapText(490 + 46 * 0.5, 350 + 56 * 0.5 + 56 * 0.2, "STYuantiSC40", `+${_goldValue}`, 40).setOrigin(0.5, 0.5);
        this.golds.add([this.bg, goldCoinsLight, goldCoins, goldCoinsValue, goldCoinsValueText]);
        this.goldAni();
    }


    private goldAni(): void {
        let goldCoinsLight = (this.golds.list[1] as Phaser.GameObjects.Image);
        let goldCoins = (this.golds.list[2] as Phaser.GameObjects.Image);
        let goldCoinsValue = (this.golds.list[3] as Phaser.GameObjects.Image);
        let goldCoinsValueText = (this.golds.list[4] as Phaser.GameObjects.BitmapText);
        var soundPlay = ()=>{
            let sound = this.parentScene.sound.add("goldSound");
            sound.on("complete",()=>{
                sound.destroy();
            });
            sound.play();
        }

        var init = (ani) => {
            goldCoinsLight.setScale(0);
            goldCoins.setScale(0);
            goldCoinsValue.setScale(0);
            goldCoinsValueText.setScale(0);
            soundPlay();
            ani();
        }

        var ani = () => {
            this.parentScene.tweens.timeline(<Phaser.Types.Tweens.TimelineBuilderConfig>{
                tweens: [
                    {
                        targets: [goldCoinsLight, goldCoins],
                        scale: 1,
                        ease: "Sine.easeOut",
                        duration: 1000
                    }
                ]
            })

            this.parentScene.add.tween({
                targets: [goldCoinsValue, goldCoinsValueText],
                scale: 1,
                ease: EASE.spring,
                delay: 500,
                duration: 1000
            })

            this.parentScene.tweens.timeline({
                tweens: [
                    {
                        targets: goldCoinsLight,
                        rotation: Math.PI * 2,
                        duration: 2000,
                    },
                    {
                        targets: [goldCoinsLight, goldCoins, goldCoinsValue, goldCoinsValueText],
                        scale: 0,
                        alpha: 0,
                        duration: 200
                    }
                ],
                onComplete: () => {
                    this.callback();
                    setTimeout(() => {
                        this.golds.destroy(); //晚一秒销毁的目的是为了衔接下一步的专场动画
                    }, 1000);
                }
            })
        }

       

        init(ani);
    }

    public static loadImg(scene: Phaser.Scene): void {
        scene.load.image("goldCoins", "assets/commonUI/goldCoins.png");
        scene.load.image("goldCoinsValue", "assets/commonUI/goldCoinsValue.png");
        scene.load.image("goldCoinsLight", "assets/commonUI/goldCoinsLight.png");
        scene.load.audio("goldSound", "assets/sounds/goldSound.mp3");
        scene.load.bitmapFont("STYuantiSC40", "assets/font/STYuantiSC40/font.png", "assets/font/STYuantiSC40/font.xml");
    }

}

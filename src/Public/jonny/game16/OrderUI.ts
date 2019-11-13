import "phaser";

export class OrderUI extends Phaser.GameObjects.Container {
    public leftBg: Phaser.GameObjects.Image;
    public rightBg: Phaser.GameObjects.Image;
    public bottomBar: Phaser.GameObjects.Image;
    public subject: Phaser.GameObjects.Image;
    public angel: Phaser.GameObjects.Image;
    public devil: Phaser.GameObjects.Image;
    public falseBtn: Phaser.GameObjects.Image;
    public trueBtn: Phaser.GameObjects.Image;
    public wordImg: Phaser.GameObjects.Image;
    public word: Phaser.GameObjects.BitmapText;
    public whiteBar: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, wordImgTexture: string, wordText: string) {
        super(scene);
        this.leftBg = new Phaser.GameObjects.Image(scene, 256, 276, "leftBg");
        this.rightBg = new Phaser.GameObjects.Image(scene, 768, 276, "rightBg");
        this.bottomBar = new Phaser.GameObjects.Image(scene, 512, 489, "bottomBar");
        this.subject = new Phaser.GameObjects.Image(scene, 512, 300, "bg_subject").setDisplaySize(718, 432);
        this.angel = new Phaser.GameObjects.Image(scene, 125, 123, "civa_angle_02").setData("initPosition", { x: 125, y: 123 });
        this.devil = new Phaser.GameObjects.Image(scene, 901, 123, "civa_devil_02").setData("initPosition", { x: 901, y: 123 });
        this.trueBtn = new Phaser.GameObjects.Image(scene, 321, 476, "btn_true").setInteractive();
        this.trueBtn.name = "true";
        this.falseBtn = new Phaser.GameObjects.Image(scene, 703, 476, "btn_false").setInteractive();
        this.falseBtn.name = "false";
        this.wordImg = new Phaser.GameObjects.Image(scene, 512, 253, wordImgTexture);
        this.wordImg.displayWidth = 200;
        this.wordImg.displayHeight = 200;
        this.word = new Phaser.GameObjects.BitmapText(scene, 512, 406, "ArialRoundedBold", wordText, 45, 1).setOrigin(0.5);
        this.word.tint = 0x006EFF;
        this.whiteBar = new Phaser.GameObjects.Graphics(scene).fillStyle(0xffffff).fillRect(0, 0, 1024, 552);
        this.add([this.leftBg, this.rightBg, this.bottomBar, this.subject, this.angel, this.devil, this.trueBtn, this.falseBtn, this.wordImg, this.word, this.whiteBar]);
        this.hide();
    }

    hide() {
        this.whiteBar.visible = true;
    }

    show() {
        this.whiteBar.visible = false;
    }

    angelDevilFloating(): Phaser.Tweens.Tween {
        return this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets: [this.angel, this.devil],
            y: "-=10",
            duration: 500,
            ease: "Sine.easeInOut",
            repeat: -1,
            yoyo: true
        })
    }

    /**
     * @param obj angel或devil
     * @param texture1 初始化纹理
     * @param texture2 换回来的纹理
     * @param x 偏移的坐标值
     */
    beingAttacked(obj: Phaser.GameObjects.Image, texture1: string,texture2:string, x: number): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            obj.setTexture(texture1);
            this.scene.tweens.timeline(<Phaser.Types.Tweens.TimelineBuilderConfig>{
                targets: obj,
                tweens: [
                    {
                        x: `+=${x}`,
                        duration: 1000,
                        ease: "Sine.easeOut"
                    },
                    {
                        alpha: 0,
                        flipX:true,
                        duration: 1000,
                        repeat: 1,
                        yoyo: true,
                        ease: "Sine.easeOut"
                    }
                ],
                onComplete: () => {
                    obj.setTexture(texture2);
                    obj.setPosition(
                        obj.getData("initPosition").x,
                        obj.getData("initPosition").y
                    )
                    resolve(true);
                }
            })
        })
    }

}
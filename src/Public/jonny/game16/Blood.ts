import 'phaser';

export class Blood{
    public vs:Phaser.GameObjects.Image;
    public blood2:Phaser.GameObjects.Sprite;
    public blood8:Phaser.GameObjects.Sprite;
    private scene:Phaser.Scene;
    constructor(scene: Phaser.Scene,blood2Index:number,blood8Index:number){
        this.scene = scene;
        this.vs = this.scene.add.image(484.46+54.36*0.5,30.57+27.69*0.5,'vs').setDisplaySize(54.5,28).setDepth(3);
        this.blood2 = this.scene.add.sprite(232+245*0.5,33+22*0.5,'blood2').setDepth(3);
        this.blood8 = this.scene.add.sprite(547+245*0.5,33+22*0.5,'blood8').setDepth(3);
        this.scene.add.existing(this.blood2);
        this.scene.add.existing(this.blood8);
        this.blood8.displayWidth = this.blood2.displayWidth = 245;
        this.blood8.displayHeight = this.blood2.displayHeight = 22;
        this.blood2.setTexture('blood2',`blood2000${blood2Index}`);
        this.blood8.setTexture('blood8',`blood8000${blood8Index}`);
        this.createAnimateConfig();
    }

    private createAnimateConfig(){
        this.scene.anims.create({
            key: "blood8to1",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood8000', start: 0, end: 4 })
        });
        this.scene.anims.create({
            key: "blood8to2",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood8000', start: 4, end: 8 })
        });
        this.scene.anims.create({
            key: "blood8to3",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood800', start: 8, end: 11 })
        });
        this.scene.anims.create({
            key: "blood8to4",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood800', start: 11, end: 15 })
        });
        this.scene.anims.create({
            key: "blood8to5",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood800', start: 15, end: 18 })
        });
        this.scene.anims.create({
            key: "blood8to6",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood800', start: 18, end: 22})
        });
        this.scene.anims.create({
            key: "blood8to7",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood800', start: 22, end: 25 })
        });
        this.scene.anims.create({
            key: "blood8to8",
            frames: this.scene.anims.generateFrameNames('blood8', { prefix: 'blood800', start: 25, end: 29 })
        });
        this.scene.anims.create({
            key: "blood2to1",
            frames: this.scene.anims.generateFrameNames('blood2', { prefix: 'blood2000', start: 0, end: 7 })
        });
        this.scene.anims.create({
            key: "blood2to2",
            frames: this.scene.anims.generateFrameNames('blood2', { prefix: 'blood200', start: 7, end: 14 })
        });

    }


    public setBlood2(blood2Index:number){
        this.blood2.play(`blood2to${blood2Index}`);
    }

    public setBlood8(blood8Index:number){
        this.blood8.play(`blood8to${blood8Index}`);
    }

    public show(){
       this.blood2.visible = true; 
       this.blood8.visible = true; 
    }
        
    public hide(){
       this.blood2.visible = false; 
       this.blood8.visible = false; 
    }
}
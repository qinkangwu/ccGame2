import 'phaser';

export class Blood extends Phaser.GameObjects.Container{
    public vs:Phaser.GameObjects.Image;
    public blood2:Phaser.GameObjects.Sprite;
    public blood8:Phaser.GameObjects.Sprite;
    constructor(scene: Phaser.Scene,blood2Index:number,blood8Index:number){
        super(scene,512,45);
        this.vs = new Phaser.GameObjects.Image(scene,0,0,'vs');
        this.blood2 = new Phaser.GameObjects.Sprite(scene,232+245*0.5,33+22*0.5,'blood2').setDepth(3);
        this.blood8 = new Phaser.GameObjects.Sprite(scene,547+245*0.5,33+22*0.5,'blood8').setDepth(3);
        this.scene.add.existing(this.blood2);
        this.scene.add.existing(this.blood8);
        this.blood8.displayWidth = this.blood2.displayWidth = 245;
        this.blood8.displayHeight = this.blood2.displayHeight = 22;
        this.add(this.vs);
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


    private setBlood(obj:Phaser.GameObjects.Image,key:string,frame:string){
        //obj.setTexture(key,frame);

    }

    public setBlood2(blood2Index:number){
        //this.setBlood(this.blood2,'blood2',`blood2000${blood2Index}`);
        this.blood2.play(`blood2to${blood2Index}`);
    }

    public setBlood8(blood8Index:number){
        this.blood8.play(`blood8to${blood8Index}`);
    }


        
}
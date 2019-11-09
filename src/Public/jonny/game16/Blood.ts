import 'phaser';

export class Blood extends Phaser.GameObjects.Container{
    public vs:Phaser.GameObjects.Image;
    public blood2:Phaser.GameObjects.Image;
    public blood8:Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene,blood2Index:number,blood8Index:number){
        super(scene,512,45);
        this.vs = new Phaser.GameObjects.Image(scene,0,0,'vs');
        this.blood2 = new Phaser.GameObjects.Image(scene,-155.5,0,'blood2');
        this.blood8 = new Phaser.GameObjects.Image(scene,155,0,'blood8');
        this.blood8.displayWidth = this.blood2.displayWidth = 245;
        this.blood8.displayHeight = this.blood2.displayHeight = 22;
        this.add([this.blood2,this.blood8,this.vs]);
        this.blood2.setTexture('blood2',`blood2000${blood2Index}`);
        this.blood8.setTexture('blood8',`blood8000${blood8Index}`);
    }

    private setBlood(obj:Phaser.GameObjects.Image,key:string,frame:string){
        obj.setTexture(key,frame);
    }

    public setBlood2(blood2Index:number){
        this.setBlood(this.blood2,'blood2',`blood2000${blood2Index}`);
    }

    public setBlood8(blood8Index:number){
        this.setBlood(this.blood8,'blood8',`blood8000${blood8Index}`);
    }


        
}
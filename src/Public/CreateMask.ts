/**
 * @class CreateMask 开始游戏遮罩层
 * @param scene 当前场景
 * @param cb 点击开始游戏回调
 */
export default class CreateMask{
    private scene ; 
    private cb ;
    constructor(scene,cb){
        this.scene = scene;
        this.cb = cb;
        this.loadImg();
    }

    private init () : void {
        this.createMask();
    }

    private createMask () : void {
        //创建开始游戏遮罩
        let graphicsObj : Phaser.GameObjects.Graphics = this.scene.add.graphics();
        graphicsObj.fillStyle(0x000000,.5);
        graphicsObj.fillRect(0,0,window.innerWidth,window.innerHeight).setDepth(1);
        //@ts-ignore
        let mask : Phaser.GameObjects.Image = this.scene.add.image(window.innerWidth / 2, window.innerHeight / 2 , `${window.currentGame}Mask`).setDepth(100);
        let zoneObj : Phaser.GameObjects.Zone = this.scene.add.zone(window.innerWidth / 2 - 104.5,window.innerHeight / 2 + 138 ,209 , 53 ).setOrigin(0).setInteractive();
        zoneObj.on('pointerdown',()=>{
            //点击开始游戏注销组件
            zoneObj.destroy();
            graphicsObj.destroy();
            mask.destroy();
            this.cb && this.cb.call(this.scene);
        });
    }

    private loadImg () : void {
        //@ts-ignore
        this.scene.load.image(`${window.currentGame}Mask`,`assets/mask/${window.currentGame}.png`);
        this.scene.load.on('complete',this.init.bind(this));
        this.scene.load.start();
    }
}
import "phaser";

/**
 * @param scene is Phaser.Scene
 * @param texture is string
 */

export cover

// export default class Cover{
//     init(scene: Phaser.Scene, texture: string) {
//         let _bg = this.scene.add.graphics();
//         _bg.fillStyle(0x000000);
//         _bg.fillRect(0, 0, scene.game.renderer.width, scene.game.renderer.height);
//         _bg.setAlpha(0.6);

//         let _cover = this.scene.add.image(scene.game.renderer.width * 0.5, scene.game.renderer.height * 0.5, texture).setOrigin(0.5);
//         this.add([_bg, _cover]);

//         //@ts-ignore
//         let _maskShape = this.scene.make.graphics();
//         //let _maskShape = new Phaser.GameObjects.Graphics();
//         _maskShape.fillStyle(0xffffff);
//         _maskShape.fillCircle(1024*0.5,552*0.5,2024*0.5*0.1);
//         let _mask = _maskShape.createBitmapMask();
//         _cover.setMask(_mask);

//         //this.add(_maskShape);

//         this.setDepth(100);
//         this.bindClick(_cover, scene);
//     }

//     bindClick(_cover: Phaser.GameObjects.Image, _scene: Phaser.Scene) {
//          let that = this;
//          var canvas = document.querySelector("canvas");
//         canvas.addEventListener("click", startHandler);
//         canvas.addEventListener("touchstart", startHandler);
//         function startHandler(){
//             canvas.removeEventListener("click",startHandler);
//             canvas.removeEventListener("touchstart",startHandler);
//             //that.destroy();
//             _scene.scene.resume(); 
//         }
//     }

//     start():void{

//     }
// }
// module.exports = class Cover extends Phaser.GameObjects.Container{
//     constructor(scene:Phaser.Scene,coverTexture:string){
//         super(scene,0,0);
//         this.init(scene,coverTexture);
//     }

//     init(scene,coverTexture){
//         this.add([
//             this.createbg(scene),
//             this.createCover(scene,coverTexture)
//         ])
//         this.setDepth(100);
//     }

//     createbg(scene){
//         let bg = new Phaser.GameObjects.Graphics(scene);
//         bg.fillStyle(0x000000);
//         bg.fillRect(0,0,scene.game.renderer.width,scene.game.renderer.height);
//         console.log(1);
//         return bg;
//     }

//     createCover(scene:Phaser.Scene,coverTexture:string){
//         let cover = new Phaser.GameObjects.Image(scene,0, 0,coverTexture).setOrigin(0.5);
//         cover.setPosition(
//             scene.game.renderer.width*0.5,
//             scene.game.renderer.height*0.5
//         );
//         return cover;
//     }
// }
// var test = {
//     name:"Jonny"
// }
// module.exports = test;

exports {
    name:"jonny",
    age:"700"
}

import "phaser";

/**
 * @param scene is Phaser.Scene
 * @param texture is string 
 * 动画的时间会延续1000ms
 */

export var cover = function (scene: Phaser.Scene,texture: string,callback:Function=()=>{}) {
    let bg = scene.add.graphics().setDepth(1999);
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, scene.game.renderer.width, scene.game.renderer.height);
    bg.setAlpha(0.6);

    var image = scene.add.image(scene.game.renderer.width * 0.5, scene.game.renderer.height * 0.5,texture).setDepth(2000);
    //@ts-ignore
    var bitmapshape = scene.make.graphics();
    bitmapshape.fillStyle(0xffffff);
    bitmapshape.fillCircle(0, 0, scene.game.renderer.width * 0.7);
    bitmapshape.setPosition(scene.game.renderer.width * 0.5, 440);

    var bitmapMask = bitmapshape.createGeometryMask();
    image.setMask(bitmapMask);
    bg.setMask(bitmapMask);

    var canvas = document.querySelector("canvas");
    canvas.addEventListener("click", startHandler);
    canvas.addEventListener("touchstart", startHandler);
    function startHandler() {
        canvas.removeEventListener("click", startHandler);
        canvas.removeEventListener("touchstart", startHandler);
        scene.scene.resume();
        //scene.scale.startFullscreen();
        if(scene.scene.key==="Game9PlayScene"){   
            scene.tweens.add(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: bitmapshape,
                duration: 1000,
                scale: 0,
                onComplete: () => {
                    bg.destroy();
                    image.destroy();
                    callback();
                }
            });
        }else{
            bg.destroy();
            image.destroy();
            callback(); 
        }

    }
}


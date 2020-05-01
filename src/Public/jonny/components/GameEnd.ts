import "phaser";

export class GameEnd {
    public static async Show(scene: Phaser.Scene) {
        await this.LoadAssets(scene);
        scene.add.image(0, 0, "gameEnd").setOrigin(0).setDepth(1000);
    }

    public static LoadAssets(scene: Phaser.Scene): Promise<any> {
        return new Promise(resolve => {
            scene.load.on("complete", (e: any) => {
                resolve(e);
            });
            scene.load.image("gameEnd", "assets/commonUI/gameEnd.png");
            scene.load.start();
        });
    }
}


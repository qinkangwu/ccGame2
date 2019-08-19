import 'phaser';
import Button from './Button';

/**
  * @param Phaser.Scene [scene]  
  * @param number [x] options
  * @param number [y] options
  * @param string [texture] options
  * @param any [shape] options
  * @param Function [callback] options 
 */

export default class ButtonMusic extends Button {
  mountUpdate: Function;
  constructor(scene: Phaser.Scene, x: number = 939 + 60 * 0.5, y: number = 25 + 60 * 0.5, texture: string = "btn_sound_on", shape: any = new Phaser.Geom.Circle(60 * 0.5, 60 * 0.5, 60), callback: Phaser.Types.Input.HitAreaCallback = Phaser.Geom.Circle.Contains) {
    super(scene, x, y, texture, shape, callback)
    this.pointerdownFunc = this.onOffSound.bind(this, scene);
    this.mountUpdate = () => {
      if (this.rotation === Math.PI * 2) {
        this.rotation = 0;
      }
      if ((scene as any).bgm.isPlaying) {
        this.rotation += 0.05;
      } else {
        this.rotation = 0;
      }
    }
  }

  onOffSound(scene): void {
    let bgm = scene.bgm;
    if (bgm.isPlaying) {
      this.setTexture("btn_sound_off");
      bgm.pause();
    } else {
      this.setTexture("btn_sound_on");
      bgm.resume();
    }
  }

}
import 'phaser';
import Button from './Button';



export default class ButtonMusic extends Button {
  mountUpdate: Function;
  constructor(scene: Phaser.Scene, x:number, y:number,texture: string, shape: any = new Phaser.Geom.Circle(60 * 0.5, 60 * 0.5, 60), callback: Phaser.Types.Input.HitAreaCallback = Phaser.Geom.Circle.Contains) {
    super(scene, x,y, texture, shape, callback)
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
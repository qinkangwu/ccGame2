import "phaser";

import {LoadScene} from './scenes/Load';
import {PlayScene} from './scenes/Play';

const config: GameConfig = {
  type: Phaser.AUTO,
  width : window.innerWidth,
  height : window.innerHeight,
  parent : 'content',
  scale: {
    mode: Phaser.DOM.FIT,
    autoCenter: Phaser.DOM.CENTER_BOTH
  },
  //transparent : true,
  scene : [LoadScene,PlayScene]
};

export class StarfallGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  window.phaserGame = new StarfallGame(config);
};
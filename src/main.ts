import "phaser";

import {Game3LoadScene} from './scenes/Game3/Load';
import {Game3PlayScene} from './scenes/Game3/Play';

import { Game4LoadScene } from './scenes/Game4/Load';
import { Game4PlayScene } from './scenes/Game4/Play';

let path : string = window.location.hash.replace('#/','');
let sceneArr : Array<object> = [];

switch (path){
   case 'game3' : 
    sceneArr.push(Game3LoadScene,Game3PlayScene);
    break;
   case 'game4' : 
    sceneArr.push(Game4LoadScene,Game4PlayScene);
    break;
   default : 
    sceneArr.push(Game3LoadScene,Game3PlayScene);
    break;
}

const config: GameConfig = {
  type: Phaser.AUTO,
  width : window.innerWidth,
  height : window.innerHeight,
  parent : 'content',
  //@ts-ignore
  scale: {
    //@ts-ignore
    mode: Phaser.DOM.FIT,
    //@ts-ignore
    autoCenter: Phaser.DOM.CENTER_BOTH
  },
  //transparent : true,
  scene : sceneArr
};

export class StarfallGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  //@ts-ignore
  window.phaserGame = new StarfallGame(config);
};
import "phaser";

import {LoadScene} from './scenes/Game3/Load';
import {PlayScene} from './scenes/Game3/Play';

let path : string = window.location.hash.replace('#/','');
let sceneArr : Array<object> = [];

switch (path){
   case 'game3' : 
    sceneArr.push(LoadScene,PlayScene);
    break;
   default : 
    sceneArr.push(LoadScene,PlayScene);
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
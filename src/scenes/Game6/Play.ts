import {get} from '../../lib/http';
import apiPath from '../../lib/apiPath';
import {game6DataItem} from '../../interface/Game6';

export class Game6PlayScene extends Phaser.Scene {
    constructor() {
      super({
        key: "Game6PlayScene"
      });
    }
  
    init(): void {
      console.log("游戏开始");
    }
  
    preload(): void {
    }
    
  
    create(): void {
    }
  
    update(time: number , delta : number): void {
    }
  };
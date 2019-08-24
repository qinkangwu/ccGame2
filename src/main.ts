import "phaser";
let path: string =
  window.location.hash.match(/#\/(.+)\??/) &&
  window.location.hash.match(/#\/(.+)\??/).length > 1 &&
  window.location.hash.match(/#\/(.+)\??/)[1]
path && path.indexOf('?') > -1 && (path = path.split('?')[0]);
path && (path = path.replace(/\b(\w)/g,(m)=>{
  return m.toUpperCase();
}));

let sceneArr: Array<object> = [];

const initHandle = (arr : object[]) : void=>{
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'content',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom : {
      createContainer : true
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        //debug: false
        debug: true
      }
    },
    //transparent : true,
    scene: sceneArr
  };
  
  class ccEnglishGames extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
      super(config);
    }
  }

  window.onload = () => {
    //@ts-ignore
    window.phaserGame = new ccEnglishGames(config);
  };
}

const loadOnDemand = (menu : string ) : void=>{
  //按需加载
  //@ts-ignore
  window.currentGame = menu; 
  let menuStr = [];
  //@ts-ignore
  require.context(`./scenes/`,true,/\.ts$/).keys().map((r : string)=>{
    r.indexOf(menu) > -1 && menuStr.push(r.substr(r.lastIndexOf('/') + 1));
  })
  Promise.all(menuStr.map((r,i)=>import(`./scenes/${menu}/${r}`))).then((r : [])=>{
    r.map((r2)=>{
      //@ts-ignore
      sceneArr.push(r2.default);
    })
    initHandle(sceneArr);
  })
}

loadOnDemand(path);
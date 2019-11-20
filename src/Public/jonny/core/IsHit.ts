export class Bounds{
    minX:number;
    maxX:number;
    minY:number;
    maxY:number;
    constructor(rectangle:Phaser.Geom.Rectangle){
        this.minX = rectangle.x;
        this.minY = rectangle.y;
        this.maxX = rectangle.x + rectangle.width;
        this.maxY = rectangle.y + rectangle.height;
    }
}



export var isHit = function (bounds1:Bounds,bounds2:Bounds):boolean{
    if(!(bounds1.maxX < bounds2.minX || bounds1.minX  > bounds2.maxX || bounds1.maxY < bounds2.minY || bounds1.minY > bounds2.maxY)){
        return true;
    }else{
        return false;
    }
}
import "phaser";

interface item {
    x : number,
    y : number
}

const itemWidth = 10;

/**
 * @name 路径五角星动画
 * @param scene => 场景
 * @param obj =>[{from},{to},{to}......]
 * @method show => 启动动画(一轮)
 */
export default class PathGuideAnims { 
    private obj : item[] = [];
    private scene : Phaser.Scene ; 
    constructor(scene : Phaser.Scene , obj : item[]){
        this.scene = scene;
        this.obj = obj;
    }
    public show () : void {
        let sum : number = 0 ;
        this.obj.reduce((pre,cur,curInx,arr)=>{
            let num : number = this.computeNum(pre.x,cur.x) === 0 ? this.computeNum(pre.y,cur.y) : this.computeNum(pre.x,cur.x) ; 
            let isX : boolean = this.computeNum(pre.y,cur.y) === 0 ;
            let isNegative : boolean = this.computeNum(pre.x,cur.x) === 0 ? this.computeNum(pre.y,cur.y) < 0 : this.computeNum(pre.x,cur.x) < 0 ;
            for(let i = 0 ; i < Math.abs(num) ; i ++){
                let obj = this.scene.add.image(isX ? isNegative ? pre.x - (i * itemWidth) : pre.x + (i * itemWidth) : cur.x , isX ? cur.y : isNegative ? pre.y - (i * itemWidth) : pre.y + (i * itemWidth) , 'starGuidePic').setOrigin(0).setDepth(100).setAlpha(0).setDisplaySize(itemWidth,itemWidth);
                this.scene.tweens.add({
                    targets : obj , 
                    displayWidth : 15,
                    displayHeight : 15,
                    ease : 'Sine.easeInOut' ,
                    alpha :  1 ,
                    yoyo : true,
                    duration : 500 ,
                    delay : sum * 10,
                    onComplete : ()=>{
                        obj.destroy();
                    }
                });
                sum ++ ;
            }
            return cur;
        })
    }

    private computeNum (from : number  , to : number ) : number {
        let dis = to - from ;
        return Math.ceil ( dis / itemWidth );
    }   

    public static loadImg(scene) : void {
        //多个全局组件load.start会出现未知bug 采用在组件内部preload调用此函数加载资源
        scene.load.image('starGuidePic','assets/commonUI/starGuidePic.png');
    }
}
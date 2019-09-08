import "phaser";

class Vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class CivaMen extends Phaser.GameObjects.Image {
    private op: Vec2;
    private tp: Vec2;
    private path: Phaser.Curves.Path;
    private follower: {
        t: number;
        vec: Phaser.Math.Vector2
    }
    public dx: number;
    public offsetY: number;
    public duration: number;
    public round:{
        times:number;   //玩了几次
        result:number;  //是否正确，错误为0，正确为1
    }
    public animateEnd:Function;  //动画全部结束的回调

    public times: number;
    private _times: number;
    private dxArr: number[];

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.follower = {
            t: 0,
            vec: new Phaser.Math.Vector2()
        }
        this.x = x;
        this.y = y;
        this.duration = 1000;
        this._times = 0;
        this.round = {
            times:0,
            result:0
        }
        this.init();
    }

    private init() {
        this.setOrigin(56 / 115, 166 / 177);   //注册点设置为脚板底
    }

    /**
     * 
     */
    public startJumpIn(times: number, dxArr: number[]) {
        this.times = times;
        this.dxArr = dxArr;
        this.jumpIn(0);
    }

    private jumpIn(i) {
        this.dx = this.dxArr[i];
        this.reset();
        this.animate();
    }

    private reset(): void {
        this.follower = {
            t: 0,
            vec: new Phaser.Math.Vector2()
        }
        this.path = new Phaser.Curves.Path();
        this.op = new Vec2(this.x, this.y);
        this.tp = new Vec2(this.dx, this.y);
        this.path.moveTo(this.op.x, this.op.y);
        this.path.quadraticBezierTo(this.tp.x, this.tp.y, (this.op.x + this.tp.x) >> 1, this.tp.y - 150);
    }

    public animate() {
        this.drawPath();

        var goOut = () => {
            let target = {
                t:0
            }
            this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
                targets: target,
                t:1,
                duration: 1000,
                onUpdate:()=>{
                    this.x+=5;
                },
                onComplete:this.animateEnd
            })
        }

        this.scene.add.tween(<Phaser.Types.Tweens.TweenBuilderConfig>{
            targets: this.follower,
            t: 1,
            ease: 'Sine.easeInOut',
            duration: this.duration,
            onUpdate: () => {
                this.path.getPoint(this.follower.t, this.follower.vec);
                this.setPosition(this.follower.vec.x, this.follower.vec.y);
            },
            onComplete: () => {
                this._times += 1;
                console.log(this._times, this.times);
                if (this._times < this.times) {
                    this.jumpIn(this._times);
                } else {
                    if (this.times > 1) {
                        goOut();
                    }
                    this._times = 0;
                }
            }
        })
    }

   

    private drawPath(): void {
        let graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xff0000, 1);
        this.path.draw(graphics);
    }

}
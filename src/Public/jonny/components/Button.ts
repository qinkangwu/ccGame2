/**
 * @author       Peng Jiang <jonny.peng@qq.com>
 * @copyright    2019 civaonline.cn
 */

import "phaser";
import { StaticAni, TweenAni } from '../core/Animate';

/**
 * 初始化为0.7的透明度
 * @param scene Phaser.Scene
 * @param x number  setOrigin(0.5)
 * @param y number  setOrigin(0.5)
 * @param texture string
 * @param shape option Phaser.Geom.Circle | Phaser.Geom.Rectangle 交互的形状 
 * @param callback option Phaser.Types.Input.HitAreaCallback
 * @member interactive boolean 设置这个按钮是否可以交互
 */


export class Button extends Phaser.GameObjects.Sprite {
    public pointeroverFunc: Function;
    public pointeroutFunc: Function;
    public pointerdownFunc: Function;
    public pointerupFunc: Function;
    public minAlpha: number;
    public maxScale:number;
    public interactive: boolean;
    private overAni:boolean = true;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, texture: string, shape?: any, callback?: Phaser.Types.Input.HitAreaCallback) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.initStyle();
        this.minAlpha = 0.7;
        this.maxScale = 1.2;
        this.bindEvent(shape, callback);
    }

    initStyle(): void {
        this.setOrigin(0.5).setAlpha(0.7);
    }

    private bindEvent(shape?: any, callback?: Phaser.Types.Input.HitAreaCallback): void {
        if (shape !== undefined) {
            this.setInteractive(shape, callback);
        } else {
            this.setInteractive();
        }
        this.interactive = true;
        this.on("pointerover", this.pointeroverHandler);
        this.on("pointerout", this.pointeroutHandler);
        this.on("pointerdown", this.pointerdownHandler)
        this.on("pointerup", this.pointerupHandler)
    }

    public static bindEvent(obj):void{
        obj.on("pointerover", this.prototype.pointeroverHandler);
        obj.on("pointerout", this.prototype.pointeroutHandler);
        obj.on("pointerdown", this.prototype.pointerdownHandler);
        obj.on("pointerup", this.prototype.pointerupHandler);
    }

    public pointerupHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        StaticAni.alphaScaleFuc(this, 1, 1, this.minAlpha);
        if (this.pointerupFunc !== undefined) {
            this.pointerupFunc();
        }
    }

    public pointerdownHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        StaticAni.alphaScaleFuc(this, 1.2, 1.2, 1);
        if (this.pointerdownFunc !== undefined) {
            this.pointerdownFunc();
        }
    }

    public pointeroutHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        if (this.pointeroverFunc !== undefined) {
            this.pointeroverFunc();
        }
    }

    public pointeroverHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        StaticAni.alphaScaleFuc(this, 1, 1, 1);
        if(this.overAni){
            TweenAni.alphaScaleYoyoFunc(this.scene, this, this.maxScale, this.maxScale, 1);
            this.overAni = false;
        }
        if (this.pointeroutFunc !== undefined) {
            this.pointeroverFunc();
        }
    }
}

export class ButtonContainer extends Phaser.GameObjects.Container {
    public pointeroverFunc: Function;
    public pointeroutFunc: Function;
    public pointerdownFunc: Function;
    public pointerupFunc: Function;
    public minAlpha: number;
    public maxScale:number;
    public interactive: boolean;
    public shape:any;
    public overAni:boolean = true;

    constructor(scene: Phaser.Scene,shape:any,callback:Phaser.Types.Input.HitAreaCallback) {
        super(scene);
        this.initStyle();
        this.minAlpha = 0.7;
        this.maxScale = 1.2;
        this.shape = shape;
        this.bindEvent(shape, callback);
    }

    initStyle(): void {
        this.setAlpha(0.7);
    }

    private bindEvent(shape: any, callback: Phaser.Types.Input.HitAreaCallback): void {
        if (shape !== undefined) {
            this.setInteractive(shape, callback);
        } else {
            this.setInteractive();
        }
        this.interactive = true;
        this.on("pointerover", this.pointeroverHandler);
        this.on("pointerout", this.pointeroutHandler);
        this.on("pointerdown", this.pointerdownHandler)
        this.on("pointerup", this.pointerupHandler)
    }

    public static bindEvent(obj):void{
        obj.on("pointerover", this.prototype.pointeroverHandler);
        obj.on("pointerout", this.prototype.pointeroutHandler);
        obj.on("pointerdown", this.prototype.pointerdownHandler);
        obj.on("pointerup", this.prototype.pointerupHandler);
    }

    public pointerupHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        StaticAni.alphaScaleFuc(this, 1, 1, this.minAlpha);
        if (this.pointerupFunc !== undefined) {
            this.pointerupFunc();
        }
    }

    public pointerdownHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        StaticAni.alphaScaleFuc(this, this.maxScale, this.maxScale, 1);
        if (this.pointerdownFunc !== undefined) {
            this.pointerdownFunc();
        }
    }

    public pointeroutHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        if (this.pointeroverFunc !== undefined) {
            this.pointeroverFunc();
        }
    }

    public pointeroverHandler(): void | boolean {
        if (!this.interactive) {
            return false;
        }
        StaticAni.alphaScaleFuc(this, 1, 1, 1);
        if(this.overAni){
            TweenAni.alphaScaleYoyoFunc(this.scene, this, 1.2, 1.2, 1);
            this.overAni = false;
        }
       
        if (this.pointeroutFunc !== undefined) {
            this.pointeroverFunc();
        }
    }
}
import 'phaser';
import { game3DataInterface, game3BookMenus } from '../../interface/Game3';
import apiPath from '../../lib/apiPath';
import {get , makeParams} from '../../lib/http';
import CreateBtnClass from "../../Public/CreateBtnClass";
import PathGuideAnims from '../../Public/PathGuideAnims';
import CreateGuideAnims from "../../Public/CreateGuideAnims";

const W = 1024;
const H = 552;
const initW = W + 100;
let initDragNum : number = 0 ;

export default class Game3PlayScene extends Phaser.Scene {
    private ccData : Array<game3DataInterface> = [];   //音标数据
    private redSprite : Phaser.GameObjects.Sprite ;  //红气泡
    private blueSprite : Phaser.GameObjects.Sprite ; //蓝气泡
    private keySpritesArr : Array<Phaser.GameObjects.Sprite> = []; //键盘集合
    private textsArr : Array<Phaser.GameObjects.Text> = []; //文字集合 
    private imgsArr : Array<Phaser.GameObjects.Image> = []; //彩键集合
    private redText : Phaser.GameObjects.Text ; //元音音标字符
    private blueText : Phaser.GameObjects.Text ; // 辅音音标字符
    private leftSpriteX : number = 0; //第一个键盘的x值
    private dragX : number = 0;
    private show : Array<boolean> = [false,false];
    private middle : number = 0 ; //元音辅音分割数
    private particles : Phaser.GameObjects.Particles.ParticleEmitterManager ; // 粒子控制器
    private emitters  : object = {};  //粒子发射器
    private timer : number = 0; //判断是拖拽还是点击
    private dragTimer : number = 0; //拖拽记录时间
    private title : string; //课件title
    private titleObj : Phaser.GameObjects.Text; //课件title
    private bookMenu : Array<game3BookMenus> = []; //课件目录
    private currentParams : object = {} //当前选择的课件
    private currentBookIndex : number = 0; //当前选择的课件的索引，用于做切换课件
    private flag : number = 0 ; //锁计数器
    private arrowArr : Array<Phaser.GameObjects.Image> = [] ; //箭头arr
    private noteArr : Array<Phaser.GameObjects.Image> = []; //音符数组
    private fiveLinesArr : Array<Phaser.GameObjects.Image> = []; //五线谱数组
    private bgObj : Phaser.GameObjects.Image ; //背景对象
    private bgm : Phaser.Sound.BaseSound ; //bgm
    private createGuideAnims : CreateGuideAnims; //引导动画引用
    // private pathGuideAnims : PathGuideAnims; //路径金光动画
    private outerKeyArr : Array<Phaser.GameObjects.Sprite> = [] ; //多余的键盘
    constructor() {
      super({
        key: "Game3PlayScene"
      });
    }
  
    init(data): void {
      //音标数据绑定
      this.ccData = data && data.data || {};
      this.title = data && data.title || '';
      this.currentParams = data && data.params || {};
    }
  
    preload(): void {
      //加载音频文件
      this.loadMusic(this.ccData);
      this.getBookMenu();
      // PathGuideAnims.loadImg(this);
    }
    
  
    create(): void {
      //初始化渲染
      this.cameras.main.setBackgroundColor('#0E49A7');
      this.drawTopBg();
      this.drawBottomKeys(true); //键盘
      // this.drawTopWord(); //音标气泡
      this.createAnims(); //创建动画
      this.createEmitter(); //创建粒子发射器
      this.createBgm(); //创建背景音乐
      new CreateBtnClass(this,{
        bgm : this.bgm
      });
      this.tweens.add({
        targets : this.bgObj,
        ease: 'Sine.easeInOut',
        displayHeight : 319,
        duration : 600,
        onComplete : ()=>{
          this.animsLayoutHandle(true);//开起布局
        }
      })  
      this.tweens.add({
        targets : this.fiveLinesArr,
        ease: 'Sine.easeInOut',
        alpha : 1,
        delay : 800,
        duration : 800
      })
    }

    private createBgm () : void {
      this.bgm = this.sound.add('bgm');
      //@ts-ignore
      this.bgm.play({
        loop : true,
        volume : .2
      })
    }

    private drawTopBg () : void {
      //顶部五线谱
      this.bgObj = this.add.image(0,0,'pianoTopBg').setOrigin(0).setDisplaySize(W,0);
      this.fiveLinesArr.push(this.add.image(0 ,32,'fiveLines').setOrigin(0).setDisplaySize(W,223).setAlpha(0));
      this.noteArr.push(this.add.image(82,66.5,'game3Icons3','note1.png').setOrigin(.5).setDisplaySize(100,65).setAlpha(0));
      this.noteArr.push(this.add.image(250,171,'game3Icons3','note2.png').setOrigin(.5).setDisplaySize(128,96).setAlpha(0));
      this.noteArr.push(this.add.image(767,120.5,'game3Icons3','note3.png').setOrigin(.5).setDisplaySize(81,99).setAlpha(0));
      this.noteArr.push(this.add.image(968.5,193,'game3Icons3','note4.png').setOrigin(.5).setDisplaySize(67,126).setAlpha(0));
      this.redSprite = this.add.sprite(W / 2,146,'game3Icons4','civa1.png').setOrigin(0.5).setAlpha(0).setDisplaySize(263,250).setDepth(1);
      this.blueSprite = this.add.sprite(W / 2,146,'game3Icons4','civa2.png').setOrigin(0.5).setAlpha(0).setDisplaySize(263,250).setDepth(1);
      this.redText = this.add.text(W / 2 ,143.5,'',{
        fontSize: "80px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#fff'
      }).setAlpha(0).setOrigin(0.5).setDepth(1);
      this. blueText = this.add.text(W / 2 ,143.5,'',{
        fontSize: "80px",
        fontFamily:"Arial Rounded MT Bold",
        fill : '#fff'
      }).setAlpha(0).setOrigin(0.5).setDepth(1);
      this.fiveLinesArr.push(this.add.image(0,0,'game3Mask').setOrigin(0).setDisplaySize(W,297).setAlpha(0));
    }

  
    update(time: number): void {

    }

    private loadMusic (data : Array<game3DataInterface>) : void {
      //加载音频
      data.map((r :game3DataInterface , i : number )=>{
        this.load.audio(r.id,r.audioKey);
      })
      this.load.start(); //preload自动运行，其他地方加载资源必须手动启动，不然加载失效
    }

    private createEmitter () : void {
      //创建粒子效果发射器
      this.particles = this.add.particles('particles');
      for(let i = 0 ; i < 2 ; i ++){
        this.emitters[i === 0 && 'red' || 'blue'] = this.particles.createEmitter({
          lifespan : 1000,
          speed : { min: 300, max: 400},
          alpha : {start: 0.7, end: 0 },
          scale: { start: 0.7, end: 0 },
          rotate: { start: 0, end: 360, ease: 'Power2' },
          blendMode: 'ADD',
          on : false
        })
      }
    }

    private playMusic (sourceKey : string) : void {
      //播放音频
      let mp3 : Phaser.Sound.BaseSound = this.sound.add(sourceKey);
      mp3.play();
    }

    private dragStartHandle (...args) : void{
      //拖拽开始
      //@ts-ignore
      this.scene.dragX = args[0].worldX;
      this.dragTimer = Date.now();
      //@ts-ignore
      this.scene.dragStartHandle.objX = this.scene.keySpritesArr[0].x;
      initDragNum = 0;
    }

    private dragMoveHandle (...args) : void {
      //拖拽中
      //@ts-ignore
      let x : number = args[0].worldX - this.scene.dragX;
      //@ts-ignore
      this.scene.dragX = args[0].worldX;
      //@ts-ignore
      initDragNum += x ;
      //@ts-ignore
      if((initDragNum > 0 && initDragNum > 200) || (initDragNum < 0 && initDragNum < -200) ) return;
      //@ts-ignore
      this.scene.keySpritesArr.map((r : Phaser.GameObjects.Sprite,i : number)=>{
        r.x += x;
      });
      //@ts-ignore
      this.scene.textsArr.map((r : Phaser.GameObjects.Text,i : number)=>{
        r.x += x;
      })

      //@ts-ignore
      this.scene.outerKeyArr.map((r : Phaser.GameObjects.Sprite,i : number)=>{
        r.x += x;
      })
      //@ts-ignore
      this.scene.imgsArr.map((r : Phaser.GameObjects.Image,i : number)=>{
        r.x += x;
      })
    }

    private animateAfterDragHandle (isLeft : boolean,dragNum : number) : void{
      //左滑右画切换音标数据
      isLeft ? (this.currentBookIndex ++ ) : (this.currentBookIndex -- );
      if(this.currentBookIndex >= this.bookMenu.length){
        this.currentBookIndex = 0;
      }else if(this.currentBookIndex < 0 ){
        this.currentBookIndex = this.bookMenu.length - 1;
      }
      this.flag = 0;
      this.keySpritesArr.map((r,i)=>{
        this.itemAnimateHandle(r,isLeft && r.x - initW || r.x + initW,dragNum,isLeft,i);
      });

      this.textsArr.map((r,i)=>{
        this.itemAnimateHandle(r,isLeft && r.x - initW || r.x + initW,dragNum,isLeft);
      })

      this.imgsArr.map((r,i)=>{
        this.itemAnimateHandle(r,isLeft && r.x - initW || r.x + initW,dragNum,isLeft);
      })
    }

    private switchBookAndUnitHandle (isLeft : boolean) : void{
      //切换数据操作
      this.tweens.add({
        targets : [this.redSprite,this.redText,this.blueSprite,this.blueText],
        alpha : 0,
        ease: 'Sine.easeInOut',
        duration : 500
      });
      get(apiPath.getUnitDetail + '?'+ makeParams({
        bookId : this.bookMenu[this.currentBookIndex].bookId,
        unitId : this.bookMenu[this.currentBookIndex].unitId
      })).then((res)=>{
        res && res.code === '0000' && (this.ccData = res.result);
        this.drawBottomKeys(isLeft);
        this.animsLayoutHandle(isLeft);
        this.loadMusic(this.ccData);
        // this.titleObj.setText(this.bookMenu[this.currentBookIndex].name);
      })
    }

    private itemAnimateHandle (item : object , x : number , dragNum : number,  isLeft : boolean , index? : number ) : void{
      //切换音标动画
      this.tweens.add({
        targets : item,
        x : x,
        ease: 'Sine.easeInOut',
        duration: 500,
        onComplete : ()=>{
          //@ts-ignore
          item.destroy();
          if((++this.flag) >= (this.keySpritesArr.length + this.imgsArr.length + this.textsArr.length )){
            this.arrowArr.map((r,i)=>{
              r.destroy();
            });
            this.arrowArr.length = 0 ;
            this.switchBookAndUnitHandle(isLeft);
            this.keySpritesArr.length = 0;
            this.imgsArr.length = 0;
            this.textsArr.length = 0;
          }
        }
        // onComplete : ()=>{
        //   //@ts-ignore
        //   x < 0 && (item.x = item.x + (W * 2) - dragNum);
        //   //@ts-ignore
        //   x > 0 && (item.x = item.x - (W * 2) - dragNum); 

        //   this.tweens.add({
        //     targets : item,
        //     //@ts-ignore
        //     x : index === 0 ? 0 : x < 0 && item.x - W || item.x + innerWidth,
        //     ease: 'Sine.easeInOut',
        //     duration : 500
        //   })
        // }
      });
      
    }

    private getBookMenu () : void {
      get(apiPath.getBookMenu).then((res)=>{
        let num : number = -1 ;
        res && res.code === '0000' && res.result.map((r,i)=>{
          r.unitVOs && r.unitVOs.map((r2,i2)=>{
            num ++ ;
            //@ts-ignore
            this.currentParams.unitId === r2.unitId && (this.currentBookIndex = num);
            this.bookMenu.push({
              bookId : r.bookId,
              name : r.bookName + ' ' + r2.unitName,
              unitId : r2.unitId
            })
          })
        })
      })
    }



    private dragEndHandle (...args) : void {
      //拖拽结束
      //@ts-ignore
      initDragNum = 0;
      //@ts-ignore
      let isLeft : boolean = this.scene.keySpritesArr[0].x < this.scene.dragStartHandle.objX;
      //@ts-ignore
      let childX : number = this.scene.dragStartHandle.objX - this.scene.keySpritesArr[0].x;
      if(Math.abs(childX) > 100 && Date.now() - this.dragTimer > 200){
        //@ts-ignore
        this.scene.animateAfterDragHandle.call(this.scene,isLeft,Math.abs(childX));
      }else{
        //@ts-ignore
        this.scene.tweens.add({
          //@ts-ignore
          targets : this.scene.keySpritesArr.concat(this.scene.textsArr,this.scene.imgsArr,this.scene.outerKeyArr),
          x :`+=${childX}`,
          ease: 'Sine.easeInOut',
          duration: 300
        })
      }
    }

    private boom (key : string) : void {
      //触发效果
      let emitter : Phaser.GameObjects.Particles.ParticleEmitter = this.emitters[key];
      emitter.explode(40,
        key === 'red' && (this.redSprite.x ) || (this.blueSprite.x), 
        key === 'red' && (this.redSprite.y ) || (this.blueSprite.y));
      if(key === 'red'){
        this.redSprite.alpha = 1;
        this.redText.alpha = 1;
        this.blueText.alpha = 0;
        this.blueSprite.alpha = 0;
        this.noteArr.map((r,i)=>{
          r.alpha = 1 ;
        });
      }else{
        this.redSprite.alpha = 0;
        this.blueSprite.alpha = 1;
        this.redText.alpha = 0;
        this.blueText.alpha = 1;
        this.noteArr.map((r,i)=>{
          r.alpha = 1 ;
        });
      }
      //@ts-ignore
      if(this.boom.lock) return;
      //@ts-ignore
      this.boom.lock = true;
      //抖动效果
      this.tweens.add({
        targets : key === 'red' && [this.redText ] || [this.blueText],
        scaleX : 0.6,
        scaleY : 0.6,
        ease: 'Sine.easeInOut',
        duration: 100,
        yoyo: true,
        onComplete : ()=>{
          //@ts-ignore
          this.boom.lock = false;
        }
      });
      this.tweens.add({
        targets : key === 'red' && [this.redSprite ] || [this.blueSprite],
        displayWidth : this.redSprite.displayWidth * 0.6,
        displayHeight : this.redSprite.displayHeight * 0.6,
        ease: 'Sine.easeInOut',
        duration: 100,
        yoyo: true,
        onComplete : ()=>{
          //@ts-ignore
          this.boom.lock = false;
        }
      });
      //@ts-ignore
      !this.boom.noteAnims && (this.boom.noteAnims = this.tweens.add({
        targets : [this.noteArr[0],this.noteArr[2]],
        ease: 'Sine.easeInOut',
        y : '-=13',
        duration: 1000,
        yoyo: true,
        repeat : -1
      }));
      //@ts-ignore
      !this.boom.noteAnims2 && (this.boom.noteAnims2 = this.tweens.add({
        targets : [this.noteArr[1],this.noteArr[3]],
        ease: 'Sine.easeInOut',
        y : '+=13',
        duration: 1000,
        yoyo: true,
        repeat : -1
      }));
    }

    private pointerDownHandle (...args) : void{
      //鼠标按下事件
      this.timer = Date.now();
      //@ts-ignore
      this.scene.createGuideAnims && this.scene.createGuideAnims.hideHandle();
      //@ts-ignore
      this.scene.createGuideAnims && (this.scene.createGuideAnims = null); 
    }
    
    private pointeUpHandle (...args) : void{
      //@ts-ignore
      if(Date.now() - this.timer < 200){
        //@ts-ignore
        this.getData('vowelConsonant') === '元音' ? this.anims.play('redAnims',false) : this.anims.play('blueAnims',false);

        try{
          //@ts-ignore
          this.scene.playMusic(this.getData('id'));
        }catch(e){
          console.log(e);
        }finally{
          //@ts-ignore
          this.getData('vowelConsonant') === '元音' ? this.scene.setWords('red',this.getData('name')) : this.scene.setWords('blue',this.getData('name'));

          //@ts-ignore
          this.getData('vowelConsonant') === '元音' ? this.scene.boom('red') : this.scene.boom('blue');
        }
        //@ts-ignore
        // if(this.scene.show.some((r,i)=> !r)){
        //   //如果都已经显示出来就不必再调用此函数
        // }
        //@ts-ignore
        //index < this.scene.middle ? (!this.scene.show[1] && this.scene.showWordsHandle('red')) : (!this.scene.show[0] && this.scene.showWordsHandle('blue'));
      }
    }

    private createAnims () : void {
      //创建动画
      this.anims.create({
        key : 'redAnims',
        frames : this.anims.generateFrameNumbers('keys',{start : 0 , end : 1}),
        frameRate : 12,
        repeat : 0,
        yoyo : true
      });

      this.anims.create({
        key : 'blueAnims',
        frames : this.anims.generateFrameNumbers('keys',{start: 0 , end : 1}),
        frameRate : 12,
        repeat : 0,
        yoyo : true
      })
    }

    private drawBottomKeys (isLeft : boolean = false) : void {
      //渲染键盘
      let dataArr : Array<game3DataInterface> = this.ccData;
      for(let i = 0 ; i < dataArr.length ; i++){
        if(dataArr[i].vowelConsonant === '辅音'){
          this.middle = i;
          break;
        }
      }
      // dataArr.length = 5; //test
      let isRenderCenter : boolean = dataArr.length < 8;
      let imgKey : number = 0;
      let arrCenterInx : number = Math.ceil((9 - dataArr.length) / 2);
      for ( let i = 0 ; i < (isRenderCenter && 9 || 10) ; i ++){
        let sprite : Phaser.GameObjects.Sprite = this.add.sprite(i === 0 ? (isLeft && ( isRenderCenter &&  initW -30 || initW - 92) || ( isRenderCenter &&  -initW -30 || -initW - 92)) : this.leftSpriteX + (110 + 12),319,'keys').setOrigin(0).setInteractive({
          draggable : true
        }).setDisplaySize(110,219);
        //(isLeft && W || -W)  (isRenderCenter && -30 || -92)
        this.leftSpriteX = sprite.x;
        if((!isRenderCenter &&  i >= 1) || (isRenderCenter && i >= arrCenterInx)){
          let y = isRenderCenter ? i - arrCenterInx : i - 1;
          if(y < dataArr.length){
            let text : Phaser.GameObjects.Text = this.add.text(sprite.x + 55,sprite.y + 150 ,dataArr[y].name,{
              fontSize: "36px",
              fontFamily:"Arial Rounded MT Bold",
              fill : y < this.middle && '#F2592A' || '#00AE97',
              bold : true
            }).setOrigin(0.5,0).setDepth(1000).setAlpha(0);
            this.textsArr.push(text);
            sprite.on('pointerdown',this.pointerDownHandle.bind(sprite));
            sprite.on('pointerup',this.pointeUpHandle.bind(sprite));
            sprite.setData('vowelConsonant',dataArr[y].vowelConsonant);
            sprite.setData('name',dataArr[y].name);
            sprite.setData('id',dataArr[y].id);
          }
        }
        sprite.on('dragstart',this.dragStartHandle.bind(sprite));
        sprite.on('drag',this.dragMoveHandle.bind(sprite));
        sprite.on('dragend',this.dragEndHandle.bind(sprite));
        this.keySpritesArr.push(sprite);
        if(
          (isRenderCenter && (i === 2 || i === 5 || i === 8)) ||
          (!isRenderCenter && (i === 2 || i ===6 || i === 9 ))
        ){
          //间隔渲染彩键
          continue;
        }
        //渲染彩键
        imgKey = (imgKey + 1 > 5 ? 1 : imgKey + 1);
        let img : Phaser.GameObjects.Image = this.add.image( sprite.x + 116.5,sprite.y - 11,'icons',`key${imgKey}.png`).setDepth(100).setOrigin(.5,0).setDisplaySize(67,119);
        this.imgsArr.push(img);
      }
      this.outerKeyArr.push(
        this.add.sprite(-262 ,this.keySpritesArr[0].y,'keys').setOrigin(0).setDisplaySize(110,219),
        this.add.sprite( 1176  ,this.keySpritesArr[0].y,'keys').setOrigin(0).setDisplaySize(110,219),
      )
      this.arrowArr.push(this.add.image(35.5,480,'leftIcon').setDisplaySize(35.7,22.4));
      this.arrowArr.push(this.add.image(W - 36.5,480,'rightIcon').setDisplaySize(35.7,22.4));
    }

    // private drawBottomKeys(isLeft : boolean = false) : void{
    //   //渲染键盘
    //   let dataArr : Array<game3DataInterface> = this.ccData;
    //   for(let i = 0 ; i < dataArr.length ; i++){
    //     if(dataArr[i].vowelConsonant === '辅音'){
    //       this.middle = i;
    //       break;
    //     }
    //   }
    //   let imgKey : number = 0;
    //   let leftDistance : number = (W - (110 * dataArr.length + 5 * (dataArr.length - 1 ))) / 2 ; //计算如果要居中，第一个键盘的x值
    //   let itemWidth : number = (W - (5 * (dataArr.length - 1))) / dataArr.length;
    //   for ( let i = 0 ; i < dataArr.length ; i ++){
    //     //渲染白键
    //     let sprite : Phaser.GameObjects.Sprite = this.add.sprite(i === 0 ? (isLeft && W || -W) : this.leftSpriteX + (itemWidth + 5),H - 240,'keys',0).setOrigin(0).setInteractive({
    //       draggable : true
    //     });
    //     sprite.scaleX = itemWidth / sprite.width;
    //     this.leftSpriteX = sprite.x;
    //     sprite.setData('index',i); //记住是按的哪个键盘，可以拿到相应的音标
    //     //渲染音标字符
    //     let text : Phaser.GameObjects.Text = this.add.text(sprite.x + 30,sprite.y + sprite.height - 75,this.setWordsTrim(dataArr[i].name),{
    //       fontSize : 40,
    //       font: 'bold 45px Arial Rounded MT',
    //       fill : i < this.middle && '#D25F5F' || '#65A5EF',
    //       bold : true
    //     }).setOrigin(0.5,0);
    //     text.x = sprite.x +  ((sprite.width * sprite.scaleX) / 2);
    //     this.keySpritesArr.push(sprite);
    //     this.textsArr.push(text);
    //     sprite.on('dragstart',this.dragStartHandle.bind(sprite));
    //     sprite.on('drag',this.dragMoveHandle.bind(sprite));
    //     sprite.on('dragend',this.dragEndHandle.bind(sprite));
    //     sprite.on('pointerdown',this.pointerDownHandle.bind(sprite));
    //     sprite.on('pointerup',this.pointeUpHandle.bind(sprite));
    //     if(i % 3 === 2 || ( (i % 3 === 0 || i % 3 === 1) && i === (dataArr.length - 1))){
    //       //间隔渲染彩键
    //       continue;
    //     }
    //     //渲染彩键
    //     imgKey = (imgKey + 1 > 7 ? 1 : imgKey + 1);
    //     let img : Phaser.GameObjects.Image = this.add.image( sprite.x + (110 * sprite.scaleX),sprite.y - 11,'icons',`ImgPiano0${imgKey}.png`).setDepth(100).setOrigin(.5,0);
    //     this.imgsArr.push(img);
    //   }
    // }

    private animsLayoutHandle (isLeft : boolean = false) : void {
      this.outerKeyArr.length > 2 && this.time.addEvent({
        delay : 200,
        callback : ()=>{
          this.outerKeyArr[0].destroy();
          this.outerKeyArr[1].destroy();
          this.outerKeyArr.splice(0,2);
        }
      })
      this.tweens.add({
        targets : [...this.keySpritesArr,...this.imgsArr,...this.textsArr],
        x : `+=${isLeft && -initW || initW}`,
        ease: 'Sine.easeInOut',
        duration: 800,
        onComplete : ()=>{
          this.tweens.add({
            targets : this.textsArr,
            alpha : 1,
            ease: 'Sine.easeInOut',
            duration: 500,
            onComplete : ()=>{
              //@ts-ignore
              !this.animsLayoutHandle.lock && (this.createGuideAnims = new CreateGuideAnims(this,500, H - 100));
              //@ts-ignore
              this.animsLayoutHandle.lock = true;
            }
          })
        }
      })
    }

    private showWordsHandle (flag : string) : void {
      //先是音标字符
      this.tweens.add({
        targets : flag === 'red' && this.redSprite || this.blueSprite,
        scaleX : 1.3,
        scaleY : 1.3,
        alpha : 1,
        ease : 'Sine.easeInOut',
        duration : 1000,
      })

      this.tweens.add({
        targets : flag === 'red' && this.redText || this.blueText,
        alpha : 1,
        scaleX : 1.3,
        scaleY : 1.3,
        ease : 'Sine.easeInOut',
        duration : 1000,
        onComplete : ()=>{
          this.show[flag === 'red' && 1 || 0 ] = true;
        }
      })
    }

    private setWordsTrim (word : string) : string {
      let str : string = word.match(/\/(.+)\//) && word.match(/\/(.+)\//).length > 1 && word.match(/\/(.+)\//)[1];
      return `/ ${str} /`;
    }

    private setWords (flag : string, text : string) : void {
        //设置字符
        if(flag === 'red'){
          this.redText.setText(this.setWordsTrim(text));
          this.redText.x = this.redSprite.x ;
        }else{
          this.blueText.setText(this.setWordsTrim(text));
          this.blueText.x = this.blueSprite.x ;
        };

    } 

    private drawTopWord () : void {
      //渲染音标word气泡
      this.redSprite = this.add.sprite(W / 2,H / 2 - 150,'icons','bg_word_red.png').setOrigin(0.5).setAlpha(0).setScale(1.4);
      this.blueSprite = this.add.sprite(W / 2,H / 2 - 150,'icons','bg_word_blue.png').setOrigin(0.5).setAlpha(0).setScale(1.4);
      this.redText = this.add.text(this.redSprite.x,this.redSprite.y,'',{
          font: 'bold 65px Arial Rounded MT',
          fill : '#fff',
      }).setAlpha(0).setOrigin(0.5);
      this. blueText = this.add.text(this.blueSprite.x,this.blueSprite.y,'',{
        font: 'bold 65px Arial Rounded MT',
        fill : '#fff',
      }).setAlpha(0).setOrigin(0.5);

      // this.title &&  (this.titleObj = this.add.text(20,20,this.title,{
      //   font: 'bold 20px Arial Rounded MT',
      //   fill : '#fff',
      // }));
    }
  };
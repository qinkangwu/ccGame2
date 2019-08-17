/**
 * @param w canvas's width
 * @param h canvas's height
 */
export default function resize(w:number,h:number){
    var content: HTMLElement = document.querySelector("#content");
    content.style.backgroundColor = "#000000";
    var canvas = document.querySelector("canvas");
    (<Phaser.Scene>this).scale.resize(w, h);
    (<Phaser.Scene>this).scale.scaleMode = Phaser.Scale.NONE;
    canvas.setAttribute("style", `
      width: 100% !important;
      height: 100% !important;
      object-fit: contain;
      object-position: center;
    `);
}

import "phaser";

/**
 * @param w canvas's width
 * @param h canvas's height
 */
export var resize = function (w,h){
    var content:HTMLElement = document.querySelector("#content");
    content.style.backgroundColor = "#000000";
    var canvas = document.querySelector("canvas");
    deleteOther();
}

function deleteOther(){
  let hash = window.location.hash;
  if(hash==="#/game5"){
    return false;
  } 
  let dontRemove = document.querySelector(".dontRemove");
  dontRemove.innerHTML = "";
}

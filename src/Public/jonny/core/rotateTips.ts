/**
 * 执行 rotateTips.init();
 */
export var rotateTips = {
    orientationState:"",
    init: function () {
        const URL = window.location.href;
        const W = window.innerWidth;
        const H = window.innerHeight;
        this.orientationState = W < H ? "portrait" : "landscape";
        window.addEventListener("orientationchange",orientationchangeHandler.bind(this));
        function orientationchangeHandler(){
            console.log(this.orientationState);
            if (this.orientationState == 'portrait') {
                this.landscape();
            } else if (this.orientationState == 'landscape') {
                this.portrait();
            }
        }

        if(this.orientationState==="portrait"){
            this.portrait();
        }
    },
    createElement:function (tag,id="",className="",src="",innerHTML=""){
        let element = document.createElement(tag);
        element.id = id;
        element.className = className;
        element.innerHTML = innerHTML;
        if(tag==="img"){
            element.src = src;
        }
        return element;
    },
    portrait: function () {
        this.orientationState = "portrait";
        var container = document.querySelector("#content");
        var rotateTips = this.createElement("div","rotateTips");
        var img = this.createElement("img","",'rotateTipsImg','assets/commonUI/icon_rotate.png');
        var tipsText = this.createElement("div","","rotateTipsText","",`请旋转为横屏<br/>注意：请勿锁住屏幕方向`);
        rotateTips.appendChild(img);
        rotateTips.appendChild(tipsText);
        container.appendChild(rotateTips);
    },
    landscape: function () {
        this.orientationState = "landscape";
        console.log(this.orientationState);
        let rotateTips = document.querySelector("#rotateTips");
        document.querySelector("#content").removeChild(rotateTips);
    }
}


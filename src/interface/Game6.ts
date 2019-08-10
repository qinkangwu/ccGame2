export class Game6DataItem{
    audioKey : string ;
    id : string ;
    name : string ;
    phoneticSymbols : Array<Game6PhoneticSymbol>
}

/* 音标组件 */
export class Game6PhoneticSymbol {
    audioKey : string ;
    id : string ;
    name : string ;
    vowelConsonant : string ;    //元音－辅音
    uselessPhoneticSymbols? : any;   //无用的音标组件
}

/* 单词组件 */
export interface game6WordItem {
    id : string ; 
    name : string ;
    audioKey : string;
}

/* 资源 */
export interface game6asset{
    key:string;
    url:string;
}

/* 自定义的简洁矩形*/
export interface Rectangular{
    x:number;
    y:number;
    width:number;
    height:number;
}

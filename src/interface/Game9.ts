export class Game9DataItem{
    audioKey : string ;
    id : string ;
    name : string ;
    phoneticSymbols : Array<Game9PhoneticSymbol>;    
    uselessPhoneticSymbols:Array<Game9PhoneticSymbol>;  
}

/* 音标组件 */
export class Game9PhoneticSymbol {
    audioKey : string ;
    id : string ;
    name : string ;
    vowelConsonant : string ;    //元音－辅音
    uselessPhoneticSymbols? : any;   //无用的音标组件
}

/* 资源 */
export interface Game9asset{
    key:string;
    url:string;
}



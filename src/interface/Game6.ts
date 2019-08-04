export interface game6DataItem{
    audioKey : string ;
    id : string ;
    name : string ;
    phoneticSymbols : Array<game6PhoneticSymbol>
}

/* 音标组件 */
export interface game6PhoneticSymbol {
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
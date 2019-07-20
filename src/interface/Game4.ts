export interface game4DataItem{
    audioKey : string ;
    id : string ;
    name : string ;
    phoneticSymbols : Array<game4PhoneticSymbol>
}

export interface game4PhoneticSymbol {
    audioKey : string ;
    id : string ;
    name : string ;
    vowelConsonant : string ;
    uselessPhoneticSymbols? : any;
}

export interface game4WordItem {
    id : string ; 
    name : string ;
    audioKey : string;
}
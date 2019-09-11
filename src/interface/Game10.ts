export interface item { 
    audioKey : string ;
    id : string ;
    name : string ;
    phoneticSymbols : phoneticSymbolsItem[] ;
    uselessPhoneticSymbols : uselessPhoneticSymbolsItem[];
    img : string ;
    videoId : string ;
  }
  
  interface phoneticSymbolsItem {
    audioKey: string;
    id: string ;
    name: string ;
    vowelConsonant: string ;
  }
  
  interface uselessPhoneticSymbolsItem{
    audioKey: string ;
    id: string ;
    name: string ;
    vowelConsonant: string ;
  }
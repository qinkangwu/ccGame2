export interface Item {
    wordTypeCode : string ;
    wordTypeName : string ;
    wordClassifications : WordClassifications[] ;
}

interface WordClassifications {
    audioKey : string;
    id : string ;
    img : string ;
    name : string ;
    videoId : string ; 
    wordType : string ;
}
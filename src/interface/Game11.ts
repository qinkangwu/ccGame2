/* 资源 */
export interface Assets {
    key: string;
    url: string;
}

export interface GetSentenceData {
    "id": string;
    "sentenceName": string;
    "audioKey": string;
    "videoId": string;
    "imgKey": string;
    "vocabularies": GetSentenceDataVocabulary[]
}


export interface GetSentenceDataVocabulary {
    "id": string;
    "name": string;
    "audioKey": string;
    "videoId": string;
    "img": string,
    "syllable": string;
    "phoneticSymbol": string;
}

export interface Vocabulary {
    "name": string;
    "audioKey": string;
}


export interface Game11DataItem {
    "sentenceName": string;
    "audioKey": string;
    "vocabularies": Vocabulary[]
}

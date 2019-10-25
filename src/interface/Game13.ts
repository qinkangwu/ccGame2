/* 资源 */
export interface Assets {
    key: string;
    url: string;
}

export interface Answer {
    answercontent:string;
    isright:string;
}

export interface QueryTopic {
    questioncontent:string;
    answers:Answer[];
}



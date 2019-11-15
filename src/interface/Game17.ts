export interface Assets {
    key: string;
    url: string;
}

export interface QueryTopic {
    questioncontent:string;
    answers:AnswerConfig[];
}

export interface AnswerConfig{
    position:{
        x:number;
        y:number;
    },
    bgTexture:string;
    answercontent:string;
    serial:{
        value:string;
        position:{
            x:number;
            y:number;
        }
    };
    isright:string;
}

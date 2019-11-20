export interface Assets {
    key: string;
    url: string;
}

export interface QueryTopic {
    questionContent:string;
    answers:AnswerConfig[];
}

export interface AnswerConfig{
    position:{
        x:number;
        y:number;
    },
    bgTexture:string;
    answerContent:string;
    serial:{
        value:string;
        position:{
            x:number;
            y:number;
        }
    };
    isRight:number;
}

export interface Assets {
    key: string;
    url: string;
}

// export interface Answer {
//     answercontent:string;
//     isright:string;
// }

export interface QueryTopic {
    id:string,
    grade:string;
    question:string;
    answers:string[];
    right:string;
}
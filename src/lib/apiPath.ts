export default {
    getUnitDetail : 'https://ccgame.civaonline.cn/game/getplayPianoSymbolByBookUnitId',
    getBookMenu : 'https://ccgame.civaonline.cn/book/bookUnitList/2',
    getWordsData : 'https://ccgame.civaonline.cn/game/getSugarGourdWordByBookUnitId?bookId=476351b78d8111e9b8a3d481d7d1b146&unitId=02decbcb988511e9b6d5d481d7d1b146',
    getDrawingBoardData : 'https://ccgame.civaonline.cn/game/getDrawingBoardByBookUnitId?bookId=62e346de8d8118e9b8a3d481d7d1b1rrr&unitId=eec17898988511e9b6d5d481d7d1b141',
    postAudio:"https://www.jonnypeng.com:4012/postAudio",  //测试用
    uploadRecord : 'https://ccgame.civaonline.cn/voice/voiceToText',
    getGame7Data : 'https://ccgame.civaonline.cn/game/getSugarGourdWordByBookUnitId?bookId=62e346de8d8118e9b8a3d481d7d1b1rrr&unitId=eec17898988511e9b6d5d481d7d1b142',
    getGame8Data : 'https://ccgame.civaonline.cn/game/getSugarGourdWordByBookUnitId?bookId=476351b78d8111e9b8a3d481d7d1b146&unitId=02decbcb988511e9b6d5d481d7d1b146',
    getGame10Data : 'https://ccgame.civaonline.cn/game/getDrawingBoardByBookUnitId?bookId=476351b78d8111e9b8a3d481d7d1b146&unitId=02decbcb988511e9b6d5d481d7d1b146',
    picCompare : 'https://ccgame.civaonline.cn/voice/pictureCompare',
    getSentenceData:"https://ccgame.civaonline.cn/game/sentence/getSentenceData?bookId=476351b78d8111e9b8a3d481d7d1b146&unitId=02decbcb988511e9b6d5d481d7d1b146&nsukey=zIDDv%2Fglb%2BPJIkf2ZZ6Mri%2BtDpXjPWAt63wNX5JQvrbnGK%2FyhsMaSUvABsIpdQ1xLh9zXtC9H3RBKn5hocBo%2BE5jsoqbMgNtA4rCyzlU883nctp4bq5J%2FrK9vg%2FsyqaeGsWPTRkgy0HPsh1271Xoyef%2BOMLf8WJrYMvNR9DxIKnlHW4F3s49rARqGEHbbHuBCw%2BteFdU5T3tw8IxL4%2FGLw%3D%3D",
    getWordClass : 'https://ccgame.civaonline.cn/game/wordclassification/getWordClassificationByBookUnitId?bookId=62e346de8d8118e9b8a3d481d7d1b1rrt&unitId=eec17898988511e9b6d5d481d7d1b147',
    /**
     * 图文匹配判断题
     * @param bookId 62e346de8d8118e9b8a3d481d7d1b1rrt
     * @param unitId eec17898988511e9b6d5d485d7d1b147
     */
    getWordConfusionList:'https://ccgame.civaonline.cn/game/wordConfusion/getWordConfusionList?bookId=62e346de8d8118e9b8a3d481d7d1b1rrt&unitId=eec17898988511e9b6d5d485d7d1b147',

    /**
     * 填空类的选择题
     * @param bookId c737587a-34ce-47d5-b5c0-6db031712c07
     * @param unitId aaeacf2b-bc61-4135-a976-aa1b6815eeaf
     */
    getQuestionData:'https://ccgame.civaonline.cn/game/question/getQuestionData?bookId=c737587a-34ce-47d5-b5c0-6db031712c07&unitId=aaeacf2b-bc61-4135-a976-aa1b6815eeaf'
}
export default {
    getUnitDetail : 'http://121.40.140.54:8188/game/getplayPianoSymbolByBookUnitId',   //单元细节
    getBookMenu : 'http://121.40.140.54:8188/book/bookUnitList/2',      //书记目录
    getWordsData : 'http://121.40.140.54:8188/game/getSugarGourdWordByBookUnitId?bookId=476351b78d8111e9b8a3d481d7d1b146&unitId=02decbcb988511e9b6d5d481d7d1b146',    //Game6data 单词、单词读音、音标、音标读音、混淆音标及读音,音标数量最大值为3，最小值为2
    getDrawingBoardData : 'http://121.40.140.54:8188/game/getDrawingBoardByBookUnitId?bookId=62e346de8d8118e9b8a3d481d7d1b1rrr&unitId=eec17898988511e9b6d5d481d7d1b141',   //字母数据
    uploadRecord : 'https://121.40.140.54:8188/voice/voiceToText',          //上传音频=>音频识别
    getGame7Data : 'https://121.40.140.54:8188/game/getSugarGourdWordByBookUnitId?bookId=62e346de8d8118e9b8a3d481d7d1b1rrr&unitId=eec17898988511e9b6d5d481d7d1b142'  //单词、单词读音
}
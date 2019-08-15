export interface config {
    recordStartCallback : Function; //录音开始回调函数
    recordEndCallback : Function; //录音结束回调函数
    playRecordCallback : Function; //播放录音
    recordScope? : object;  //录音回调this上下文
    bgm : object; //背景音乐
    playBtnCallback : Function; //播放音频按钮回调
}
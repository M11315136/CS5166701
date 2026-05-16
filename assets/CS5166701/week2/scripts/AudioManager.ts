import { resources, AudioClip, AudioSource, director } from 'cc';

export class AudioManager {
    private static _instance: AudioManager = null!;
    private _audioSource: AudioSource = null!;

    public static get instance() {
        if (!this._instance) {
            this._instance = new AudioManager();
            this._instance.init();
        }
        return this._instance;
    }

    private init() {
        // 常駐節點：在常駐場景中建立一個全域 AudioSource
        const audioNode = director.getScene()?.getChildByName('AudioManager');

        this._audioSource = audioNode.getComponent(AudioSource) || audioNode.addComponent(AudioSource);
    }

    /**
     * 動態載入並播放音效
     * @param path resources 底下的相對路徑，不需要副檔名
     */
    public playEffect(path: string, loop: boolean = false) {
        resources.load(`audio/${path}`, AudioClip, (err, clip) => {
            if (err) {
                console.error('音效載入失敗:', err);
                return;
            }
            // 載入成功後播放
            if(!loop){
            this._audioSource.playOneShot(clip,0.3);
            }else{
                this._audioSource.clip = clip;
                this._audioSource.loop = true;
                this._audioSource.play();
            }
        });
    }

    public stopEffect(path: string) {
        resources.load(`audio/${path}`, AudioClip, (err, clip) => {
            this._audioSource.stop();
        });
    }
}
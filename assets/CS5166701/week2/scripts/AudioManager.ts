import { resources, AudioClip, AudioSource, director, Node } from "cc";

export class AudioManager {
  private static _instance: AudioManager | null = null;

  private _audioSource: AudioSource | null = null;

  // 音效快取
  private _cache: Map<string, AudioClip> = new Map();

  public static get instance() {
    if (!this._instance) {
      this._instance = new AudioManager();
      this._instance.init();
    }

    return this._instance;
  }

  private init() {
    let audioNode = director.getScene()?.getChildByName("AudioManager");

    if (!audioNode) {
      audioNode = new Node("AudioManager");

      director.getScene()?.addChild(audioNode);

      director.addPersistRootNode(audioNode);
    }

    this._audioSource =
      audioNode.getComponent(AudioSource) ||
      audioNode.addComponent(AudioSource);
  }

  public playEffect(path: string) {
    const fullPath = `audio/${path}`;
    if (this._cache.has(fullPath)) {
      const clip = this._cache.get(fullPath)!;

      this.playClip(clip);

      return;
    }

    resources.load(fullPath, AudioClip, (err, clip) => {
      if (err || !clip) {
        console.error("音效載入失敗:", err);
        return;
      }
      clip.addRef();
      this._cache.set(fullPath, clip);

      this.playClip(clip);
    });
  }

  private playClip(clip: AudioClip) {
    if (!this._audioSource) {
      return;
    }


      this._audioSource.playOneShot(clip, 0.3);

  }

  public stopEffect() {
    this._audioSource?.stop();
  }

  public preload(path: string) {
    const fullPath = `audio/${path}`;

    // 已存在就不重複 load
    if (this._cache.has(fullPath)) {
      return;
    }

    resources.load(fullPath, AudioClip, (err, clip) => {
      if (err || !clip) {
        console.error("預載失敗:", err);
        return;
      }

      clip.addRef();

      this._cache.set(fullPath, clip);
    });
  }
}

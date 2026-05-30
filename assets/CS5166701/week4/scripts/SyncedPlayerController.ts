import { _decorator } from "cc";
import { PlayerController } from "../../week2/scripts/Controller/PlayerController";
import { EntityState } from "../../week2/scripts/Controller/EntityController";
import { NetworkManager } from "./NetworkManager";
import type { AnimState } from "./NetworkTypes";

const { ccclass, property } = _decorator;

/**
 * 繼承 week2 的 PlayerController，在每次 update 後將本地玩家的
 * 位置、朝向、動畫狀態透過 NetworkManager 發送給伺服器（再廣播給對方）。
 *
 * Prefab 掛載方式：替換原本的 PlayerController，改掛此腳本。
 * 同場景中需要有一個掛了 NetworkManager 的節點。
 */
@ccclass("SyncedPlayerController")
export class SyncedPlayerController extends PlayerController {
  @property(NetworkManager)
  public readonly networkManager: NetworkManager = null;

  /** 每隔幾幀發送一次狀態（降低網路流量）；1 = 每幀都送 */
  @property({ tooltip: "每隔幾幀送一次狀態，建議 2~3" })
  public readonly sendInterval: number = 2;

  private _frameCount: number = 0;

  protected update(dt: number): void {
    super.update(dt);

    this._frameCount++;
    if (this._frameCount < this.sendInterval) return;
    this._frameCount = 0;

    this._broadcastState();
  }

  private _broadcastState(): void {
    if (!this.networkManager || !this.target) return;

    const pos = this.target.getPosition();
    const scaleX = this.target.getScale().x;
    const animState: AnimState =
      this._state === EntityState.Idle
        ? "idle"
        : this._state === EntityState.Run
          ? "run"
          : "jump";

    this.networkManager.sendPlayerState(pos.x, pos.y, scaleX, animState);
  }
}

import { _decorator } from "cc";
import { PlayerController } from "../../week2/scripts/Controller/PlayerController";
import { EntityState } from "../../week2/scripts/Controller/EntityController";
import { NetworkManager } from "./NetworkManager";
import type { AnimState } from "./NetworkTypes";

const { ccclass, property } = _decorator;

/**
 * 教學版複本
 * 來源檔案：assets/CS5166701/week4/scripts/SyncedPlayerController.ts
 * 起始位置：從 `class SyncedPlayerController` 開始
 *
 * 這個檔案原本負責把 week2 的玩家控制器改成「可同步版本」。
 *
 * 主要步驟：
 * 1. 繼承原本的 `PlayerController`，保留本地移動、跳躍與動畫控制。
 * 2. 每次 `update()` 後累加幀數，達到發送間隔時才送一次狀態。
 * 3. 從目前角色位置、縮放與動畫狀態組出封包。
 * 4. 交給 `NetworkManager` 發送到伺服器。
 *
 * 教學閱讀順序：
 * - 先看 `update()` 怎麼控制節流。
 * - 再看 `_broadcastState()` 怎麼把玩家狀態轉成網路資料。
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
    // 1. 先執行父類別 update，保留本地玩家操作與動畫。
    // 2. 累積幀數，避免每一幀都發送一次。
    // 3. 達到設定間隔後，再把玩家狀態送到伺服器。
  }

  private _broadcastState(): void {
    // 1. 讀取角色目前的位置與縮放。
    // 2. 把 EntityState 轉成網路用的 AnimState。
    // 3. 呼叫 NetworkManager 發送 player_state。
  }
}

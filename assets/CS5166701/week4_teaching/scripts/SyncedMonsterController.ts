import { _decorator } from "cc";
import { MonsterController } from "../../week2/scripts/Controller/MonsterController";
import { EntityState } from "../../week2/scripts/Controller/EntityController";
import { NetworkManager } from "./NetworkManager";
import type { MonsterStateMsg, AnimState } from "./NetworkTypes";

const { ccclass, property } = _decorator;

/**
 * 教學版複本
 * 來源檔案：assets/CS5166701/week4/scripts/SyncedMonsterController.ts
 * 起始位置：從 `class SyncedMonsterController` 開始
 *
 * 這個檔案原本負責把 week2 的怪物控制器改成「可同步版本」。
 *
 * 主要步驟：
 * 1. 繼承原本的 `MonsterController`，保留 AI 與碰撞邏輯。
 * 2. 透過 `NetworkManager` 接收伺服器通知，判斷自己是不是怪物主控端。
 * 3. 如果自己是主控端，就照常更新 AI，並定期把狀態送出去。
 * 4. 如果自己不是主控端，就停止 AI 更新，只套用遠端傳來的位置與動畫。
 *
 * 教學閱讀順序：
 * - 先看 `onLoad()` 怎麼把 callback 接到網路管理器。
 * - 再看 `update()` 如何用 `_isAuthority` 分流。
 * - 接著看 `_broadcastState()`，理解怪物狀態如何被封裝後送出。
 * - 最後看 `_applyRemoteState()`，理解非主控端如何跟著同步。
 */
@ccclass("SyncedMonsterController")
export class SyncedMonsterController extends MonsterController {
  @property(NetworkManager)
  public readonly networkManager: NetworkManager = null;

  /** 每隔幾幀送一次狀態（主控端才使用），建議 3~5 */
  @property({ tooltip: "每隔幾幀送一次怪物狀態（主控端才有效）" })
  public readonly sendInterval: number = 3;

  private _isAuthority: boolean = false;
  private _frameCount: number = 0;

  protected onLoad(): void {
    // 1. 先執行父類別的 onLoad，保留原本怪物控制器的初始化流程。
    // 2. 再把網路事件綁到自己的 callback。
  }

  protected update(dt: number): void {
    // 1. 如果自己不是主控端，就不要執行 AI 更新。
    // 2. 如果是主控端，先讓父類別跑怪物邏輯。
    // 3. 累積幀數，達到發送間隔時再把狀態送出去。
  }

  private _broadcastState(): void {
    // 1. 讀取怪物目前的位置與縮放。
    // 2. 把 EntityState 轉成網路用的 AnimState。
    // 3. 呼叫 NetworkManager 把怪物狀態送給伺服器。
  }

  private _applyRemoteState(msg: MonsterStateMsg): void {
    // 1. 如果自己是主控端，就不要被遠端資料覆蓋。
    // 2. 把遠端位置與縮放直接套到怪物節點。
    // 3. 依照遠端動畫狀態播放對應動畫。
  }
}

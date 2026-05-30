import { _decorator } from "cc";
import { MonsterController } from "../../week2/scripts/Controller/MonsterController";
import { EntityState } from "../../week2/scripts/Controller/EntityController";
import { NetworkManager } from "./NetworkManager";
import type { MonsterStateMsg, AnimState } from "./NetworkTypes";

const { ccclass, property } = _decorator;

/**
 * 繼承 week2 的 MonsterController，加入網路同步邏輯。
 *
 * 主控端（第一個連線的玩家）：
 *   - 正常執行 MonsterController AI 邏輯
 *   - 每 sendInterval 幀將怪物狀態發送給伺服器
 *
 * 非主控端：
 *   - 跳過 AI 更新，改由網路狀態驅動位置與動畫
 *   - 碰撞檢測仍有效（Collider2D 跟著 node 座標移動）
 *
 * Prefab 掛載方式：替換原本的 MonsterController，改掛此腳本。
 * 同場景中需要有一個掛了 NetworkManager 的節點。
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
    super.onLoad();

    if (!this.networkManager) return;

    // 伺服器通知是否為主控端
    this.networkManager.onMonsterAuthority = (isAuthority: boolean) => {
      this._isAuthority = isAuthority;
      console.log(`[Monster] 主控端：${isAuthority}`);
    };

    // 非主控端接收怪物狀態並套用
    this.networkManager.onMonsterState = (msg: MonsterStateMsg) => {
      this._applyRemoteState(msg);
    };
  }

  protected update(dt: number): void {
    // 非主控端：不執行 AI，位置由 _applyRemoteState 驅動
    if (!this._isAuthority) return;

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

    this.networkManager.sendMonsterState(pos.x, pos.y, scaleX, animState);
  }

  private _applyRemoteState(msg: MonsterStateMsg): void {
    if (!this.target || this._isAuthority) return;

    // 直接設定位置（MonsterController 本來就用 setPosition，不走 RigidBody）
    this.target.setPosition(msg.x, msg.y, this.target.position.z);
    this.target.setScale(msg.scaleX, 1, 1);

    // 播放正確動畫
    if (this._anim) {
      const animName =
        msg.animState === "idle"
          ? this.idleAnim
          : msg.animState === "run"
            ? this.walkAnim
            : this.jumpAnim;
      this._anim.play(animName);
    }
  }
}

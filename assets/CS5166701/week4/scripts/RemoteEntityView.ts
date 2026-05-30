import {
  _decorator,
  Component,
  Node,
  Animation,
  Prefab,
  Vec3,
  instantiate,
} from "cc";
import type { AnimState, PlayerStateMsg } from "./NetworkTypes";

const { ccclass, property } = _decorator;

interface RemotePlayerEntry {
  node: Node;
  anim: Animation | null;
  targetPos: Vec3;
  lastAnimState: AnimState;
}

/**
 * 遠端玩家管理元件，掛在場景中任意節點上（建議掛在 GameContext 同一節點）。
 *
 * 職責：
 *  - 持有 remotePlayerPrefab 和 remotePlayerParent
 *  - 每當收到新 clientId 的狀態時，自動 instantiate 一個幽靈節點
 *  - 每幀對所有幽靈做 Lerp 插值，讓移動平滑
 *  - 玩家離線時 destroy 對應節點
 *
 * GameContext 只需要拖入此 Component 即可，不需要自己管理 Prefab / Map。
 */
@ccclass("RemoteEntityView")
export class RemoteEntityView extends Component {
  /**
   * 幽靈 Prefab。
   * 根節點（或其子節點）需有 Animation 組件。
   * 位置與縮放套用在根節點上。
   */
  @property(Prefab)
  public readonly remotePlayerPrefab: Prefab = null;

  /**
   * 幽靈節點的父節點，建議與本地玩家同層。
   * 留空則以此 Component 所在節點為父。
   */
  @property(Node)
  public readonly remotePlayerParent: Node = null;

  @property({ group: "Animation Name" })
  public readonly idleAnim: string = "idle";

  @property({ group: "Animation Name" })
  public readonly walkAnim: string = "walk";

  @property({ group: "Animation Name" })
  public readonly jumpAnim: string = "jump";

  @property({ tooltip: "位置插值速度（0~1），越大越即時" })
  public lerpSpeed: number = 0.25;

  private _players: Map<string, RemotePlayerEntry> = new Map();

  // ── Update：每幀對所有幽靈做 Lerp ────────────────────────────────────────
  protected update(_dt: number): void {
    for (const entry of this._players.values()) {
      const cur = entry.node.getPosition();
      Vec3.lerp(cur, cur, entry.targetPos, this.lerpSpeed);
      entry.node.setPosition(cur);
    }
  }

  // ── 公開 API（由 GameContext 的 callback 呼叫）────────────────────────────

  /** 套用遠端玩家狀態；若該 clientId 尚未有幽靈則自動建立 */
  public applyState(clientId: string, msg: PlayerStateMsg): void {
    let entry = this._players.get(clientId);
    if (!entry) {
      entry = this._createGhost(clientId);
    }

    entry.targetPos.set(msg.x, msg.y, entry.node.position.z);
    entry.node.setScale(msg.scaleX, 1, 1);

    if (msg.animState !== entry.lastAnimState) {
      entry.lastAnimState = msg.animState;
      this._playAnim(entry.anim, msg.animState);
    }
  }

  /** 玩家離線時呼叫，銷毀對應幽靈節點 */
  public removePlayer(clientId: string): void {
    const entry = this._players.get(clientId);
    if (entry) {
      entry.node.destroy();
      this._players.delete(clientId);
      console.log(`[RemoteEntityView] 移除幽靈：${clientId}`);
    }
  }

  private _createGhost(clientId: string): RemotePlayerEntry {
    const parent = this.remotePlayerParent ?? this.node;
    const ghost = this.remotePlayerPrefab
      ? instantiate(this.remotePlayerPrefab)
      : new Node(`Ghost_${clientId}`);

    parent.addChild(ghost);

    // 在根節點或子節點中找 Animation（與 Prefab 結構無關）
    const anim =
      ghost.getComponent(Animation) ?? ghost.getComponentInChildren(Animation);

    const entry: RemotePlayerEntry = {
      node: ghost,
      anim,
      targetPos: ghost.position.clone(),
      lastAnimState: "idle",
    };

    this._players.set(clientId, entry);
    console.log(`[RemoteEntityView] 建立幽靈：${clientId}`);
    return entry;
  }

  private _playAnim(anim: Animation | null, animState: AnimState): void {
    if (!anim) return;
    const name =
      animState === "idle"
        ? this.idleAnim
        : animState === "run"
          ? this.walkAnim
          : this.jumpAnim;
    anim.play(name);
  }
}

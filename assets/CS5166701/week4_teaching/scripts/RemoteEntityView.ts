import {
  _decorator,
  Component,
  Node,
  Animation,
  Prefab,
  Vec3,
  instantiate,
} from "cc";
import { AnimState, PlayerStateMsg } from "./NetworkTypes";

const { ccclass, property } = _decorator;

interface RemotePlayerEntry {
  node: Node;
  anim: Animation | null;
  targetPos: Vec3;
  lastAnimState: AnimState;
}

/**
 * 教學版複本
 * 來源檔案：assets/CS5166701/week4/scripts/RemoteEntityView.ts
 * 起始位置：從 `class RemoteEntityView` 開始
 *
 * 這個檔案原本負責顯示遠端玩家的「幽靈節點」。
 *
 * 主要步驟：
 * 1. 保存每個 clientId 對應的節點、動畫與目標位置。
 * 2. 每一幀把當前位置往目標位置插值，讓畫面看起來平滑。
 * 3. 當收到新玩家狀態時，如果還沒有對應節點就先建立。
 * 4. 每次狀態更新時，套用位置、縮放與動畫。
 * 5. 玩家離線時，銷毀對應幽靈節點並從 Map 移除。
 *
 * 教學閱讀順序：
 * - 先理解 `_players` 這個 Map 存的是什麼。
 * - 再看 `update` 怎麼做平滑移動。
 * - 接著看 `applyState` 如何判斷要不要建立新幽靈。
 * - 最後看 `_createGhost` 與 `_playAnim`，理解節點與動畫如何被組裝。
 */
@ccclass("RemoteEntityView")
export class RemoteEntityView extends Component {
  @property(Prefab)
  public readonly remotePlayerPrefab: Prefab = null;

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

  // 1. 每幀把所有幽靈往目標位置靠近。
  protected update(_dt: number): void {
    // 1. 走訪 `_players` 中的所有遠端玩家。
    // 2. 取得目前位置與目標位置。
    // 3. 用 Lerp 讓位置慢慢逼近目標。
    // 4. 把插值結果寫回節點。
  }

  // 2. 對外提供的 API：收到遠端玩家狀態時呼叫。
  public applyState(clientId: string, msg: PlayerStateMsg): void {
    // 1. 先找這個 clientId 是否已經有對應的幽靈。
    // 2. 如果沒有，就先建立一個新的幽靈節點。
    // 3. 更新目標位置與縮放。
    // 4. 如果動畫狀態有變化，就播放對應動畫。
  }

  /** 玩家離線時呼叫，銷毀對應幽靈節點 */
  public removePlayer(clientId: string): void {
    // 1. 從 Map 找出對應的幽靈。
    // 2. 如果找到就銷毀節點。
    // 3. 從 Map 移除紀錄。
  }

  private _createGhost(clientId: string): RemotePlayerEntry {
    // 1. 決定幽靈節點要掛在哪個父節點底下。
    // 2. 如果有 Prefab 就 instantiate，否則建立一個簡單的 Node。
    // 3. 掛到父節點上。
    // 4. 從根節點或子節點找 Animation。
    // 5. 把幽靈節點、動畫與目標位置包成 entry，存進 Map。
    return {
      node: this.node,
      anim: null,
      targetPos: this.node.position.clone(),
      lastAnimState: AnimState.Idle,
    };
  }

  private _playAnim(anim: Animation | null, animState: AnimState): void {
    // 1. 如果沒有 Animation，就直接離開。
    // 2. 依照 animState 對應到 idle / walk / jump 名稱。
    // 3. 播放對應動畫。
  }
}

import { _decorator, Component } from "cc";
import { RandomNameGenerator } from "./RandomNameGenerator";
import {
  NetMsgType,
  type PlayerStateMsg,
  type MonsterStateMsg,
  type LeaderboardEntry,
  type AnimState,
} from "./NetworkTypes";

const { ccclass } = _decorator;

const WS_URL = "ws://localhost:3000";
const REST_URL = "http://localhost:3000";

/**
 * 教學版複本
 * 來源檔案：assets/CS5166701/week4/scripts/NetworkManager.ts
 * 起始位置：從 `class NetworkManager` 開始
 *
 * 這個檔案原本負責三件事：
 * 1. 建立並維護 WebSocket 連線。
 * 2. 把伺服器收到的各種訊息分派給對應 callback。
 * 3. 提供上傳分數與讀取排行榜的 REST API 包裝。
 *
 * 教學閱讀順序：
 * - 先看 singleton 與公開資訊，理解其他腳本如何取得網路管理器。
 * - 再看連線建立流程，確認 register 訊息是如何送出去的。
 * - 接著看 `_handleMessage`，這裡決定每種封包要更新哪個狀態。
 * - 最後看 `sendPlayerState`、`sendMonsterState`、`saveScore`、`loadLeaderboard`，理解資料怎麼送回伺服器。
 */
@ccclass("NetworkManager")
export class NetworkManager extends Component {
  // 1. 單例保存目前場景中的 NetworkManager，方便其他元件直接存取。
  private static _instance: NetworkManager | null = null;
  public static get instance(): NetworkManager | null {
    return NetworkManager._instance;
  }

  // 2. 本次遊戲使用的玩家名稱，啟動時決定後就不再更改。
  public readonly playerName: string = RandomNameGenerator.generate();

  public get clientId(): string {
    return this._clientId;
  }

  // 3. 這些 callback 由 GameContext 或其他控制器在執行期綁定。
  public onPlayerState: ((msg: PlayerStateMsg) => void) | null = null;
  public onMonsterState: ((msg: MonsterStateMsg) => void) | null = null;
  public onMonsterAuthority: ((isAuthority: boolean) => void) | null = null;
  public onLeaderboardUpdate: ((data: LeaderboardEntry[]) => void) | null =
    null;
  public onPlayerLeft: ((clientId: string) => void) | null = null;

  // 4. WebSocket 與 clientId 的私有狀態。
  private _ws: WebSocket | null = null;
  private _clientId: string = "";

  // 5. lifecycle：onLoad 負責註冊單例。
  protected onLoad(): void {
    // 1. 把自己記錄成目前場景的 NetworkManager。
    // 2. 之後其他腳本就能透過 instance 取得這個元件。
  }

  protected start(): void {
    // 1. 顯示玩家名稱，方便除錯與教學觀察。
    // 2. 建立 WebSocket 連線並等待伺服器回應。
  }

  protected onDestroy(): void {
    // 1. 關閉 WebSocket 連線，避免場景切換後還保留連線。
    // 2. 如果目前單例就是自己，則清空單例引用。
  }

  // 6. 連線流程：建立 WebSocket、收 open / message / close / error。
  private _connect(): void {
    // 1. 連到遊戲伺服器的 WebSocket 端點。
    // 2. 連線成功後送出 register 訊息，告訴伺服器玩家名稱。
    // 3. 收到訊息時先解析 JSON，再交給 `_handleMessage()` 分派。
    // 4. 斷線或錯誤時，記錄狀態供除錯。
  }

  private _handleMessage(msg: any): void {
    // 1. 根據 `msg.type` 判斷這是什麼類型的訊息。
    // 2. `registered` 時保存 clientId。
    // 3. `monster_authority` 時通知怪物控制器是否為主控端。
    // 4. `player_state`、`monster_state`、`leaderboard_update`、`player_left` 分別交給對應 callback。
  }

  // 7. 發送封包：先確認 WebSocket 已連線，再把物件轉成 JSON。
  private _send(data: object): void {
    // 1. 檢查連線狀態是否為 OPEN。
    // 2. 若已連線，就把資料序列化後送出。
  }

  /** 發送本地玩家的位置與動畫狀態 */
  public sendPlayerState(
    x: number,
    y: number,
    scaleX: number,
    animState: AnimState,
  ): void {
    // 1. 整理玩家位置、縮放與動畫狀態。
    // 2. 標記這是 player_state 訊息並帶上 clientId。
    // 3. 交給 `_send()` 發送。
  }

  /** 發送怪物的位置與動畫狀態（僅主控端呼叫） */
  public sendMonsterState(
    x: number,
    y: number,
    scaleX: number,
    animState: AnimState,
  ): void {
    // 1. 整理怪物位置、縮放與動畫狀態。
    // 2. 標記這是 monster_state 訊息。
    // 3. 交給 `_send()` 發送。
  }

  // 8. REST API：上傳分數與讀取排行榜。
  /** 遊戲結束時上傳分數；伺服器收到後會廣播排行榜給所有人 */
  public async saveScore(score: number): Promise<void> {
    // 1. 對 /api/score 發送 POST 請求，包含玩家名稱與分數。
    // 2. 等待伺服器回傳最新排行榜。
    // 3. 若回傳資料中包含 leaderboard，就直接更新本地 UI。
  }

  /** 主動拉取排行榜（一般不需要，伺服器會推播） */
  public async loadLeaderboard(): Promise<LeaderboardEntry[]> {
    // 1. 對 /api/score 發送 GET 請求。
    // 2. 把回傳的排行榜資料轉成 `LeaderboardEntry[]`。
    // 3. 如果失敗，回傳空陣列。
    return [];
  }
}

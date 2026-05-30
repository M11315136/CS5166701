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

@ccclass("NetworkManager")
export class NetworkManager extends Component {
  // ── Singleton ─────────────────────────────────────────────────────────────
  private static _instance: NetworkManager | null = null;
  public static get instance(): NetworkManager | null {
    return NetworkManager._instance;
  }

  // ── Public info ───────────────────────────────────────────────────────────
  /** 本次遊戲隨機產生的玩家名稱（遊戲啟動時確定，之後不變） */
  public readonly playerName: string = RandomNameGenerator.generate();

  public get clientId(): string {
    return this._clientId;
  }

  // ── Callbacks（由 GameContext 設定）─────────────────────────────────
  /** 收到其他玩家位置/動畫狀態時呼叫 */
  public onPlayerState: ((msg: PlayerStateMsg) => void) | null = null;
  /** 收到怪物位置/動畫狀態時呼叫（主控端不會收到自己發出的） */
  public onMonsterState: ((msg: MonsterStateMsg) => void) | null = null;
  /** 伺服器通知本 client 是否為怪物主控端 */
  public onMonsterAuthority: ((isAuthority: boolean) => void) | null = null;
  /** 排行榜有更新時呼叫 */
  public onLeaderboardUpdate: ((data: LeaderboardEntry[]) => void) | null =
    null;
  /** 某玩家離線時呼叫，傳入其 clientId */
  public onPlayerLeft: ((clientId: string) => void) | null = null;

  // ── Private ───────────────────────────────────────────────────────────────
  private _ws: WebSocket | null = null;
  private _clientId: string = "";

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  protected onLoad(): void {
    NetworkManager._instance = this;
  }

  protected start(): void {
    console.log(`[Net] 玩家名稱：${this.playerName}`);
    this._connect();
  }

  protected onDestroy(): void {
    this._ws?.close();
    if (NetworkManager._instance === this) {
      NetworkManager._instance = null;
    }
  }

  // ── Connection ────────────────────────────────────────────────────────────
  private _connect(): void {
    this._ws = new WebSocket(WS_URL);

    this._ws.onopen = () => {
      console.log("[Net] ✅ WebSocket 連線成功");
      this._send({ type: NetMsgType.Register, name: this.playerName });
    };

    this._ws.onmessage = (event: MessageEvent) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        return;
      }
      this._handleMessage(msg);
    };

    this._ws.onclose = () => {
      console.log("[Net] ❌ WebSocket 已斷線");
    };

    this._ws.onerror = () => {
      console.error(
        "[Net] WebSocket 發生錯誤，請確認伺服器已啟動（node server.js）",
      );
    };
  }

  private _handleMessage(msg: any): void {
    switch (msg.type as NetMsgType) {
      case NetMsgType.Registered:
        this._clientId = msg.clientId;
        console.log(`[Net] 已取得 clientId：${this._clientId}`);
        break;

      case NetMsgType.MonsterAuthority:
        this.onMonsterAuthority?.(msg.isAuthority as boolean);
        break;

      case NetMsgType.PlayerState:
        // 過濾掉自己發出的（伺服器已做 broadcastExcept，但雙重保險）
        if (msg.clientId !== this._clientId) {
          this.onPlayerState?.(msg as PlayerStateMsg);
        }
        break;

      case NetMsgType.MonsterState:
        this.onMonsterState?.(msg as MonsterStateMsg);
        break;

      case NetMsgType.LeaderboardUpdate:
        this.onLeaderboardUpdate?.(msg.leaderboard as LeaderboardEntry[]);
        break;

      case NetMsgType.PlayerLeft:
        this.onPlayerLeft?.(msg.clientId as string);
        break;
    }
  }

  // ── Send helpers ──────────────────────────────────────────────────────────
  private _send(data: object): void {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify(data));
    }
  }

  /** 發送本地玩家的位置與動畫狀態 */
  public sendPlayerState(
    x: number,
    y: number,
    scaleX: number,
    animState: AnimState,
  ): void {
    this._send({
      type: NetMsgType.PlayerState,
      clientId: this._clientId,
      x,
      y,
      scaleX,
      animState,
    });
  }

  /** 發送怪物的位置與動畫狀態（僅主控端呼叫） */
  public sendMonsterState(
    x: number,
    y: number,
    scaleX: number,
    animState: AnimState,
  ): void {
    this._send({ type: NetMsgType.MonsterState, x, y, scaleX, animState });
  }

  // ── REST API ──────────────────────────────────────────────────────────────
  /** 遊戲結束時上傳分數；伺服器收到後會廣播排行榜給所有人 */
  public async saveScore(score: number): Promise<void> {
    try {
      const res = await fetch(`${REST_URL}/api/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: this.playerName, score }),
      });
      const data = await res.json();
      console.log("[Net] 分數已上傳：", data.message);
      // HTTP 回傳裡就已有最新排行榜，直接更新本地 UI
      // （不等 WS broadcast，讓提交方立即看到結果）
      if (data.leaderboard) {
        this.onLeaderboardUpdate?.(data.leaderboard);
      }
    } catch (e) {
      console.error("[Net] 上傳分數失敗：", e);
    }
  }

  /** 主動拉取排行榜（一般不需要，伺服器會推播） */
  public async loadLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch(`${REST_URL}/api/score`);
      return (await res.json()) as LeaderboardEntry[];
    } catch (e) {
      console.error("[Net] 讀取排行榜失敗：", e);
      return [];
    }
  }
}

import { _decorator, Component } from "cc";
import Game from "../../../week1/scripts/System/Game";
import KeyController from "./KeyController";
import DoorController from "./DoorController";
import { ScoreBoard } from "../UI/ScoreBoard";
import { CountdownTimer } from "../UI/CountdownTimer";
import { PlayerController } from "../../../week2/scripts/Controller/PlayerController";
import { NetworkManager } from "../../../week4/scripts/NetworkManager";
import { RemoteEntityView } from "../../../week4/scripts/RemoteEntityView";
import { LeaderboardUI } from "../../../week4/scripts/UI/LeaderboardUI";

const { ccclass, property } = _decorator;

@ccclass("GameContext")
export default class GameContext extends Component {
  protected static instance: GameContext = null;

  @property(KeyController)
  public readonly keyController: KeyController = null;

  @property(DoorController)
  public readonly doorController: DoorController = null;

  @property(PlayerController)
  public readonly playerController: PlayerController = null;

  @property(ScoreBoard)
  public readonly scoreBoard: ScoreBoard = null;

  @property(CountdownTimer)
  public readonly countdown: CountdownTimer = null;

  // ── Week 4：網路同步 ──────────────────────────────────────────────────────

  @property(NetworkManager)
  public readonly networkManager: NetworkManager = null;

  /**
   * 遠端玩家管理元件。
   * Prefab 與父節點都在 RemoteEntityView 裡設定，此處只需拖入該 Component 即可。
   */
  @property(RemoteEntityView)
  public readonly remoteEntityView: RemoteEntityView = null;

  @property(LeaderboardUI)
  public readonly leaderboardUI: LeaderboardUI = null;

  // 快取最後一次收到的排行榜，供 WinBoard 呼叫 refreshLeaderboard() 使用
  private _lastLeaderboard: { name: string; score: number }[] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  protected onLoad(): void {
    Game.context = this;
  }

  protected start(): void {
    if (!this.networkManager) return;

    this.networkManager.onPlayerState = (msg) => {
      this.remoteEntityView?.applyState(msg.clientId, msg);
    };

    this.networkManager.onPlayerLeft = (clientId) => {
      this.remoteEntityView?.removePlayer(clientId);
    };

    this.networkManager.onLeaderboardUpdate = (data) => {
      this._lastLeaderboard = data;
      this.leaderboardUI?.updateLeaderboard(data);
    };

    // 連線後主動拉取一次，顯示伺服器現有的排行榜（leaderboard.json 中的舊資料）
    this.networkManager.loadLeaderboard().then((data) => {
      if (data.length > 0) {
        this._lastLeaderboard = data;
        this.leaderboardUI?.updateLeaderboard(data);
      }
    });
  }

  // ── Week 4：遊戲結算 ──────────────────────────────────────────────────────

  /** 遊戲結束時呼叫，上傳分數；伺服器會廣播 leaderboard_update 給所有玩家 */
  public async submitScore(): Promise<void> {
    if (!this.networkManager) return;
    const score = this.scoreBoard?.score ?? 0;
    await this.networkManager.saveScore(score);
  }

  /**
   * 以快取資料重新顯示排行榜。
   * WinBoard 關閉後呼叫，確保排行榜不被 WinBoard 面板蓋住後消失。
   */
  public refreshLeaderboard(): void {
    if (this._lastLeaderboard.length > 0) {
      this.leaderboardUI?.updateLeaderboard(this._lastLeaderboard);
    }
  }
}

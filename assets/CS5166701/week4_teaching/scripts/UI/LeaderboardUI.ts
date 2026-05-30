import { _decorator, Component, Label, Node } from "cc";
import type { LeaderboardEntry } from "../NetworkTypes";

const { ccclass, property } = _decorator;

@ccclass("LeaderboardUI")
export class LeaderboardUI extends Component {
  @property(Node)
  public readonly panel: Node = null;

  /** 單一 Label，顯示整個排行榜文字（需勾選 enableWrapText） */
  @property(Label)
  public readonly label: Label = null;

  @property({ tooltip: "最多顯示幾名" })
  public readonly maxEntries: number = 10;

  public setVisible(visible: boolean): void {
    // 1. 顯示或隱藏整個 UI 節點。
    // 2. 如果有獨立 panel，也一起同步狀態。
  }

  public updateLeaderboard(entries: LeaderboardEntry[]): void {
    // 1. 先確認有沒有綁定 Label。
    // 2. 只取前幾名，整理成多行文字。
    // 3. 寫入 Label。
    // 4. 讓排行榜自動顯示出來。
  }
}

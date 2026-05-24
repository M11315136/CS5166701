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
    this.node.active = visible;
    if (this.panel) this.panel.active = visible;
  }

  public updateLeaderboard(entries: LeaderboardEntry[]): void {
    if (!this.label) return;
    const lines = entries
      .slice(0, this.maxEntries)
      .map((e, i) => `#${i + 1}  ${e.name}  ${e.score}`);
    this.label.string = lines.join("\n");
    // 有資料就自動顯示，不依賴外部呼叫 setVisible
    this.node.active = true;
    if (this.panel) this.panel.active = true;
  }
}

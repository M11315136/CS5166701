import { _decorator, Component, Label } from "cc";
import Game from "../../../week1/scripts/System/Game";
import { WinBoard } from "./WinBoard";

const { ccclass, property } = _decorator;

@ccclass("CountdownTimerTutorial")
export class CountdownTimerTutorial extends Component {
  @property(Label)
  public readonly timeLabel: Label = null;

  @property(WinBoard)
  public readonly winBoard: WinBoard = null;

  @property
  public totalSeconds = 60;

  private _remainingSeconds = 0;
  private _tickBuffer = 0;
  private _finished = false;

  public get remainingSeconds() {
    return this._remainingSeconds;
  }

  protected start() {
    // 1. 把總秒數轉成安全的整數，避免出現負數或小數。
    // 2. 把累積的時間差清空，讓倒數從乾淨狀態開始。
    // 3. 把完成狀態重設為 false，表示計時尚未結束。
    // 4. 立刻更新畫面上的時間文字，讓玩家看到初始時間。
  }

  protected update(deltaTime: number) {
    // 1. 如果計時已經結束，就直接離開，不再處理倒數。
    // 2. 把這一幀經過的時間累加到緩衝區。
    // 3. 當累積時間超過 1 秒時，就扣掉 1 秒並讓剩餘秒數減少。
    // 4. 每減少 1 秒就更新一次畫面上的時間顯示。
    // 5. 如果時間到 0，就把剩餘秒數歸零，更新畫面，並觸發時間到的流程。
  }

  public completeWin() {
    // 1. 如果已經結束，就不要重複處理。
    // 2. 把狀態改成完成，避免後續 update 繼續倒數。
    // 3. 依照剩餘時間計算加分，並把分數送到分數板。
    // 4. 更新時間文字，讓畫面維持一致。
    // 5. 通知勝利面板，顯示通關結果。
  }

  private _onTimeUp() {
    // 1. 如果已經結束，就不要再觸發一次。
    // 2. 把狀態改成完成，避免其他流程重複執行。
    // 3. 通知勝利面板，顯示失敗結果。
  }

  private _updateTimeLabel() {
    // 1. 先確認畫面上有沒有綁定時間標籤。
    // 2. 如果有，就把剩餘秒數格式化成 mm:ss。
    // 3. 將格式化後的字串寫進 Label，更新 UI。
  }

  private _formatTime(totalSeconds: number) {
    // 1. 先把總秒數切成分鐘與秒數。
    // 2. 補上前導 0，讓 1 變成 01，維持 UI 對齊。
    // 3. 組合成「剩餘時間： mm:ss」的字串後回傳。
    return "";
  }
}

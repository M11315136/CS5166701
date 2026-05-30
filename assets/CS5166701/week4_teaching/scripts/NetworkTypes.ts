// 所有 WebSocket 訊息的型別定義（前後端共用協議）

/**
 * 教學版複本
 * 來源檔案：assets/CS5166701/week4/scripts/NetworkTypes.ts
 * 起始位置：從 `enum NetMsgType` 開始
 *
 * 這個檔案原本負責定義網路訊息格式。
 *
 * 主要步驟：
 * 1. 先定義所有訊息類型的字串常數，避免前後端打錯名稱。
 * 2. 再定義動畫狀態，讓玩家與怪物的同步資料可以共用。
 * 3. 最後定義各種封包的介面，描述每種訊息應該包含哪些欄位。
 *
 * 教學閱讀順序：
 * - 先看 `NetMsgType`，確認 client/server 會交換哪些事件。
 * - 再看 `AnimState`，理解動畫狀態如何被共用。
 * - 最後看 `PlayerStateMsg`、`MonsterStateMsg`、`LeaderboardEntry`。
 */

export enum NetMsgType {}

/** 動畫狀態（對應 EntityController 三種 state） */
export enum AnimState {
  Idle = "idle",
}

// ── Client → Server ───────────────────────────────────────────────────────────

export interface PlayerStateMsg {}

export interface MonsterStateMsg {}

// ── Server → Client ───────────────────────────────────────────────────────────

export interface LeaderboardEntry {}

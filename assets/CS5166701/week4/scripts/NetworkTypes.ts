// 所有 WebSocket 訊息的型別定義（前後端共用協議）

export enum NetMsgType {
  // Client → Server
  Register = "register",
  PlayerState = "player_state",
  MonsterState = "monster_state",

  // Server → Client
  Registered = "registered",
  MonsterAuthority = "monster_authority",
  LeaderboardUpdate = "leaderboard_update",
  PlayerLeft = "player_left",
}

/** 動畫狀態（對應 EntityController 三種 state） */
export type AnimState = "idle" | "run" | "jump";

// ── Client → Server ───────────────────────────────────────────────────────────

export interface PlayerStateMsg {
  type: NetMsgType.PlayerState;
  clientId: string;
  x: number;
  y: number;
  scaleX: number;
  animState: AnimState;
}

export interface MonsterStateMsg {
  type: NetMsgType.MonsterState;
  x: number;
  y: number;
  scaleX: number;
  animState: AnimState;
}

// ── Server → Client ───────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  name: string;
  score: number;
}

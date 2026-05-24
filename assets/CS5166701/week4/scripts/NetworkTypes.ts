// 所有 WebSocket 訊息的型別定義（前後端共用協議）

export enum NetMsgType {
    // Client → Server
    Register        = 'register',
    PlayerState     = 'player_state',
    MonsterState    = 'monster_state',

    // Server → Client
    Registered      = 'registered',
    MonsterAuthority = 'monster_authority',
    LeaderboardUpdate = 'leaderboard_update',
    PlayerLeft      = 'player_left',
}

/** 動畫狀態（對應 EntityController 三種 state） */
export type AnimState = 'idle' | 'run' | 'jump';

// ── Client → Server ───────────────────────────────────────────────────────────

export interface RegisterMsg {
    type: NetMsgType.Register;
    name: string;
}

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

export interface RegisteredMsg {
    type: NetMsgType.Registered;
    clientId: string;
}

export interface MonsterAuthorityMsg {
    type: NetMsgType.MonsterAuthority;
    isAuthority: boolean;
}

export interface LeaderboardEntry {
    name: string;
    score: number;
}

export interface LeaderboardUpdateMsg {
    type: NetMsgType.LeaderboardUpdate;
    leaderboard: LeaderboardEntry[];
}

export interface PlayerLeftMsg {
    type: NetMsgType.PlayerLeft;
    clientId: string;
}

export type NetMessage =
    | RegisterMsg
    | PlayerStateMsg
    | MonsterStateMsg
    | RegisteredMsg
    | MonsterAuthorityMsg
    | LeaderboardUpdateMsg
    | PlayerLeftMsg;

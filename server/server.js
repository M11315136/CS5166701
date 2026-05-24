const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ── Leaderboard 本地檔案持久化 ────────────────────────────────────────────────
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

function loadLeaderboard() {
    try {
        if (fs.existsSync(LEADERBOARD_FILE)) {
            return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
        }
    } catch (e) {
        console.warn('[Leaderboard] 讀取檔案失敗，使用空排行榜：', e.message);
    }
    return [];
}

function saveLeaderboard(data) {
    try {
        fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('[Leaderboard] 寫入檔案失敗：', e.message);
    }
}

let leaderboard = loadLeaderboard(); // 啟動時從檔案讀取
console.log(`[Leaderboard] 已載入 ${leaderboard.length} 筆紀錄`);

// ── Client tracking ───────────────────────────────────────────────────────────
const clients = new Map(); // ws -> { id, name }
let nextId = 0;
let monsterAuthorityId = null; // id of the client that controls the monster

// ── Helpers ───────────────────────────────────────────────────────────────────
function send(ws, data) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function broadcast(data) {
    const str = JSON.stringify(data);
    clients.forEach((_, ws) => { if (ws.readyState === ws.OPEN) ws.send(str); });
}

function broadcastExcept(sender, data) {
    const str = JSON.stringify(data);
    clients.forEach((_, ws) => {
        if (ws !== sender && ws.readyState === ws.OPEN) ws.send(str);
    });
}

// ── REST API ──────────────────────────────────────────────────────────────────
app.get('/api/score', (req, res) => {
    res.json(leaderboard.slice(0, 10));
});

app.post('/api/score', (req, res) => {
    const { name, score } = req.body;
    if (!name || score === undefined) {
        return res.status(400).json({ message: '缺少 name 或 score' });
    }

    const existing = leaderboard.findIndex(e => e.name === name);
    if (existing !== -1) {
        leaderboard[existing].score = score; // 同名玩家：以最新分數覆蓋
    } else {
        leaderboard.push({ name, score });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    saveLeaderboard(leaderboard); // 寫入本地檔案

    // 廣播排行榜更新給所有連線玩家
    broadcast({ type: 'leaderboard_update', leaderboard });

    res.json({ message: '分數已儲存', leaderboard });
});

// ── WebSocket ─────────────────────────────────────────────────────────────────
wss.on('connection', (ws) => {
    const clientId = String(nextId++);
    clients.set(ws, { id: clientId, name: '' });
    console.log(`[+] 玩家 ${clientId} 連線（共 ${clients.size} 人）`);

    // 通知此 client 其 ID
    send(ws, { type: 'registered', clientId });

    // 分配怪物主控權：第一個連線的玩家為主控
    if (monsterAuthorityId === null) {
        monsterAuthorityId = clientId;
        send(ws, { type: 'monster_authority', isAuthority: true });
        console.log(`[Monster] 主控權分配給玩家 ${clientId}`);
    } else {
        send(ws, { type: 'monster_authority', isAuthority: false });
    }

    // 若已有排行榜，立即推送給新玩家
    if (leaderboard.length > 0) {
        send(ws, { type: 'leaderboard_update', leaderboard });
    }

    ws.on('message', (raw) => {
        let msg;
        try { msg = JSON.parse(raw); } catch { return; }

        switch (msg.type) {
            case 'register':
                clients.get(ws).name = msg.name;
                console.log(`[=] 玩家 ${clientId} 命名為「${msg.name}」`);
                break;

            case 'player_state':
            case 'monster_state':
                // 轉發給其他玩家
                broadcastExcept(ws, msg);
                break;

            default:
                break;
        }
    });

    ws.on('close', () => {
        console.log(`[-] 玩家 ${clientId} 離線（剩 ${clients.size - 1} 人）`);

        // 通知其他玩家此玩家已離線，讓他們刪除對應的幽靈節點
        broadcastExcept(ws, { type: 'player_left', clientId });

        if (clientId === monsterAuthorityId) {
            monsterAuthorityId = null;
            // 若還有其他玩家，將主控權移交給第一個找到的 client
            for (const [sock, info] of clients) {
                if (sock !== ws && sock.readyState === sock.OPEN) {
                    monsterAuthorityId = info.id;
                    send(sock, { type: 'monster_authority', isAuthority: true });
                    console.log(`[Monster] 主控權移交給玩家 ${info.id}`);
                    break;
                }
            }
        }
        clients.delete(ws);
    });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`✅ 伺服器啟動於 http://localhost:${PORT}`);
    console.log(`   REST  → http://localhost:${PORT}/api/score`);
    console.log(`   WS    → ws://localhost:${PORT}`);
});

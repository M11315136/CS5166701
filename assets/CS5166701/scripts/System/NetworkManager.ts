import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NetworkManager')
export class NetworkManager extends Component {

    // 儲存 WebSocket 實體
    private ws: WebSocket | null = null;
    private myPlayerId: number = 0;

    start() {
        this.myPlayerId = Math.floor(Math.random() * 10000); // 隨機產生玩家 ID
        
        // 遊戲一開始就嘗試連線 WebSocket
        this.connectWebSocket();
    }

    // ==========================================
    // 1. API 實作 (RESTful / HTTP)
    // ==========================================

    /** 上傳分數到伺服器 */
    public async saveScore(playerName: string, score: number) {
        try {
            // 注意：localhost:3000 是我們 Node 伺服器設定的 Port
            const response = await fetch('http://localhost:3000/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName, score: score })
            });
            const data = await response.json();
            console.log("伺服器回應：", data.message);
        } catch (error) {
            console.error("上傳分數失敗：", error);
        }
    }

    /** 取得排行榜資料 */
    public async loadLeaderboard() {
        try {
            const response = await fetch('http://localhost:3000/api/score');
            const data = await response.json();
            console.log("目前的排行榜：", data);
            // TODO: 在這裡把資料交給 UI 介面顯示
        } catch (error) {
            console.error("讀取排行榜失敗：", error);
        }
    }

    // ==========================================
    // 2. WebSocket 實作 (即時連線)
    // ==========================================

    private connectWebSocket() {
        // 連接到我們 Node 伺服器的 WebSocket Port (8080)
        this.ws = new WebSocket('ws://localhost:8080');

        // 當連線成功時觸發
        this.ws.onopen = () => {
            console.log('✅ WebSocket 連線成功！');
        };

        // 當收到伺服器廣播訊息時觸發 (接收別人的座標)
        this.ws.onmessage = (event) => {
            const otherPlayerData = JSON.parse(event.data);
            // console.log(`收到玩家 ${otherPlayerData.id} 的座標：`, otherPlayerData.x, otherPlayerData.y);
            
            // TODO: 在這裡更新其他玩家幽靈的 Sprite 座標
        };

        // 當連線斷開時觸發
        this.ws.onclose = () => {
            console.log('❌ WebSocket 連線已斷開');
        };
    }

    /** 廣播自己的座標給其他人 (在 Player.ts 的 Update 中呼叫此方法) */
    public sendMyPosition(currentX: number, currentY: number) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const myData = {
                id: this.myPlayerId,
                x: currentX,
                y: currentY
            };
            this.ws.send(JSON.stringify(myData));
        }
    }
}
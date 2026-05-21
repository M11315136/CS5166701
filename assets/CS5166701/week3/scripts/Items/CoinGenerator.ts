import {
    _decorator,
    Component,
    Prefab,
    instantiate,
    Vec2,
    Vec3,
    PhysicsSystem2D,
    ERaycast2DType,
    Node,
    RaycastResult2D
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CoinGenerator')
export class CoinGenerator extends Component {

    @property(Prefab)
    coinPrefab: Prefab = null!;

    @property(Node)
    coinParent: Node = null!;

    @property
    coinCount: number = 10;

    @property
    minX: number = -450;

    @property
    maxX: number = 2300;

    @property
    rayStartY: number = -240;

    @property
    rayEndY: number = 60;

    @property
    maxHeightOffset: number = 15; // 地板上方最大 30


    start() {
        this.generateCoins();
    }

    /**
     * 生成指定數量 coin
     */
    generateCoins() {
        for (let i = 0; i < this.coinCount; i++) {
            this.generateSingleCoin();
        }
    }

    /**
     * 生成單顆 coin
     */
    generateSingleCoin() {
        const randomX = this.getRandom(this.minX, this.maxX);

        const start = new Vec2(randomX, this.rayStartY);
        const end = new Vec2(randomX, this.rayEndY);

        // 3.6.x 直接回傳結果
        const results = PhysicsSystem2D.instance.raycast(
            start,
            end,
            ERaycast2DType.Closest
        );

        const groundPoint = results[0].point;

        // 地板上方 0~30
        const offsetY = this.getRandom(0, this.maxHeightOffset);

        const coinPos = new Vec3(
            randomX,
            groundPoint.y + offsetY,
            0
        );

        const coin = instantiate(this.coinPrefab);

        const parent = this.coinParent || this.node;
        parent.addChild(coin);

        coin.setPosition(coinPos);
    }

    /**
     * 清除所有 coin
     */
    clearCoins() {
        const parent = this.coinParent || this.node;
        parent.removeAllChildren();
    }

    /**
     * 重新生成
     */
    regenerateCoins() {
        this.clearCoins();
        this.generateCoins();
    }

    /**
     * random float
     */
    private getRandom(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
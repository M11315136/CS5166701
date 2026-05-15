import {
  _decorator,
  Component,
  Node,
  Animation,
  Vec2,
  Vec3,
  tween,
  Contact2DType,
  PhysicsSystem2D,
  Collider2D,
} from "cc";
import { DataType } from "../../week1/scripts/Data/DataStructure";
import { WinBoard } from "../../week3/scripts/UI/WinBoard";

const { ccclass, property } = _decorator;

@ccclass("MonsterController")
export class MonsterController extends Component {
  @property(Node)
  public readonly target: Node = null;

  @property(Node)
  public readonly monsterSprite: Node = null;

  // @property(WinBoard)
  // public readonly winBoard: WinBoard = null;

  @property({ group: "Animation Name" })
  public readonly m1Anim = "slime";

  @property({ tooltip: "Movement speed (units/sec)" })
  public readonly speed = 3;

  private _anim: Animation;
  private _direction: number = 1; // 1 = right, -1 = left

  protected start() {
    if (!this.target) {
      return;
    }

    this._anim = this.monsterSprite.getComponent(Animation);

    if (this._anim && this.m1Anim) {
      this._anim.play(this.m1Anim);
    }

    const collider = this.target.getComponent(Collider2D);
    if (collider) {
      PhysicsSystem2D.instance.enable = true;
      // collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    }

    // start facing based on direction
    this.monsterSprite.setScale(this._direction === 1 ? -1 : 1, 1, 1);
  }
  // per-frame patrol with ground-ahead raycast
  protected update(deltaTime: number) {
    if (!this.target) {
      return;
    }

    // move
    const moveAmount = this.speed * deltaTime * this._direction;
    this.target.setPosition(
      this.target.position.x + moveAmount,
      this.target.position.y,
      this.target.position.z,
    );

    // raycast ahead and down to check for ground
    const worldPos = this.target.worldPosition;
    const forwardOffset = 20 * this._direction; // pixels ahead
    const start = new Vec2(worldPos.x + forwardOffset, worldPos.y - 10);
    const end = new Vec2(start.x, start.y - 40);

    const results = PhysicsSystem2D.instance.raycast(start, end);
    const hasGround = results.some((res) => {
      const isGround = res.collider.tag === DataType.Tag.Ground;
      const isFloor = res.normal.y >= 0.9;
      return isGround && isFloor;
    });

    if (!hasGround) {
      // no ground ahead -> turn around
      this._direction *= -1;
      this.monsterSprite.setScale(this._direction === 1 ? -1 : 1, 1, 1);
    }
  }
}

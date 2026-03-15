import {
  _decorator,
  Component,
  Node,
  Animation,
  Vec3,
  tween,
  Contact2DType,
  PhysicsSystem2D,
  Collider2D,
} from "cc";
import { DataType } from "../Game/DataStructure";
import { WinBoard } from "../Object/WinBoard";

const { ccclass, property } = _decorator;

@ccclass("MonsterController")
export class MonsterController extends Component {
  @property(Node)
  public readonly target: Node = null;

  @property(Node)
  public readonly monsterSprite: Node = null;

  @property(WinBoard)
  public readonly winBoard: WinBoard = null;

  @property({ group: "Animation Name" })
  public readonly m1Anim = "slime";

  @property({ tooltip: "Movement speed (units/sec)" })
  public speed = 3;

  @property({ tooltip: "Range from the start X position (positive)" })
  public range = 100;

  private _anim: Animation;

  start() {
    if (!this.target) return;

    this._anim = this.monsterSprite.getComponent(Animation);

    if (this._anim && this.m1Anim) {
      this._anim.play(this.m1Anim);
    }

    const collider = this.target.getComponent(Collider2D);
    if (collider) {
      PhysicsSystem2D.instance.enable = true;
      collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    }

    this._startPatrol();
  }

  private _onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.tag === DataType.Tag.Player) {
        this.winBoard.node.active = true;
        this.winBoard.label.string = "You Lose!";
        this.winBoard.node.position = new Vec3(this.target.position.x, this.winBoard.node.position.y, 0);
    }
  }

  private _startPatrol() {
    const startX = this.target.position.x;
    const rightX = startX + this.range;
    const leftX = startX - this.range;

    tween(this.target)
      .repeatForever(
        tween()
          // 往右走
          .call(() => this.monsterSprite.setScale(-1, 1)) // 轉向右
          .to(this.speed, {
            position: new Vec3(rightX, this.target.position.y, 0),
          })

          // 往左走
          .call(() => this.monsterSprite.setScale(1, 1)) // 轉向左
          .to(this.speed, {
            position: new Vec3(leftX, this.target.position.y, 0),
          }),
      )
      .start();
  }
}

import {
  _decorator,
  Component,
  Node,
  Animation,
  Vec3,
  UITransform,
  tween,
  SpriteFrame,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("MonsterController")
export class MonsterController extends Component {
  @property(Node)
  public readonly monster: Node = null;

  @property(Node)
  public readonly monsterSprite: Node = null;

  @property({ group: "Animation Name" })
  public readonly m1Anim = "slime";

  @property({ tooltip: "Movement speed (units/sec)" })
  public speed = 3;

  @property({ tooltip: "Range from the start X position (positive)" })
  public range = 100;

  private _anim: Animation;

  start() {
    if (!this.monster) return;

    this._anim = this.monsterSprite.getComponent(Animation);

    if (this._anim && this.m1Anim) {
      this._anim.play(this.m1Anim);
    }

    this._startPatrol();
  }

  private _startPatrol() {
    const startX = this.monster.position.x;
    const rightX = startX + this.range;
    const leftX = startX - this.range;

    tween(this.monster)
      .repeatForever(
        tween()
          // 往右走
          .call(() => this.monsterSprite.setScale(-1, 1)) // 轉向右
          .to(this.speed, {
            position: new Vec3(rightX, this.monster.position.y, 0),
          })

          // 往左走
          .call(() => this.monsterSprite.setScale(1, 1)) // 轉向左
          .to(this.speed, {
            position: new Vec3(leftX, this.monster.position.y, 0),
          }),
      )
      .start();
  }

}

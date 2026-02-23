import {
  _decorator,
  Component,
  Animation,
  RigidBody2D,
  Vec2,
  Input,
  input,
  EventKeyboard,
  KeyCode,
  Collider2D,
  PhysicsSystem2D,
  Contact2DType,
  Node,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  @property(Node)
  public readonly player: Node = null;

  @property({ group: "Settings" })
  public readonly moveSpeed = 5;

  @property({ group: "Settings" })
  public readonly jumpForce = 8;

  @property({ group: "Animation Name" })
  public readonly idleAnim = "idle";

  @property({ group: "Animation Name" })
  public readonly walkAnim = "walk";

  @property({ group: "Animation Name" })
  public readonly jumpAnim = "jump";

  private _anim: Animation;
  private _rb: RigidBody2D;

  private _moveDir = 0;
  private _isGrounded = true;
  private _currentState = "";

  // TODO:
  // 1. 左右移動有機會會停下
  // 2. 地板側邊可以跳躍或左右移動卡在牆上

  protected start() {
    this._anim = this.player.getComponent(Animation)!;
    this._rb = this.player.getComponent(RigidBody2D)!;

    input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this._onKeyUp, this);

    this._playAnim(this.idleAnim);
    PhysicsSystem2D.instance.enable = true;
    const collider = this.player.getComponent(Collider2D);
    collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
  }

  protected update() {
    this.updateMovement();
    this.updateAnimation();
  }

  private _onKeyDown(e: EventKeyboard) {
    if (e.keyCode === KeyCode.KEY_A) this._moveDir = -1;
    if (e.keyCode === KeyCode.KEY_D) this._moveDir = 1;
    if (e.keyCode === KeyCode.KEY_W) this.jump();
  }

  private _onKeyUp(e: EventKeyboard) {
    if (e.keyCode === KeyCode.KEY_A || e.keyCode === KeyCode.KEY_D) {
      this._moveDir = 0;
    }
  }

  private updateMovement() {
    const v = this._rb.linearVelocity;
    v.x = this._moveDir * this.moveSpeed;
    this._rb.linearVelocity = v;

    if (this._moveDir !== 0) {
      this.player.setScale(this._moveDir, 1, 1);
    }
  }

  private jump() {
    if (!this._isGrounded) return;

    this._rb.linearVelocity = new Vec2(
      this._rb.linearVelocity.x,
      this.jumpForce,
    );

    this._isGrounded = false;
    this._playAnim(this.jumpAnim);
  }

  private updateAnimation() {
    if (!this._isGrounded) return;

    if (this._moveDir === 0) {
      this._playAnim(this.idleAnim);
    } else {
      this._playAnim(this.walkAnim);
    }
  }

  private _playAnim(name: string) {
    if (this._currentState === name) return;
    this._currentState = name;
    this._anim.play(name);
  }

  // 地面碰撞
  private _onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.tag === 1 && this._isGrounded === false) {
      this._isGrounded = true;
      this._playAnim(this.idleAnim);
    }
  }
}

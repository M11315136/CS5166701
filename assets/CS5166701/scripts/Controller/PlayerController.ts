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
  Camera,
} from "cc";
import { DataType } from "../Game/DataStructure";
const { ccclass, property } = _decorator;

enum MoveDir {
  Left = -1,
  Stop = 0,
  Right = 1,
}

enum EventType {
  KeyCollected = "key-collected",
}

@ccclass("PlayerController")
export class PlayerController extends Component {
  public static EVENT_TYPE = EventType;
  @property(Node)
  public readonly player: Node = null;

  @property(Camera)
  public readonly camera: Camera = null;

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

  private _moveDir: MoveDir = MoveDir.Stop;
  private _isGrounded: boolean = true;
  private _currentState: string = "";
  private _leftHeld: boolean = false;
  private _rightHeld: boolean = false;
  private _groundContacts: number = 0;
  private _blockedLeftContacts: number = 0;
  private _blockedRightContacts: number = 0;

  private get moveDir() {
    return this._moveDir;
  }

  private set moveDir(value: number) {
    if (value === this._moveDir) {
      return;
    }
    this._moveDir = value;
  }

  protected start() {
    this._anim = this.player.getComponent(Animation)!;
    this._rb = this.player.getComponent(RigidBody2D)!;
    input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this._onKeyUp, this);

    this._playAnim(this.idleAnim);
    PhysicsSystem2D.instance.enable = true;
    const collider = this.player.getComponent(Collider2D);
    collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
    collider.on(Contact2DType.END_CONTACT, this._onEndContact, this);
  }

  protected update() {
    this._updateMovement();
    this._updateAnimation();
  }

  protected jump() {
    if (!this._isGrounded) {
      return;
    }

    this._rb.linearVelocity = new Vec2(
      this._rb.linearVelocity.x,
      this.jumpForce,
    );
    this._isGrounded = false;
    console.log("跳躍！", this._rb.linearVelocity);
    this._playAnim(this.jumpAnim);
  }

  private _onKeyDown(e: EventKeyboard) {
    if (this._isLeftKey(e.keyCode)) {
      this._leftHeld = true;
      this._resolveMoveDir();
      return;
    }

    if (this._isRightKey(e.keyCode)) {
      this._rightHeld = true;
      this._resolveMoveDir();
      return;
    }

    if (this._isJumpKey(e.keyCode)) {
      this.jump();
    }
  }

  private _onKeyUp(e: EventKeyboard) {
    if (this._isLeftKey(e.keyCode)) {
      this._leftHeld = false;
      this._resolveMoveDir();
      return;
    }

    if (this._isRightKey(e.keyCode)) {
      this._rightHeld = false;
      this._resolveMoveDir();
    }
  }

  private _isLeftKey(keyCode: KeyCode) {
    return keyCode === KeyCode.KEY_A || keyCode === KeyCode.ARROW_LEFT;
  }

  private _isRightKey(keyCode: KeyCode) {
    return keyCode === KeyCode.KEY_D || keyCode === KeyCode.ARROW_RIGHT;
  }

  private _isJumpKey(keyCode: KeyCode) {
    return (
      keyCode === KeyCode.KEY_W ||
      keyCode === KeyCode.ARROW_UP ||
      keyCode === KeyCode.SPACE
    );
  }

  private _resolveMoveDir() {
    if (this._leftHeld === this._rightHeld) {
      this.moveDir = MoveDir.Stop;
      return;
    }

    this.moveDir = this._leftHeld ? MoveDir.Left : MoveDir.Right;
  }

  // 地面與障礙碰撞狀態更新
  private _onBeginContact(self: Collider2D, other: Collider2D) {
    if (other.tag === DataType.Tag.Ground) {
      this._groundContacts += 1;
      this._isGrounded = true;
      return;
    }

    if (other.tag === DataType.Tag.Block) {
      const deltaX = other.node.worldPosition.x - self.node.worldPosition.x;
      const deltaY = other.node.worldPosition.y - self.node.worldPosition.y;

      // 垂直接觸優先視為地面/天花板；水平才視為左右阻擋。
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        if (deltaY > 0) {
          const v = this._rb.linearVelocity;
          if (v.y > 0) {
            v.y = 0;
            this._rb.linearVelocity = v;
          }
        } else {
          this._groundContacts += 1;
          this._isGrounded = true;
        }
        return;
      }

      if (deltaX > 0) {
        this._blockedRightContacts += 1;
      } else {
        this._blockedLeftContacts += 1;
      }
    }
  }

  private _onEndContact(self: Collider2D, other: Collider2D) {
    if (other.tag === DataType.Tag.Ground) {
      this._groundContacts = Math.max(-1, this._groundContacts - 1);
      this._isGrounded = this._groundContacts >= 0;
      return;
    }

    if (other.tag === DataType.Tag.Block) {
      const deltaX = other.node.worldPosition.x - self.node.worldPosition.x;
      const deltaY = other.node.worldPosition.y - self.node.worldPosition.y;

      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        if (deltaY <= 0) {
          this._groundContacts = Math.max(0, this._groundContacts - 1);
          this._isGrounded = this._groundContacts > 0;
        }
        return;
      }

      if (deltaX > 0) {
        this._blockedRightContacts = Math.max(
          0,
          this._blockedRightContacts - 1,
        );
      } else {
        this._blockedLeftContacts = Math.max(0, this._blockedLeftContacts - 1);
      }
    }
  }

  private _updateMovement() {
    const v = this._rb.linearVelocity;

    if (
      (this.moveDir === MoveDir.Right && this._blockedRightContacts > 0) ||
      (this.moveDir === MoveDir.Left && this._blockedLeftContacts > 0)
    ) {
      v.x = 0;
    } else {
      v.x = this.moveDir * this.moveSpeed;
    }

    this._rb.linearVelocity = v;
    this.camera.node.setPosition(
      Math.min(Math.max(this.player.getPosition().x, 0), 1920),
      this.camera.node.getPosition().y,
      this.camera.node.getPosition().z,
    );
    if (this.moveDir !== MoveDir.Stop) {
      this.player.setScale(this.moveDir, 1, 1);
    }
  }

  // TODO: 移動時會持續更新 Start/End Contact，導致 isGrounded 狀態不固定 (持續 false)，需修正。
  private _updateAnimation() {
    if (!this._isGrounded) {
      return;
    }

    if (this.moveDir === MoveDir.Stop) {
      this._playAnim(this.idleAnim);
    } else {
      this._playAnim(this.walkAnim);
    }
  }

  private _playAnim(name: string) {
    if (this._currentState === name) {
      return;
    }
    this._currentState = name;
    this._anim.play(name);
  }
}

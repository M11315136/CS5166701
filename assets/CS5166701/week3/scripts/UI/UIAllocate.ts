import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("UIAllocate")
export class UIAllocate extends Component {
  @property(Node)
  public readonly camera: Node = null;

  protected update() {
    // 將 UI 節點的位置更新為相機的位置，使其始終跟隨相機
    this.node.setWorldPosition(this.camera.getWorldPosition());
  }
}

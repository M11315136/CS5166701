import { _decorator, Component, Node,Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('winBoard')
export class winBoard extends Component {
    @property(Button)
    public restartBtn: Button = null;
    start() {
        this.restartBtn.node.on('click', this._Close, this);
    }

    private _Close(){
        this.node.active = false;
    }
}



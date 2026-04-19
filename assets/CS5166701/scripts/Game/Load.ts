import { _decorator, Component, ProgressBar, Button, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Load')
export class Load extends Component {

    @property(ProgressBar)
    public progressBar: ProgressBar = null;

    @property(Button)
    public startBtn: Button = null;

    @property({ type: Number })
    public speed: number = 0.01;

    protected start () {
        if (this.progressBar) this.progressBar.progress = 0;
        if (this.startBtn) {
            this.startBtn.node.active = false;
            this.startBtn.node.on('click', this._onStart, this);
        }

        this.schedule(this._tick, 0.02);
    }

    private _tick () {
        if (!this.progressBar) return;
        this.progressBar.progress += this.speed;
        if (this.progressBar.progress >= 1) {
            this.progressBar.progress = 1;
            this.progressBar.node.active = false;
            if (this.startBtn) this.startBtn.node.active = true;
            this.unschedule(this._tick);
        }
    }

    private _onStart () {
        director.loadScene('Game');
    }


}



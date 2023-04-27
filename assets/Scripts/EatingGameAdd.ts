const { ccclass, property } = cc._decorator;

@ccclass
export default class EatingGameAdd extends cc.Component {
    private anim: cc.Animation;
    private add: cc.AnimationState;
    protected onLoad(): void {
        this.anim = this.node.getComponent(cc.Animation);
        this.add = this.anim.getAnimationState("Add");
    }
    protected update(dt: number): void {
        if (!this.add.isPlaying) this.node.destroy();
    }
}

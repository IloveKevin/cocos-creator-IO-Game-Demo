import RoleBase from "./Base/RoleBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends RoleBase {
    public static Instance: Player;

    private inputDir: cc.Vec2 = cc.Vec2.ZERO;
    private moveDir: cc.Vec2;
    public speed: number = 300;

    onLoad() {
        super.onLoad();
        this.Ai = false;
        Player.Instance = this;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.OnKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.OnKeyUp, this);
    }

    private OnKeyDown(e: cc.Event.EventKeyboard) {
        switch (e.keyCode) {
            case cc.macro.KEY.a:
                this.inputDir.x = -1
                break;
            case cc.macro.KEY.d:
                this.inputDir.x = +1
                break;
            case cc.macro.KEY.w:
                this.inputDir.y = +1
                break;
            case cc.macro.KEY.s:
                this.inputDir.y = -1
                break;
        }
    }

    private OnKeyUp(e: cc.Event.EventKeyboard) {
        switch (e.keyCode) {
            case cc.macro.KEY.a:
                if (-1 == this.inputDir.x) this.inputDir.x = 0
                break;
            case cc.macro.KEY.d:
                if (+1 == this.inputDir.x) this.inputDir.x = 0
                break;
            case cc.macro.KEY.w:
                if (+1 == this.inputDir.y) this.inputDir.y = 0
                break;
            case cc.macro.KEY.s:
                if (-1 == this.inputDir.y) this.inputDir.y = 0
                break;
        }
    }

    private Move(dt: number) {
        this.moveDir = this.inputDir.normalize();
        this.node.x += this.moveDir.x * this.speed * dt;
        this.node.y += this.moveDir.y * this.speed * dt;
    }

    private UpdateRotation() {
        if (cc.Vec2.ZERO.equals(this.moveDir)) return;
        let rotation = (this.moveDir.angle(cc.Vec2.UP) * 180) / Math.PI;
        if (this.moveDir.x < 0) {
            rotation = -rotation;
        }
        this.node.angle = -rotation;
    }

    update(dt) {
        this.Move(dt);
        this.UpdateRotation();
    }
}

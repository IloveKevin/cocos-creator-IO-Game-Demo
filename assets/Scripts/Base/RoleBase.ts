// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Boy from "../Boy";
import BoyManager from "../BoyManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoleBase extends cc.Component {
    protected Ai: boolean = true;//是否是电脑
    protected boyManager: BoyManager;
    protected roleLevel: number = 1;
    onLoad() {
        this.boyManager = new BoyManager(this);
    }

    public GetLevel() {
        return this.roleLevel;
    }

    public SetLevel(level: number) {
        this.roleLevel = level;
    }

    public GetBoyManager() {
        return this.boyManager;
    }

    onCollisionStay(other: cc.Collider, self: cc.Collider) {
        let otherBoy = other.node.getComponent(Boy)
        let otherRole = other.node.getComponent(RoleBase)
        if (null != otherBoy) {
            //检测到一个boy
            if (null == otherBoy.GetRole()) this.boyManager.AddBoy(otherBoy);
            else if (otherBoy.GetRole().GetLevel() < this.roleLevel) {
                this.boyManager.AddBoy(otherBoy);
                otherBoy.GetRole().GetBoyManager().DeleteBoy(otherBoy);
            }
        }
        if (null != otherRole && otherRole.GetLevel() < this.roleLevel) {
            //碰到另一个角色,且它的等级更小
            let boy = otherRole.GetBoyManager().GetBoy()
            if (null != boy) {
                //另一个角色还有boy
                otherRole.GetBoyManager().DeleteBoy(boy);
                this.boyManager.AddBoy(boy);
            }
            else {
                //另一个角色没有boy
                otherRole.RoleDeath();
            }
        }
    }

    public RoleDeath() {
        //角色死亡
    }

    update(dt) {
        if (this.Ai)
            this.SetLevel(2);
    }
}

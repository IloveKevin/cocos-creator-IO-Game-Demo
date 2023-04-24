import RoleBase from "./Base/RoleBase";
import Boy from "./Boy";

export default class BoyManager {
    private role: RoleBase;
    private firstRBoyCount: number = 9;
    private firshRoundR = 40;
    private roundR = 20;
    private boys: Boy[] = [];
    private level: number = 1;
    constructor(role: RoleBase) {
        this.role = role;
    }

    public AddBoy(boy: Boy) {
        if (-1 != this.HasBoy(boy)) return;
        this.boys.push(boy);
        boy.node.getChildByName("Visual").children.forEach((v) => {
            v.destroy();
        })
        let visual = cc.instantiate(this.role.visualPrefab);
        visual.setParent(boy.node.getChildByName("Visual"));
        visual.setPosition(0, 0);
        this.SortBoy();
    }

    private HasBoy(boy: Boy): number {
        let j = -1;
        for (let i = 0; i < this.boys.length; i++) {
            if (this.boys[i] == boy) j = i;
        }
        return j;
    }

    public GetBoy() {
        let boy: Boy = null;
        if (this.boys.length > 0) boy = this.boys[this.boys.length - 1];
        return boy;
    }

    public DeleteBoy(boy: Boy) {
        for (let i = 0; i < this.boys.length; i++) {
            if (this.boys[i] == boy) this.boys.splice(i, 1);
        }
        this.SortBoy();
    }

    private SortBoy() {
        for (let i = 1; i <= this.boys.length; i++) {
            this.boys[i - 1].ChangeTarget(this.role, this.GetPosById(i));
        }
        this.role.SetLevel(this.level);
    }
    private GetPosById(id: number) {
        this.level = 1;
        id = Math.floor(id);
        let r = this.firshRoundR;
        let l = 2 * r * Math.PI / this.firstRBoyCount;
        let angle = l * 180 / (Math.PI * r);
        for (; angle * id > 360;) {
            this.level++;
            id = id - Math.floor(360 / angle);
            r += this.roundR;
            angle = l * 180 / (Math.PI * r);
        }
        return this.GetInRoundPos(r, angle * id);
    }

    private GetInRoundPos(r: number, angle: number): cc.Vec2 {
        let y = Math.cos(Math.PI / 180 * angle) * r;
        let x = Math.sqrt(r * r - y * y);
        if (angle > 180) x = -x;
        return cc.v2(x, y);
    }
}
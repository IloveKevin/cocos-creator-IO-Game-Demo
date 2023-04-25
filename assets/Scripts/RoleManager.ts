import RoleBase from "./Base/RoleBase";
import EatingUtil from "./EatingUtil";

export default class RoleManager {
    private roles: RoleBase[] = [];

    public GetRoles(): RoleBase[] {
        return this.roles;
    }

    public AddRole(role: RoleBase) {
        if (!this.HasRole(role)) this.roles.push(role);
    }

    public DeleteRole(role: RoleBase) {
        for (let i = 0; i < this.roles.length; i++) {
            if (role == this.roles[i]) this.roles.splice(i, 1);
        }
    }

    public ClearRole() {
        this.roles = [];
    }

    private HasRole(role: RoleBase): boolean {
        let has = false;
        this.roles.forEach((value) => {
            if (value == role) has = true;
        })
        return has;
    }

    public UpdateRoleEat() {
        for (let i = 0; i < this.roles.length; i++) {
            for (let j = 0; j < this.roles.length; j++) {
                if (this.roles[i] == this.roles[j]) continue;
                this.RoleAEatRoleB(this.roles[i], this.roles[j]);
            }
        }
    }

    private RoleAEatRoleB(roleA: RoleBase, roleB: RoleBase) {
        if (!cc.isValid(roleA) || !cc.isValid(roleB)) return;
        if (roleA.GetLevel() > roleB.GetLevel()) {
            for (let i = 0; i < roleA.eatingRole.length; i++) {
                if (!cc.isValid(roleA.eatingRole[i])) roleA.eatingRole.slice(i, 1);
                if (roleA.eatingRole[i] == roleB && (null == roleB.beEatingRole || roleA == roleB.beEatingRole) && EatingUtil.GetAB(roleA.Ai, roleB.Ai)) {
                    roleB.beEatingRole = roleA;
                    return;
                }
            }
            for (let i = 0; i < roleA.eatingBoy.length; i++) {
                if (!cc.isValid(roleA.eatingBoy[i])) roleA.eatingBoy.slice(i, 1);
                if (roleA.eatingBoy[i].GetRole() == roleB && (null == roleB.beEatingRole || roleA == roleB.beEatingRole) && EatingUtil.GetAB(roleA.Ai, roleB.Ai)) {
                    roleB.beEatingRole = roleA;
                    return;
                }
            }
            if (roleA == roleB.beEatingRole) roleB.beEatingRole = null;
        }
        else {
            if (roleA == roleB.beEatingRole) roleB.beEatingRole = null;
        }
    }
}

import RoleBase from "./Base/RoleBase";

export default class RoleManager {
    private role: RoleBase[] = [];

    public AddRole(role: RoleBase) {
        if (!this.HasRole(role)) this.role.push(role);
    }

    public DeleteRole(role: RoleBase) {
        for (let i = 0; i < this.role.length; i++) {
            if (role == this.role[i]) this.role.splice(i, 1);
        }
    }

    public ClearRole() {
        this.role = [];
    }

    private HasRole(role: RoleBase): boolean {
        let has = false;
        this.role.forEach((value) => {
            if (value == role) has = true;
        })
        return has;
    }

    public UpdateRoleEat() {
        for (let i = 0; i < this.role.length; i++) {
            for (let j = 0; j < this.role.length; j++) {
                if (this.role[i] == this.role[j]) continue;
                this.RoleAEatRoleB(this.role[i], this.role[j]);
            }
        }
    }

    private RoleAEatRoleB(roleA: RoleBase, roleB: RoleBase) {
        if (roleA.GetLevel() > roleB.GetLevel()) {
            for (let i = 0; i < roleA.eatingRole.length; i++) {
                if (cc.isValid(roleA.eatingRole[i])) roleA.eatingRole.slice(i, 1);
                if (roleA.eatingRole[i] == roleB && (null == roleB.beEatingRole || roleA == roleB.beEatingRole)) {
                    roleB.beEatingRole = roleA;
                    return;
                }
            }
            for (let i = 0; i < roleA.eatingBoy.length; i++) {
                if (cc.isValid(roleA.eatingBoy[i])) roleA.eatingBoy.slice(i, 1);
                if (roleA.eatingBoy[i].GetRole() == roleB && (null == roleB.beEatingRole || roleA == roleB.beEatingRole)) {
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

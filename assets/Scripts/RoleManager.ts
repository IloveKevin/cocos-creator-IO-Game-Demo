export default class RpleManager {
    public visualPrefabs: cc.Prefab[] = [];
    private RoleCount: number = 5;
    constructor(prefabs: cc.Prefab[]) {
        this.visualPrefabs = prefabs;
    }

    private UpdateRoleLevel() { }
}

import EatingGameConfig from "./EatingGameConfig";

export enum nodePoolEnum {
    role,
    boy,
    playerVisual,
    enemyVisual,
}
export default class EatingNodePool {
    private nodePool: Map<nodePoolEnum, cc.NodePool> = new Map<nodePoolEnum, cc.NodePool>();
    private prefabs: Map<nodePoolEnum, cc.Prefab> = new Map<nodePoolEnum, cc.Prefab>();

    public Init() {
        this.InitPut(nodePoolEnum.role, EatingGameConfig.nodePoolInitCount.role);
        this.InitPut(nodePoolEnum.boy, EatingGameConfig.nodePoolInitCount.boy);
        this.InitPut(nodePoolEnum.playerVisual, EatingGameConfig.nodePoolInitCount.playerVisual);
        this.InitPut(nodePoolEnum.enemyVisual, EatingGameConfig.nodePoolInitCount.enemyVisual);
    }

    private InitPut(nodePoolName: nodePoolEnum, count: number) {
        for (let i = 0; i < count; i++) {
            let prefab = this.prefabs.get(nodePoolName);
            let node = cc.instantiate(prefab);
            this.PutNode(nodePoolName, node);
        }
    }

    public CreatNodePool(nodePoolName: nodePoolEnum, prefab: cc.Prefab) {
        let newNodePool: cc.NodePool = new cc.NodePool();
        this.nodePool.set(nodePoolName, newNodePool);
        this.prefabs.set(nodePoolName, prefab);
    }

    public PutNode(nodePoolName: nodePoolEnum, node: cc.Node) {
        let a = Date.now();
        this.nodePool.get(nodePoolName).put(node);
        console.log("执行一次put的时间", Date.now() - a);
    }

    public GetNode(nodePoolName: nodePoolEnum): cc.Node {
        let pool = this.nodePool.get(nodePoolName);
        if (pool.size() > 1) {
            return pool.get();
        }
        return cc.instantiate(this.prefabs.get(nodePoolName));
    }

    public ClearPool() {
        while (!this.nodePool.values().next().done)
            this.nodePool.values().next().value.clear();
    }
}

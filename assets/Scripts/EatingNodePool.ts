import EatingGameConfig from "./EatingGameConfig";

export enum nodePoolEnum {
    role,
    boy,
    boyVisual,
    playerVisual,
    level1Visual,
    level2Visual,
    level3Visual,
    level4Visual,
    level5Visual,
    level6Visual,
    level7Visual,
    level8Visual,
    level9Visual,
    level10Visual,
}
export default class EatingNodePool {
    private nodePool: Map<nodePoolEnum, cc.NodePool> = new Map<nodePoolEnum, cc.NodePool>();
    private prefabs: Map<nodePoolEnum, cc.Prefab> = new Map<nodePoolEnum, cc.Prefab>();

    public Init() {
        this.InitPut(nodePoolEnum.role, EatingGameConfig.nodePoolInitCount.role);
        this.InitPut(nodePoolEnum.boy, EatingGameConfig.nodePoolInitCount.boy);
        this.InitPut(nodePoolEnum.boyVisual, EatingGameConfig.nodePoolInitCount.boy)
        this.InitPut(nodePoolEnum.playerVisual, EatingGameConfig.nodePoolInitCount.playerVisual);
        this.InitPut(nodePoolEnum.level1Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level2Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level3Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level4Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level5Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level6Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level7Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level8Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level9Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
        this.InitPut(nodePoolEnum.level10Visual, EatingGameConfig.nodePoolInitCount.enemyVisual);
    }

    private InitPut(nodePoolName: nodePoolEnum, count: number) {
        for (let i = 0; i < count; i++) {
            let prefab = this.prefabs.get(nodePoolName);
            let node = cc.instantiate(prefab);
            this.PutNode(nodePoolName, node);
        }
    }

    public GetVisualNodePool(level: number): nodePoolEnum {
        switch (level) {
            case 1:
                return nodePoolEnum.level1Visual;
            case 2:
                return nodePoolEnum.level2Visual;
            case 3:
                return nodePoolEnum.level3Visual;
            case 4:
                return nodePoolEnum.level4Visual;
            case 5:
                return nodePoolEnum.level5Visual;
            case 6:
                return nodePoolEnum.level6Visual;
            case 7:
                return nodePoolEnum.level7Visual;
            case 8:
                return nodePoolEnum.level8Visual;
            case 9:
                return nodePoolEnum.level9Visual;
            case 10:
                return nodePoolEnum.level10Visual;
            default:
                return nodePoolEnum.boyVisual;
        }
    }

    public CreatNodePool(nodePoolName: nodePoolEnum, prefab: cc.Prefab, scriptString: string = "") {
        let newNodePool: cc.NodePool = new cc.NodePool(scriptString);
        this.nodePool.set(nodePoolName, newNodePool);
        this.prefabs.set(nodePoolName, prefab);
    }

    public PutNode(nodePoolName: nodePoolEnum, node: cc.Node) {
        let a = Date.now();
        this.nodePool.get(nodePoolName).put(node);
        // console.log("执行一次put的时间", Date.now() - a);
    }

    public GetNode(nodePoolName: nodePoolEnum): cc.Node {
        let pool = this.nodePool.get(nodePoolName);
        if (pool.size() > 1) {
            return pool.get();
        }
        pool.put(cc.instantiate(this.prefabs.get(nodePoolName)));
        return pool.get();
    }

    public ClearPool() {
        let values = this.nodePool.values();
        let next = values.next();
        while (!next.done) {
            next.value.clear();
            next = values.next();
        }
    }
}

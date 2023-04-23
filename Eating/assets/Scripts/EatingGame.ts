const { ccclass, property } = cc._decorator;

@ccclass
export default class EatingGame extends cc.Component {
    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
    }
}

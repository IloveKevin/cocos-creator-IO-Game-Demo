const { ccclass, property } = cc._decorator;

@ccclass
export default class EatingGameSounds extends cc.Component {
    @property(cc.AudioClip)
    eatingClip: cc.AudioClip = null;

    public PlayEatingClip() {
        cc.audioEngine.playEffect(this.eatingClip, false);
    }
}

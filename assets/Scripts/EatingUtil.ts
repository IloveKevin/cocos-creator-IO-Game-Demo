export default class EatingUtil {
    public static Lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }

    //仅当AB中有一个为真时返回真
    public static GetAB(a: boolean, b: boolean): boolean {
        return !(a && b) && !(!a && !b);
    }
}

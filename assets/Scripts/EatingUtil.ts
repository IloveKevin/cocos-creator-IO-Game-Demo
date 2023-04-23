export default class EatingUtil {
    public static Lerp(a: number, b: number, t: number) {
        return a + (b - a) * (1 - t);
    }
}

export class UidUtils {
  static uid(): string {
    return Math.random().toString(36).slice(2, 9);
  }
}

export class FileUtil {
  /**
   *
   * @param exts ['image/.png', image/.jpeg', ...]
   * @returns
   */
  static async upload(exts: string[]): Promise<File> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = exts.join(",");
    return new Promise((resolve) => {
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          resolve(file);
        }
      };
      input.click();
    });
  }
}

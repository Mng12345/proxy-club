import * as fsp from 'fs/promises'
import * as path from 'path'

export class FileUtils {
  static async isFileExists(filePath: string): Promise<boolean> {
    try {
      await fsp.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  static getDir(filePath: string): string {
    const dir = path.parse(filePath);
    return dir.dir
  }
}

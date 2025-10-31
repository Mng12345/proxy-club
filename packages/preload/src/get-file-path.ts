import { webUtils } from "electron"

export const getFilePath = (file: File): string => {
  return webUtils.getPathForFile(file)
}

import { app } from 'electron'
import { ModuleResult, type Result } from 'mng-base/dist/result.js'
import path from 'path'
import shell from 'shelljs'
import { FileUtils } from '../utils/FileUtils.js'
import * as fs from 'fs'
import unzipper from 'unzipper'

export type Platform = 'amd64' | 'arm64'

const getPlatformStr = (platform: Platform): string => {
  switch (platform) {
    case 'amd64': {
      return 'manylinux2014_x86_64'
    }
    case 'arm64': {
      return 'manylinux2014_aarch64'
    }
  }
}

const {exec} = shell

export const rePkgDifyPlugin = async (filePath: string, platform: Platform): Promise<Result<void, string>> => {
  const dockerExisted = await checkDockerExisted()
  if (!dockerExisted) {
    return ModuleResult.err<void, string>('Docker 未安装，请确保docker安装完成后使用本软件')
  }
  let info: path.ParsedPath
  try {
    info = path.parse(filePath)
  } catch (e) {
    return ModuleResult.err<void, string>(`无效的文件路径: ${filePath}`)
  }
  if (!await checkRepackageImageExisted()) {
    const tarFilePath = await unpackRepackageImage()
    if (tarFilePath.type === 'err') {
      return tarFilePath
    }
    const loadResult = await loadTarImage(tarFilePath.value)
    if (loadResult.type === 'err') {
      return loadResult
    }
  }

  const dir = info.dir
  const name = info.name
  const ext = info.ext
  const repackagedNameWithPlatform = `${name}-offline-${platform}`
  const rePkgPromise = new Promise<void>((resolve, reject) => {
    const cmd = `docker run --network host --rm -v ${dir}:/pkg dify-plugin-repackaging:latest bash -c " ./plugin_repackaging.sh  -p ${getPlatformStr(platform)} local /pkg/${name}${ext} && mv ./${name}.difypkg /pkg/${repackagedNameWithPlatform}.difypkg"`
    console.log(`execute command: ${cmd}`)
    exec(cmd, (code, stdout, stderr) => {
      if (code === 0) {
        resolve()
      } else {
        reject(stderr)
      }
    })
  })
  try {
    await rePkgPromise
    return ModuleResult.ok<void, string>(undefined)
  } catch (e) {
    return ModuleResult.err<void, string>(`转换失败: ${e}`)
  }
}

const checkDockerExisted = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec('docker -v', (code, stdout, stderr) => {
      if (code === 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const checkRepackageImageExisted = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec('docker image ls', (code, stdout, stderr) => {
      if (code === 0) {
        const lines = stdout.split('\n')
        const rePkgImage = lines.find(line => line.includes('dify-plugin-repackaging'))
        if (rePkgImage) {
          resolve(true)
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    })
  })
}

const unpackRepackageImage = async (): Promise<Result<string, string>> => {
  const userDir = app.getPath('home')
  const tarDirPath = path.resolve(userDir, 'dify-repackage')
  const tarFilePath = path.resolve(tarDirPath, 'dify-plugin-repackaging.tar')
  // console.log(`env: `, process.env)
  let zipFilePath: string
  if (process.env.MODE === 'development') {
    zipFilePath = path.join(process.cwd(), 'images', 'dify-plugin-repackaging.zip')
  } else {
    zipFilePath = path.join(process.cwd(), 'resources', 'images', 'dify-plugin-repackaging.zip')
  }

  if (!await FileUtils.isFileExists(zipFilePath)) {
    return ModuleResult.err<string, string>('缺少插件打包镜像文件')
  }
  if (await FileUtils.isFileExists(tarFilePath)) {
    return  ModuleResult.ok<string, string>(tarFilePath)
  }
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath).pipe(unzipper.Extract({path: tarDirPath}))
      .addListener('close', () => {
        resolve(ModuleResult.ok<string, string>(tarFilePath))
      })
      .addListener('error', err => {
        resolve(ModuleResult.err<string, string>(`解压失败: ${err}`))
      })
  })
}

const loadTarImage = async (tarFilePath: string): Promise<Result<void, string>> => {
  const imageExisted = await checkRepackageImageExisted()
  if (imageExisted) {
    return ModuleResult.ok<void, string>(undefined)
  }
  const loadPromise = new Promise<void>((resolve, reject) => {
    const cmd = `docker load -i ${tarFilePath}`
    console.log(`execute command: ${cmd}`)
    exec(cmd, (code, stdout, stderr) => {
      if (code === 0) {
        resolve()
      } else {
        reject(stderr)
      }
    })
  })
  try {
    await loadPromise
    return ModuleResult.ok<void, string>(undefined)
  } catch (e) {
    return ModuleResult.err<void, string>(`加载镜像失败: ${e}`)
  }
}

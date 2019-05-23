import {
  composite,
  formatBaseData,
  initialDataBase,
  initialIDData,
  parseCompositeOpts,
  parseDeviceOpts,
  testWrite,
  validateDllFile,
  DataBase,
  IDData,
  Options,
} from '@waiting/idcard-reader-base'
import { info } from '@waiting/log'
import {
  fileExists,
  isFileExists,
  join,
} from '@waiting/shared-core'
import * as ffi from 'ffi'
import {
  of,
  Observable,
} from 'rxjs'
import {
  catchError,
  delay,
  map,
  mergeMap,
  retry,
  tap,
  timeout,
} from 'rxjs/operators'

import {
  dllFuncs,
} from './config'
import { disconnectDevice, findDeviceList, readAll } from './device'
import { Device } from './model'


export async function init(options: Options): Promise<Device[]> {
  const deviceOpts = parseDeviceOpts(options)
  const compositeOpts = parseCompositeOpts(options)
  // 先清空 解决头像图片生成可能失败问题
  // compositeOpts.fontHwxhei = ''
  // compositeOpts.fontOcrb = ''
  // compositeOpts.fontSimhei = ''

  const { debug } = deviceOpts

  if (debug) {
    info(compositeOpts)
    info(deviceOpts)
  }

  await validateDllFile(deviceOpts.dllTxt)
  // 允许 未指定照片解码dll
  if (deviceOpts.dllImage && compositeOpts.useComposite && ! await isFileExists(deviceOpts.dllImage)) {
    throw new Error('File not exists: ' + deviceOpts.dllImage)
  }
  await testWrite(deviceOpts.imgSaveDir)
  const apib = ffi.Library(deviceOpts.dllTxt, dllFuncs)
  const devices = findDeviceList(deviceOpts, compositeOpts, apib)

  if (devices && devices.length) {
    return devices
  }
  else {
    throw new Error('未找到读卡设备')
  }
}

/** Read card data */
export function read(device: Device): Promise<IDData> {
  if (device.openPort) {
    try {
      disconnectDevice(device)
    }
    catch (ex) {
      throw ex
    }

    const text$ = of(readAll(device))
    const iddata$: Observable<IDData> = text$.pipe(
      retry(device.deviceOpts.findCardRetryTimes),
      map(text => {
        const base = pickFields(text)
        const imagePath = device.compositeOpts.useComposite
          ? genAvatarPath(device.deviceOpts.imgSaveDir, base.idc)
          : ''
        const ret: IDData = {
          ...initialIDData,
          base,
          imagePath,  // 头像
        }

        return ret
      }),
    )
    const ret$ = iddata$.pipe(
      delay(device.compositeOpts.useComposite ? 300 : 0),
      tap(() => {
        disconnectDevice(device)
      }),
      mergeMap(data => {
        return fileExists(data.imagePath).pipe(
          map(path => {
            data.imagePath = path
            return data
          }),
        )
      }),
      mergeMap(data => {
        return !device.compositeOpts.useComposite || !data.imagePath
          ? of(data)
          : composite(data.imagePath, <DataBase> data.base, device.compositeOpts).pipe(
            map(imgPath => {
              data.compositePath = imgPath
              return data
            }),
          )
      }),
      timeout(20000),
      catchError((err: Error) => {
        disconnectDevice(device)
        throw err
      }),
    )

    return ret$.toPromise()
  }
  else {
    throw new Error('设备端口未指定')
  }
}


/** Pick fields from origin text */
function pickFields(text: string): DataBase {
  const base: DataBase = { ...initialDataBase }

  if (!text || !text.length) {
    return base
  }

  /** 姓名|身份证号|性别|民族|出生年月|住址|签发机关|起始日期|截至日期 */
  const arr = text.split('|')

  if (arr.length === 9) {
    base.name = arr[0].trim()
    base.idc = arr[1]
    base.genderName = arr[2]
    base.nationName = arr[3]
    base.birth = arr[4]
    base.address = arr[5].trim()
    base.regorg = arr[6].trim()
    base.startdate = arr[7]
    base.enddate = arr[8]
  }

  return formatBaseData(base)
}


export function genAvatarPath(imgSaveDir: string, idc: string): string {
  const path = join(imgSaveDir, `${idc}.bmp`)
  return path
}

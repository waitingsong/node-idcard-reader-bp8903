import { info } from '@waiting/log'
import { dirname, normalize } from '@waiting/shared-core'
import * as iconv from 'iconv-lite'

import { Device } from './model'


export function connectDevice(device: Device, port: number): number {
  if (device && device.inUse) {
    device.deviceOpts.debug && info('Cautiton: connectDevice() device in use')
    return 0
  }
  const openRet = device.apib.OpenCom(port, Buffer.from(''), 9600, 1)
  device.deviceOpts.debug && info(`open com ret: ${openRet}`)

  return openRet === 0 ? port : 0
}

export function disconnectDevice(device: Device): boolean {
  const ret = device.apib.CloseCom()
  device.deviceOpts.debug && info(`disconnectDevice at port: ${device.openPort}, ret: ${ret} `)
  device.inUse = false
  return true
}


export function findDeviceList(
  deviceOpts: Device['deviceOpts'],
  compositeOpts: Device['compositeOpts'],
  apib: Device['apib'],
): Device[] {

  const arr: Device[] = []

  if (deviceOpts.port > 0) {
    const device = findDevice(deviceOpts.port, deviceOpts, compositeOpts, apib)

    if (device.openPort > 0) {
      arr.push(device)
    }
  }
  else {
    // 检测串口. bp8903 为串口接口
    for (let i = 1; i <= 16; i++) {
      const device = findDevice(i, deviceOpts, compositeOpts, apib)

      if (device.openPort > 0) {
        arr.push(device)
        if (!deviceOpts.searchAll) {
          break
        }
      }
    }
  }

  return arr
}

export function findDevice(
  openPort: Device['openPort'],
  deviceOpts: Device['deviceOpts'],
  compositeOpts: Device['compositeOpts'],
  apib: Device['apib'],
): Device {

  const device: Device = {
    apib,
    deviceOpts,
    compositeOpts,
    inUse: false,
    openPort: 0,
  }

  const port = connectDevice(device, openPort)
  if (port > 0) {
    device.inUse = true
    device.openPort = port
    deviceOpts.debug && info(`Found device at serial/usb port: ${port}`)
    disconnectDevice(device)
  }

  return device
}


/** 读取二代证基础信息 */
export function readAll(device: Device): string {
  const path = dirname(device.deviceOpts.dllTxt)
  process.env.PATH = `${process.env.PATH};${path}`

  const buf = Buffer.alloc(10240)
  const srcDir = path.replace(/\\/g, '/') + '/'
  const targetPath = normalize(device.deviceOpts.imgSaveDir + '/').replace(/\\/g, '/')

  if (device.deviceOpts.debug) {
    info('starting reading readCard ret')
    info('IDCard_GetInformation() src path:' + srcDir)
    info('IDCard_GetInformation() target path:' + targetPath)
  }

  const code = device.apib.IDCard_GetInformation(
    device.openPort,
    9600,
    Buffer.from(''),
    3,
    buf,
    Buffer.from(srcDir),
    Buffer.from(targetPath),
  )
  const ret = iconv.decode(buf, 'gbk')

  if (device.deviceOpts.debug) {
    info(`readDataBase code: ${code}`)
    info(`readDataBase bufLen: ${buf.byteLength}`)
    info(`readDataBase ret: ${ret}`)
    // info(buf.slice(80))
  }

  return ret.replace(/\0/g, '')
}

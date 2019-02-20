import {
  CompositeOpts, DeviceOpts,
} from '@waiting/idcard-reader-base'

/** MantianICRead.dll 接口方法类型 */
export interface DllFuncsModel {
  /** 查找设备并打开端口 0: 成功 */
  OpenCom(port: number, gate: Buffer, baud: number, timeout: number): number
  CloseCom(): void

  /** 读取二代证信息 */
  IDCard_GetInformation(
    /** 设备连接的端口号 */
    port: number,
    /** 设备的波特率 */
    baud: number,
    /** 设备连接的扩展盒端口 */
    gate: Buffer,
    /** 设备的超时时间(s) */
    timeout: number,
    /** 获取到的信息,每个字段之间用'|'号分隔 "姓名|身份证号|性别|民族|出生年月|住址|签发机关|起始日期|截至日期 */
    info: Buffer,
    /** WltRS.dll及A.bmp,B.bmp资源文件的存放路径,为NULL,""表示不需要照片 */
    srcdir: Buffer,
    /** 生成的身份证图片路径 头像照片为:身份证号.bmp 正面图片:身份证号_A.bmp 反面图片:身份证号_B.bmp */
    bmpdir: Buffer,
  ): number

  // PowerOff(): number
  // PowerOn(): number
}

/** WltRS.dll 接口方法类型 */
export interface WltRsModel {
  /** 读取头像照片 */
  GetBmp(fileName: string, intf: number): number
}


// 读卡设置
export interface Device {
  apib: DllFuncsModel
  // apii: WltRsModel | null
  deviceOpts: DeviceOpts
  compositeOpts: CompositeOpts
  /** device in use */
  inUse: boolean
  openPort: number
}

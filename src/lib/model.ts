import {
  Device as DeviceBase,
} from '@waiting/idcard-reader-base'
import { DModel as M, FModel as FM } from 'win32-def'


/** MantianICRead.dll 接口方法类型 */
export interface DllFuncsModel extends FM.DllFuncsModel {
  /** 查找设备并打开端口 0: 成功 */
  OpenCom(port: M.UINT, gate: M.POINT, baud: M.INT32, timeout: M.INT32): M.INT32
  CloseCom(): M.INT32

  /** 读取二代证信息 */
  IDCard_GetInformation(
    /** 设备连接的端口号 */
    port: M.INT32,
    /** 设备的波特率 */
    baud: M.INT32,
    /** 设备连接的扩展盒端口 */
    gate: M.POINT,
    /** 设备的超时时间(s) */
    timeout: M.INT32,
    /** 获取到的信息,每个字段之间用'|'号分隔 "姓名|身份证号|性别|民族|出生年月|住址|签发机关|起始日期|截至日期 */
    info: M.POINT,
    /** WltRS.dll及A.bmp,B.bmp资源文件的存放路径,为NULL,""表示不需要照片 */
    srcdir: M.POINT,
    /** 生成的身份证图片路径 头像照片为:身份证号.bmp 正面图片:身份证号_A.bmp 反面图片:身份证号_B.bmp */
    bmpdir: M.POINT,
  ): M.INT

  // PowerOff(): M.INT
  // PowerOn(): M.INT
}

/** WltRS.dll 接口方法类型 */
// export interface WltRsModel extends FM.DllFuncsModel {
//   /** 读取头像照片 */
//   GetBmp(fileName: string, intf: number): number
// }


// 读卡设置
export interface Device extends DeviceBase {
  apib: DllFuncsModel
}

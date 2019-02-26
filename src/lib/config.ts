import {
  Config,
  IDData,
  Options,
} from '@waiting/idcard-reader-base'
import {
  join,
  tmpdir,
} from '@waiting/shared-core'
import { DTypes as W, FModel as FM } from 'win32-def'


export {
  IDData,
  Options,
}

export const config: Config = {
  appDir: '',  // update by entry point index.js
  tmpDir: join(tmpdir(), 'idcard-reader'),
}

export const dllFuncs: FM.DllFuncs = {
  OpenCom: [W.INT32, [W.INT32, W.POINT, W.INT32, W.INT32] ],   // 查找设备端口
  CloseCom: [W.INT32, [] ],
  IDCard_GetInformation: [W.INT32, [W.INT32, W.INT32, W.POINT, W.INT32, W.POINT, W.POINT, W.POINT] ],
  // PowerOff: [W.INT32, [] ],
  // PowerOn: [W.INT32, [] ],
}

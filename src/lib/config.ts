import {
  Config,
  IDData,
  Options,
} from '@waiting/idcard-reader-base'
import {
  join,
  tmpdir,
} from '@waiting/shared-core'
import { FModel as FM } from 'win32-def'


export {
  IDData,
  Options,
}

export const config: Config = {
  appDir: '',  // update by entry point index.js
  tmpDir: join(tmpdir(), 'idcard-reader'),
}

export const dllFuncs: FM.DllFuncs = {
  OpenCom: ['int', ['int', 'pointer', 'int', 'int'] ],   // 查找设备端口
  CloseCom: ['int', [] ],
  IDCard_GetInformation: ['int', ['int', 'int', 'pointer', 'int', 'pointer', 'pointer', 'pointer'] ],
  // PowerOff: ['int', [] ],
  // PowerOn: ['int', [] ],
}

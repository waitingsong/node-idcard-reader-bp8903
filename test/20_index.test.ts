/// <reference types="mocha" />

import { Options } from '@waiting/idcard-reader-base'
import { basename, join } from 'path'
import * as assert from 'power-assert'
import { merge, of, EMPTY } from 'rxjs'

import * as idcr from '../src/index'
// import * as idcr from '../dist/index.cjs'


const filename = basename(__filename)

describe(filename, () => {
  it('Should read() works', async () => {
    const opts: Options = {
      dllTxt: 'd:/idcard-drv/MantianICRead.dll',
      dllImage: 'd:/idcard-drv/wltrs.dll',
      useComposite: true, // 解码头像可能失败
      // fontHwxhei: 'c:/Windows/Fonts/hwxhei.ttf',
      // fontOcrb: 'c:/Windows/Fonts/ocrb10bt.ttf',
      // fontSimhei: 'c:/Windows/Fonts/simhei.ttf',
      debug: false,
    }

    try {
      const devices = await idcr.init(opts)
      if (! devices.length) {
        assert(false, 'No device found')
        return
      }

      const device = devices[0]
      const ret = await idcr.read(device).toPromise()

      console.info(ret)
      assert(!! ret, 'IDData invalid')
      assert(ret && ret.base && ret.base.name, 'name of IDData empty')
      assert(ret && ret.base && ret.base.idc, 'idc of IDData empty')
      // assert(ret && ret.base && ret.compositePath, 'composite image path empty')
    }
    catch (ex) {
      assert(false, ex)
    }
  })
})

import { config } from './lib/config'

// base directory of this module
config.appDir = __dirname + '/..'

export * from './lib/index'
export * from './lib/model'
export {
  initialCompositeOpts,
  initialOpts,
  nationMap,
} from '@waiting/idcard-reader-base'

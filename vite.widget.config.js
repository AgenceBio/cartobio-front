import { defineConfig } from 'vite'
import { resolve, join } from 'path'

import baseConfig from './vite.config.js'

const libConfig = {
  lib: {
    entry: resolve(join(__dirname, 'widget', 'main.js')),
    name: 'NotificationCartobio',
    fileName: (format) => `notification-cartobio.${format}.js`,
  }
}

export default defineConfig(({ mode }) => {
  const resolvedConfig = baseConfig({ mode })

  return {
    ...resolvedConfig,

    root: './widget',
    envDir: resolve(__dirname),
    publicDir: resolve(join(__dirname, 'public')),

    build: {
      ...resolvedConfig.build,

      emptyOutDir: mode === 'lib',
      outDir: resolve(join(__dirname, 'dist', 'notification-webcomponent')),
      ...(mode === 'lib' ? libConfig : {})
    }
  }
})

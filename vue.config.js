const Mode = require('frontmatter-markdown-loader/mode')
const path = require('path');

module.exports = {
    chainWebpack: config => {
      config.module
        .rule('json')
        .test(/assets\/styles\/.+.json$/)
        .use('string-replace-loader')
          .loader('string-replace-loader')
          .tap(() => {
            return {
              multiple: [
                {
                  search: '{{ VUE_APP_API_IGN }}',
                  replace: process.env.VUE_APP_API_IGN,
                  // strict: true,
                }
              ]
            }
          })
    },
    css: {
        loaderOptions: {
            sass: {
                sassOptions: {
                    includePaths: [
                        path.resolve(__dirname, './node_modules'),
                    ],
                },
            },
        },
    },

    chainWebpack: config => {
      config.module
        .rule('markdown')
        .test(/\.md$/)
        .use('frontmatter-markdown-loader')
          .loader('frontmatter-markdown-loader')
          .tap(() => ({ mode: [Mode.VUE_COMPONENT] }))
    }
};

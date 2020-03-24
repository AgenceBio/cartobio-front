const Mode = require('frontmatter-markdown-loader/mode')
const path = require('path');

module.exports = {
  chainWebpack: config => {
    // inject API Tokens in static JSON files
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

      // preserve whitespace in a smarter way
      // via https://github.com/vuejs/vue/issues/9208#issuecomment-450012518
      config.module
        .rule('vue')
        .use('vue-loader')
          .loader('vue-loader')
          .tap(options => ({...options, whitespace: 'condense'}))

      // convert imported .md files as Vue Components
      config.module
        .rule('markdown')
        .test(/\.md$/)
        .use('frontmatter-markdown-loader')
          .loader('frontmatter-markdown-loader')
          .tap(() => ({ mode: [Mode.VUE_COMPONENT] }))
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
};

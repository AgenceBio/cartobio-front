const Mode = require('frontmatter-markdown-loader/mode')
const path = require('path');

const markdown = require('markdown-it')
const mdFootnote = require('markdown-it-footnote')
const mdPrism = require('markdown-it-prism')

require('prismjs/components/prism-bash')
require('prismjs/components/prism-javascript')
require('prismjs/components/prism-json')

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

      // cf. https://hmsk.github.io/frontmatter-markdown-loader/options.html#configure-markdown-it
      const markdownIt = markdown({ linkify: true, html: true })
        .use(mdFootnote)
        .use(mdPrism)

      config.module
        .rule('markdown')
        .test(/\.md$/)
        .use('frontmatter-markdown-loader')
          .loader('frontmatter-markdown-loader')
          .tap(() => ({
            markdownIt,
            mode: [Mode.VUE_COMPONENT],
          }))
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

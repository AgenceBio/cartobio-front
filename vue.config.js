const Mode = require('frontmatter-markdown-loader/mode')
const path = require('path');

module.exports = {
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

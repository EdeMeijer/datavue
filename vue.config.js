module.exports = {
    configureWebpack: {
        externals: {
            lodash: {
                commonjs: 'lodash',
                commonjs2: 'lodash',
                amd: 'lodash',
                root: '_' // indicates global variable
            }
        }
    }
};

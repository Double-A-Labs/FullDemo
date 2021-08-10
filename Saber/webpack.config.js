const path = require('path');

module.exports = {
    mode: 'development',
    entry: {

        client: {
            import: './wwwroot/src/client/index.js',
            dependOn: 'shared'
        },
        admin: {
            import: './wwwroot/src/admin/index.js',
            dependOn: 'shared'
        },
        shared: './wwwroot/src/site.js',
    },
    output: {
        path: path.resolve(__dirname, './wwwroot/dist/'),
        filename: '[name].bundle.js'
    }
};
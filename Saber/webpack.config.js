const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        client: {
            import: './wwwroot/src/client/index.js',
        },
        admin: {
            import: './wwwroot/src/admin/index.js',
        }
    },
    output: {
        path: path.resolve(__dirname, './wwwroot/dist/'),
        filename: '[name].bundle.js'
    }
};
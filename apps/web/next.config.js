const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

/** @type {import('next').NextConfig} */
module.exports = {
    transpilePackages: ["@repo/ui", "@atlas/entt", "@atlas/engine", "multithreading"],
    webpack: (config) => {
        config.plugins.push(new NodePolyfillPlugin());

        return config;
    }
};

// rollup.config.js
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtinlist from 'builtin-modules';
import minify from 'rollup-plugin-babel-minify';

const pkg = require('./package');

export default {
  input: 'src/index.js',
  output: { file: 'index.min.js', format: 'umd', name: 'pre' },
  external: builtinlist,
  plugins: [
    babel({ include: ['node_modules/**'] }),
    resolve({ jsnext: true, main: true, preferBuiltins: false, namedExports: 'pre' }),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: [ "./index.min.js", "./node_modules/**" ], // Default: undefined

      // if true then uses of `global` won't be dealt with by this plugin
      ignoreGlobal: false, // Default: false

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false, // Default: true
    }),

    minify({
      comments: false,
      banner: `// ${pkg.name}@${pkg.version} · MIT · Francisco Presencia https://francisco.io/`,
      bannerNewLine: true
    })
  ]
};

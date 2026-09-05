import { globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { extname, relative, resolve } from 'path';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// @ts-expect-error
import packageJson from './package.json';

// 从命令行参数中提取格式信息
function getFormatFromArgs() {
  const args = process.argv;
  const formatIndex =
    args.indexOf('-f') !== -1
      ? args.indexOf('-f') + 1
      : args.indexOf('--format') !== -1
        ? args.indexOf('--format') + 1
        : -1;
  return formatIndex !== -1 && formatIndex < args.length
    ? args[formatIndex]
    : undefined;
}

const format = getFormatFromArgs() || 'es';

console.info('[build][format]', format);

// 需要外部化的裸模块标识列表。不要用 /node_modules/ 正则做 external：
// 它匹配的是解析后的绝对路径，rollup/rolldown 会把绝对路径原样写回产物（例如
// import "/Users/.../.bun/bpmn-js@.../dist/assets/diagram-js.css"），导致产物不可移植。
// 改为按「包名前缀」的裸标识正则匹配，既能外部化子路径（bpmn-js/lib/Modeler），
// 又能在产物中保留裸模块标识（bare specifier），由消费方自行解析。
const externalPackages = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.peerDependencies),
];

const toExternalRegex = (id: string) =>
  new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|$)`);

const multipleInputsMode = ['es', 'cjs'];

export default defineConfig({
  plugins: [react(), tailwindcss(), libInjectCss()],
  css: {
    preprocessorOptions: {
      less: {
        // 这里可以配置 Less 的选项
      },
    },
  },
  resolve: {
    // 强制主项目和链接包使用同一个 React 实例，否则容易造成useState null问题。直接让 Vite 自动去重
    dedupe: ['react', 'react-dom'],
  },
  build: {
    copyPublicDir: false,
    // 每个格式输出到独立的 dist/<format> 目录（见 dir 配置），
    // 开启 emptyOutDir 可清掉源文件已删除时遗留的孤儿产物（例如旧的 Canvas.js），
    // 避免绝对路径/过期文件残留在 dist 中。
    emptyOutDir: true,
    lib: {
      entry: './src/index.ts',
    },
    // @ts-expect-error
    rollupOptions: {
      external: externalPackages.map(toExternalRegex),
      ...(multipleInputsMode.indexOf(format) === -1 && {
        output: [
          {
            format: format,
            name: 'flow-designer.js',
            //配置打包根目录
            dir: resolve(__dirname, `dist/${format}`),
          },
        ],
      }),
      // 多入口文件，保证输出的文件结构和代码工程的文件结构是一直都
      ...(multipleInputsMode.indexOf(format) !== -1 && {
        input: Object.fromEntries(
          globSync('src/**/*.{ts,tsx}', {
            // @ts-expect-error
            ignore: ['src/**/*.d.ts', 'src/**/*.stories.tsx'],
          }).map((file) => [
            // The name of the entry point
            // lib/nested/foo.ts becomes nested/foo
            relative('src', file.slice(0, file.length - extname(file).length)),
            // The absolute path to the entry file
            // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
        ),
        output: [
          {
            //打包格式
            format: format,
            entryFileNames: '[name].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const name = assetInfo.name || '';
              return name.split('/').pop() || 'index[extname]';
            },
            preserveModules: true,
            exports: 'auto',
            //配置打包根目录
            dir: resolve(__dirname, `dist/${format}`),
          },
        ],
      }),
    },
  },
  assetsInclude: ['**/*.bpmn'],
});

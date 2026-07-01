import path from 'path'
import { ConfigEnv, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite' // 自动导入
import Components from 'unplugin-vue-components/vite' // 组件注册
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import unocss from '@unocss/vite'
import terser from '@rollup/plugin-terser'

/** 获取项目根路径(末尾不带斜杠) */
const getRootPath = () => path.resolve(__dirname, process.cwd())
/** 获取项目主路径(默认 src 目录,末尾不带斜杠) */
const getSrcPath = (mainName = 'src') => `${getRootPath()}/${mainName}`

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  // 获取当前环境的配置
  const config = loadEnv(mode, process.cwd())
  return {
    resolve: {
      alias: {
        // 配置路径别名 @ -> src
        '@': getSrcPath(),
        // 配置路径别名 ~ -> 项目根路径
        '~': getRootPath()
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // SCSS全局变量注入,使用 scss 特性加载全局样式变量
          additionalData: '@use "@/styles/scss/global/variable.scss" as *;'
        }
      }
    },
    define: {
      // 开启生产环境水化不匹配的警告 (vue3.4 新增)
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
    },
    plugins: [
      vue(), // vue3.5+ 已支持解构并具有响应式
      vueJsx(), // 开启 jsx 功能
      unocss(), // 开启 unocss
      // 自动导入 vue / vue-router / pinia / naive-ui 的 API
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          { 'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar', 'useModal'] }
        ],
        dts: 'src/typings/auto-imports.d.ts'
      }),
      // 自动导入组件(不会自动导入 jsx/tsx 中的组件)
      Components({
        dirs: ['src/components/**'], // 设置需要扫描的目录
        resolvers: [NaiveUiResolver()],
        dts: 'src/typings/components.d.ts'
      }),
      // 代码压缩
      terser({
        format: {
          comments: false // 移除所有注释
        },
        compress: {
          drop_console: true, // 移除 console.log
          drop_debugger: true // 移除 debugger
        }
      })
    ],
    build: {
      cssCodeSplit: true, // 启用 CSS 代码拆分
      minify: 'terser', // 指定使用 terser 混淆器
      chunkSizeWarningLimit: 1200, // chunk 大小警告的限制(kb)
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js', // 引入文件名的名称
          entryFileNames: 'static/js/[name]-[hash].js', // 包的入口文件名称
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]', // 资源文件(字体、图片等)
          // 分包配置: 将 node_modules 中的依赖统一打包
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'invariable'
            }
          }
        }
      }
    },
    // 以下为 Tauri 开发定制选项(tauri dev / tauri build 时生效)
    // 1. 防止 vite 清屏遮盖 rust 错误
    clearScreen: false,
    server: {
      // 代理配置：将 /api 请求代理到 Nitro 后端，避免 CORS
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      },
      hmr: true, // 热更新
      cors: true, // 配置 CORS
      host: '0.0.0.0',
      port: 6130, // 固定端口
      strictPort: true, // 端口被占用时直接失败
      watch: {
        // 2. 忽略 src-tauri 目录的监听
        ignored: ['**/src-tauri/**']
      }
    }
  }
})

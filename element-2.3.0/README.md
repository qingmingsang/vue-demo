# element ui 源码解读

# 项目结构
src为核心代码和打包入口.
package为组件.
package/theme-chalk里为css样式,用的sass,用gulp打包(不知道是不是sass的原因弄成单独打包?),估计开发时是一边开watch一边开发的,值得一提的是里面用了比较新的css变量.
examples为跑ui组件的用例,同时也是文档展示,用一个vue-markdown-loader的东西读取examples/docs里的md文件.

接下来基本会以组件和核心函数为章节,另外会有一个一边参照实现的[项目]().

@todo
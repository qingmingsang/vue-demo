# vue ssr

# 编写通用代码
## 编写通用代码
"通用"代码 - 即运行在服务器和客户端的代码。由于用例和平台 API 的差异，当运行在不同环境中时，代码将不会完全相同。

## 服务器上的数据响应
在纯客户端应用程序(client-only app)中，每个用户会在他们各自的浏览器中使用新的应用程序实例。对于服务器端渲染，我们也希望如此：每个请求应该都是全新的、独立的应用程序实例，以便不会有交叉请求造成的状态污染(cross-request state pollution)。

因为实际的渲染过程需要确定性，所以我们也将在服务器上“预取”数据("pre-fetching" data) - 这意味着在我们开始渲染时，我们的应用程序就已经解析完成其状态。也就是说，将数据进行响应式的过程在服务器上是多余的，所以默认情况下禁用。禁用响应式数据，还可以避免将「数据」转换为「响应式对象」的性能开销。

## 组件生命周期钩子函数
由于没有动态更新，所有的生命周期钩子函数中，只有 beforeCreate 和 created 会在服务器端渲染(SSR)过程中被调用。这就是说任何其他生命周期钩子函数中的代码（例如 beforeMount 或 mounted），只会在客户端执行。

此外还需要注意的是，应该避免在 beforeCreate 和 created 生命周期时产生全局副作用的代码，例如在其中使用 setInterval 设置 timer。
在纯客户端(client-side only)的代码中，可以设置一个 timer，然后在 beforeDestroy 或 destroyed 生命周期时将其销毁。但是，由于在 SSR 期间并不会调用销毁钩子函数，所以 timer 将永远保留下来。为了避免这种情况，应将副作用代码移动到 beforeMount 或 mounted 生命周期中。

## 访问特定平台(Platform-Specific) API
通用代码不可接受特定平台的 API，因此如果代码中直接使用了像 window 或 document，这种仅浏览器可用的全局变量，则会在 Node.js 中执行时抛出错误，反之也是如此。

对于共享于服务器和客户端，但用于不同平台 API 的任务(task)，建议将平台特定实现包含在通用 API 中，或者使用为执行此操作的 library。例如，axios 是一个 HTTP 客户端，可以向服务器和客户端都暴露相同的 API。

对于仅浏览器可用的 API，通常方式是，在「纯客户端(client-only)」的生命周期钩子函数中惰性访问(lazily access)？它们。

## 自定义指令
大多数自定义指令直接操作 DOM，因此会在服务器端渲染(SSR)过程中导致错误。
有两种方法可以解决这个问题：
- 推荐使用组件作为抽象机制，并运行在「虚拟 DOM 层级(Virtual-DOM level)」（例如，使用渲染函数(render function)）。
- 如果有一个自定义指令，但是不是很容易替换为组件，则可以在创建服务器 renderer 时，使用 directives 选项所提供"服务器端版本(server-side version)"。

# 源码结构

## 避免状态单例
当编写纯客户端(client-only)代码时，可以每次在新的上下文中对代码进行取值。但是，Node.js 服务器是一个长期运行的进程。
当代码进入该进程时，它将进行一次取值并留存在内存中。这意味着如果创建一个单例对象，它将在每个传入的请求之间共享。

为每个请求创建一个新的根 Vue 实例。这与每个用户在自己的浏览器中使用新应用程序的实例类似。如果我们在多个请求之间使用一个共享的实例，很容易导致交叉请求状态污染(cross-request state pollution)。
```
server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  });
  renderer.renderToString(app,(err, html) => {
    res.end(html);
  })
})
```

因此，不应该直接创建一个应用程序实例，而是应该暴露一个可以重复执行的工厂函数，为每个请求创建新的应用程序实例：
```
// app.js
const Vue = require('vue');
module.exports = function createApp (context) {
  return new Vue({
    data: {
      url: context.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })
}


// server.js
const createApp = require('./app');
server.get('*', (req, res) => {
  const context = { url: req.url }
  const app = createApp(context)
  renderer.renderToString(app,(err, html) => {
    res.end(html);
  })
})
```
同样的规则也适用于 router、store 和 event bus 实例。不应该直接从模块导出并将其导入到应用程序中，而是需要在 createApp 中创建一个新的实例，并从根 Vue 实例注入。

在使用带有 { runInNewContext: true } 的 bundle renderer 时，可以消除此约束，但是由于需要为每个请求创建一个新的 vm 上下文，因此伴随有一些显著性能开销。

## 构建步骤
@1

```
src
├── components
│   ├── Foo.vue
│   ├── Bar.vue
│   └── Baz.vue
├── App.vue
├── app.js # universal entry
├── entry-client.js # 仅运行于浏览器
└── entry-server.js # 仅运行于服务器
```


# 路由和代码分割

异步组件现在可以在vue应用中的任何地方使用。

```
import Foo from './Foo.vue'
// 改为这样：
const Foo = () => import('./Foo.vue')
```

需要注意的是，需要在挂载 app 之前调用 router.onReady，因为路由器必须要提前解析路由配置中的异步组件，才能正确地调用组件中可能存在的路由钩子。
```
// entry-client.js
import { createApp } from './app'
const { app, router } = createApp()
router.onReady(() => {
  app.$mount('#app')
})
```

`router.getMatchedComponents(location?)`返回目标位置或是当前路由匹配的组件数组（是数组的定义/构造类，不是实例）。通常在服务端渲染的数据预加载时时候。


# 数据预取和状态

## 数据预取存储容器(Data Store)

在服务器端渲染(SSR)期间，本质上是在渲染应用程序的"快照"，所以如果应用程序依赖于一些异步数据，那么在开始渲染过程之前，需要先预取和解析好这些数据。

另一个需要关注的问题是在客户端，在挂载(mount)到客户端应用程序之前，需要获取到与服务器端应用程序完全相同的数据 - 否则，客户端应用程序会因为使用与服务器端应用程序不同的状态，然后导致混合失败。

为了解决这个问题，获取的数据需要位于视图组件之外，即放置在专门的数据预取存储容器(data store)或"状态容器(state container)）"中。
首先，在服务器端，可以在渲染之前预取数据，并将数据填充到 store 中。
此外，将在 HTML 中序列化(serialize)和内联预置(inline)状态。这样，在挂载(mount)到客户端应用程序之前，可以直接从 store 获取到内联预置(inline)状态。

使用vuex

## 带有逻辑配置的组件(Logic Collocation with Components)

在哪里放置「dispatch 数据预取 action」的代码？

需要通过访问路由，来决定获取哪部分数据 - 这也决定了哪些组件需要渲染。事实上，给定路由所需的数据，也是在该路由上渲染组件时所需的数据。
所以在路由组件中放置数据预取逻辑，是很自然的事情。


## 客户端数据预取(Client Data Fetching)
在客户端，处理数据预取有两种不同方式：

### 1 在路由导航之前解析数据：

使用此策略，应用程序会等待视图所需数据全部解析之后，再传入数据并处理当前视图。好处在于，可以直接在数据准备就绪时，传入视图渲染完整内容，但是如果数据预取需要很长时间，用户在当前视图会感受到"明显卡顿"。因此，如果使用此策略，建议提供一个数据加载指示器(data loading indicator)。
可以通过检查匹配的组件，并在全局路由钩子函数中执行 asyncData 函数，来在客户端实现此策略。
在初始路由准备就绪之后，就应该注册此钩子，这样就不必再次获取服务器提取的数据。
```
//Item.vue

<template>
  <div>{{ item.title }}</div>
</template>
<script>
export default {
  //暴露出一个自定义静态函数 asyncData。
  //注意，由于此函数会在组件实例化之前调用，所以它无法访问 this。
  //需要将 store 和路由信息作为参数传递进去：
  asyncData({ store, route }) {
    // 触发 action 后，会返回 Promise
    return store.dispatch('fetchItem', route.params.id)
  },
  computed: {
    // 从 store 的 state 对象中的获取 item。
    item() {
      return this.$store.state.items[this.$route.params.id]
    }
  }
}
</script>
```

```
  // entry-client.js
  // ...忽略无关代码
  router.onReady(() => {
    // 添加路由钩子函数，用于处理 asyncData.
    // 在初始路由 resolve 后执行，
    // 以便我们不会二次预取(double-fetch)已有的数据。
    // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
    router.beforeResolve((to, from, next) => {
      const matched = router.getMatchedComponents(to)
      const prevMatched = router.getMatchedComponents(from)
      // 我们只关心之前没有渲染的组件
      // 所以我们对比它们，找出两个匹配列表的差异组件
      let diffed = false
      const activated = matched.filter((c, i) => {
        return diffed || (diffed = (prevMatched[i] !== c))
      })
      if (!activated.length) {
        return next()
      }
      // 这里如果有加载指示器(loading indicator)，就触发
      Promise.all(activated.map(c => {
        if (c.asyncData) {
          return c.asyncData({ store, route: to })
        }
      })).then(() => {
        // 停止加载指示器(loading indicator)
        next()
      }).catch(next)
    })
    app.$mount('#app')
  })
```

如果只是为了一个loading效果，个人觉得太过繁琐。

### 2 匹配要渲染的视图后，再获取数据
此策略将客户端数据预取逻辑，放在视图组件的 beforeMount 函数中。当路由导航被触发时，可以立即切换视图，因此应用程序具有更快的响应速度。然而，传入视图在渲染时不会有完整的可用数据。因此，对于使用此策略的每个视图组件，都需要具有条件加载状态。

可以通过纯客户端(client-only)的全局 mixin 来实现：
```
  Vue.mixin({
    beforeMount () {
      const { asyncData } = this.$options
      if (asyncData) {
        // 将获取数据操作分配给 promise
        // 以便在组件中，我们可以在数据准备就绪后
        // 通过运行 `this.dataPromise.then(...)` 来执行其他任务
        this.dataPromise = asyncData({
          store: this.$store,
          route: this.$route
        })
      }
    }
  })
```


当路由组件重用（同一路由，但是 params 或 query 已更改，例如，从 user/1 到 user/2）时，应该也调用 asyncData 函数。
也可以通过纯客户端(client-only)的全局 mixin 来处理这个问题：
```
Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})
```

### Store 代码拆分(Store Code Splitting)
在大型应用程序中，Vuex store 可能会分为多个模块。
当然，也可以将这些模块代码，分割到相应的路由组件 chunk 中。

可以在路由组件的 asyncData 钩子函数中，使用 store.registerModule 惰性注册(lazy-register)这个模块：
```
// store/modules/foo.js
export default {
  namespaced: true,
  // 重要信息：state 必须是一个函数，
  // 因此可以创建多个实例化该模块
  state: () => ({
    count: 0
  }),
  actions: {
    inc: ({ commit }) => commit('inc')
  },
  mutations: {
    inc: state => state.count++
  }
}


// Foo.vue 路由组件
<template>
  <div>{{ fooCount }}</div>
</template>
<script>
// 在这里导入模块，而不是在 `store/index.js` 中
import fooStoreModule from '../store/modules/foo'
export default {
  asyncData ({ store }) {
    store.registerModule('foo', fooStoreModule)
    return store.dispatch('foo/inc')
  },
  // 重要信息：当多次访问路由时，
  // 避免在客户端重复注册模块。
  destroyed () {
    this.$store.unregisterModule('foo')
  },
  computed: {
    fooCount () {
      return this.$store.state.foo.count
    }
  }
}
</script>
```
由于模块现在是路由组件的依赖，所以它将被 webpack 移动到路由组件的异步 chunk 中。



# 客户端激活 (Client-side Hydration)
所谓客户端激活(注水)，指的是 Vue 在浏览器端接管由服务端发送的静态 HTML，使其变为由 Vue 管理的动态 DOM 的过程。

在 entry-client.js 中，用下面这行挂载 (mount) 应用程序：
```
// 这里假定 App.vue template 根元素的 `id="app"`
app.$mount('#app')
```
由于服务器已经渲染好了 HTML，显然无需将其丢弃再重新创建所有的 DOM 元素。相反，需要"激活"这些静态的 HTML，然后使他们成为动态的（能够响应后续的数据变化）。

如果检查服务器渲染的输出结果，会注意到应用程序的根元素有一个特殊的属性：
```
<div id="app" data-server-rendered="true">
```

data-server-rendered 特殊属性，让客户端 Vue 知道这部分 HTML 是由 Vue 在服务端渲染的，并且应该以激活模式进行挂载。

在开发模式下，Vue 将推断客户端生成的虚拟 DOM 树 (virtual DOM tree)，是否与从服务器渲染的 DOM 结构 (DOM structure)匹配。如果无法匹配，它将退出混合模式，丢弃现有的 DOM 并从头开始渲染。
在生产模式下，此检测会被跳过，以避免性能损耗。

## 一些需要注意的坑
使用「SSR + 客户端混合」时，需要了解的一件事是，浏览器可能会更改的一些特殊的 HTML 结构。

例如，当在 Vue 模板中写入：
```
<table>
  <tr><td>hi</td></tr>
</table>
```
浏览器会在 `<table>` 内部自动注入 `<tbody>`，然而，由于 Vue 生成的虚拟 DOM (virtual DOM) 不包含 `<tbody>`，所以会导致无法匹配。
为能够正确匹配，应确保在模板中写入有效的 HTML。


# Bundle Renderer 指引

## 传入 BundleRenderer
之前假设打包的服务器端代码，将由服务器通过 require 直接使用。
这是可行的，然而在每次编辑过应用程序源代码之后，都必须停止并重启服务。这在开发过程中会影响开发效率。此外，Node.js 本身不支持 source map。

vue-server-renderer 提供一个名为 createBundleRenderer 的 API，用于处理此问题，通过使用 webpack 的自定义插件，server bundle 将生成为可传递到 bundle renderer 的特殊 JSON 文件。所创建的 bundle renderer，用法和普通 renderer 相同，但是 bundle renderer 提供以下优点：

1. 内置的 source map 支持（在 webpack 配置中使用 devtool: 'source-map'）
2. 在开发环境甚至部署过程中热重载（通过读取更新后的 bundle，然后重新创建 renderer 实例）
3. 关键 CSS(critical CSS) 注入（在使用 *.vue 文件时）：自动内联在渲染过程中用到的组件所需的CSS。
4. 使用 clientManifest 进行资源注入：自动推断出最佳的预加载(preload)和预取(prefetch)指令，以及初始渲染所需的代码分割 chunk。

bundle renderer 在调用 renderToString 时，它将自动执行「由 bundle 创建的应用程序实例」所导出的函数（传入上下文作为参数），然后渲染它。
推荐将 runInNewContext 选项设置为 false 或 'once'。
```
const { createBundleRenderer } = require('vue-server-renderer')
const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false, // 推荐
  template, // （可选）页面模板
  clientManifest // （可选）客户端构建 manifest
})
// 在服务器处理函数中……
server.get('*', (req, res) => {
  const context = { url: req.url }
  // 这里无需传入一个应用程序，因为在执行 bundle 时已经自动创建过。
  // 现在我们的服务器与应用程序已经解耦！
  renderer.renderToString(context, (err, html) => {
    // 处理异常……
    res.end(html)
  })
})
```

# 构建配置

## 服务器配置(Server Config)
## 扩展说明(Externals Caveats)

请注意，在 externals 选项中，将 CSS 文件列入白名单。这是因为从依赖模块导入的 CSS 还应该由 webpack 处理。如果导入依赖于 webpack 的任何其他类型的文件（例如 *.vue, *.sass），那么也应该将它们添加到白名单中。

如果使用 runInNewContext: 'once' 或 runInNewContext: true，那么还应该将修改 global 的 polyfill 列入白名单，例如 babel-polyfill。这是因为当使用新的上下文模式时，server bundle 中的代码具有自己的 global 对象。
由于在使用 Node 7.6+ 时，在服务器并不真正需要它，所以实际上只需在客户端 entry 导入它。
```
const nodeExternals = require('webpack-node-externals')
 
  target: 'node',
  externals: nodeExternals({
    // 不要外置化 webpack 需要处理的依赖模块。
    // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
    // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
    whitelist: /\.css$/
  }),
```

## 客户端配置(Client Config)
vue-server-renderer/server-plugin 和vue-server-renderer/client-plugin 似乎是把某些webpack的插件集成掉了。

自动生成的html可能看起来是这样的
```
<html>
  <head>
    <!-- 用于当前渲染的 chunk 会被资源预加载(preload) -->
    <link rel="preload" href="/manifest.js" as="script">
    <link rel="preload" href="/main.js" as="script">
    <link rel="preload" href="/0.js" as="script">
    <!-- 未用到的异步 chunk 会被数据预取(preload)（次要优先级） -->
    <link rel="prefetch" href="/1.js" as="script">
  </head>
  <body>
    <!-- 应用程序内容 -->
    <div data-server-rendered="true"><div>async</div></div>
    <!-- manifest chunk 优先 -->
    <script src="/manifest.js"></script>
    <!-- 在主 chunk 之前注入异步 chunk -->
    <script src="/0.js"></script>
    <script src="/main.js"></script>
  </body>
</html>
```


## 手动资源注入(Manual Asset Injection)
可以在创建 renderer 并手动执行资源注入时，传入 inject: false进行手动资源注入。

`ontext.renderStyles()`
这将返回内联 `<style>` 标签包含所有关键 CSS(critical CSS) ，其中关键 CSS 是在要用到的 *.vue 组件的渲染过程中收集的。有关更多详细信息，请查看 CSS 管理。
如果提供了 clientManifest，返回的字符串中，也将包含着 `<link rel="stylesheet">` 标签内由 webpack 输出(webpack-emitted)的 CSS 文件（例如，使用 extract-text-webpack-plugin 提取的 CSS，或使用 file-loader 导入的 CSS）



`context.renderState(options?: Object)`
此方法序列化 context.state 并返回一个内联的 script，其中状态被嵌入在 window.__INITIAL_STATE__ 中。

上下文状态键(context state key)和 window 状态键(window state key)，都可以通过传递选项对象进行自定义：
```
  context.renderState({
    contextKey: 'myCustomState',
    windowKey: '__MY_STATE__'
  })
  // -> <script>window.__MY_STATE__={...}</script>
```

`context.renderScripts()`
需要 clientManifest
此方法返回引导客户端应用程序所需的 `<script>` 标签。当在应用程序代码中使用异步代码分割(async code-splitting)时，此方法将智能地正确的推断需要引入的那些异步 chunk。

`context.renderResourceHints()`
需要 clientManifest
此方法返回当前要渲染的页面，所需的 `<link rel="preload/prefetch">` 资源提示(resource hint)。
默认情况下会：
预加载页面所需的 JavaScript 和 CSS 文件.
预取异步 JavaScript chunk，之后可能会用于渲染.
使用 shouldPreload 选项可以进一步自定义要预加载的文件。

`context.getPreloadFiles()`
需要 clientManifest
此方法不返回字符串 - 相反，它返回一个数组，此数组是由要预加载的资源文件对象所组成。这可以用在以编程方式(programmatically)执行 HTTP/2 服务器推送(HTTP/2 server push)。


```
<html>
  <head>
    <!-- 使用三花括号(triple-mustache)进行 HTML 不转义插值(non-HTML-escaped interpolation) -->
    {{{ renderResourceHints() }}}
    {{{ renderStyles() }}}
  </head>
  <body>
    <!--vue-ssr-outlet-->
    {{{ renderState() }}}
    {{{ renderScripts() }}}
  </body>
</html>
```

# CSS 管理

vue-style-loader（vue-loader 内部使用的 loader），具备一些服务器端渲染的特殊功能:
1. 客户端和服务器端的通用编程体验。
2. 在使用 bundleRenderer 时，自动注入关键 CSS(critical CSS)。
3. 通用 CSS 提取。

## 启用 CSS 提取
```
// webpack.config.js
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// CSS 提取应该只用于生产环境
// 这样我们在开发过程中仍然可以热重载
const isProduction = process.env.NODE_ENV === 'production'
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // enable CSS extraction
          extractCSS: isProduction
        }
      },
      // ...
    ]
  },
  plugins: isProduction
    // make sure to add the plugin!
    ? [new ExtractTextPlugin({ filename: 'common.[chunkhash].css' })]
    : []
}
```

如果想从 JavaScript 中导入 CSS，例如，import 'foo.css'，你需要配置合适的 loader：
```
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/,
        // 重要：使用 vue-style-loader 替代 style-loader
        use: isProduction
          ? ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'vue-style-loader'
            })
          : ['vue-style-loader', 'css-loader']
      }
    ]
  },
  // ...
}
```

## 从依赖模块导入样式
在服务器端构建过程中，不应该外置化提取??。

如果使用 CSS 提取 + 使用 CommonsChunkPlugin 插件提取 vendor，在 extract-text-webpack-plugin 提取 CSS 到 vendor chunk 时将遇到问题??。为了应对这个问题，请避免在 vendor chunk 中包含 CSS 文件。

客户端 webpack 配置示例如下：
```
  module.exports = {
    // ...
    plugins: [
      // 将依赖模块提取到 vendor chunk 以获得更好的缓存，是很常见的做法。
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          // 一个模块被提取到 vendor chunk 时……
          return (
            // 如果它在 node_modules 中
            /node_modules/.test(module.context) &&
            // 如果 request 是一个 CSS 文件，则无需外置化提取
            !/\.css$/.test(module.request)
          )
        }
      }),
      // 提取 webpack 运行时和 manifest
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest'
      }),
      // ...
    ]
  }

```

# Head 管理
类似于资源注入，Head 管理遵循相同的理念：
可以在组件的生命周期中，将数据动态地追加到渲染上下文(render context)，然后在模板中的占位符替换为这些数据。

可以通过 this.$ssrContext 来直接访问组件中的服务器端渲染上下文(SSR context)。

一个简单的 标题管理mixin：
```
// title-mixin.js
function getTitle (vm) {
  // 组件可以提供一个 `title` 选项
  // 此选项可以是一个字符串或函数
  const { title } = vm.$options
  if (title) {
    return typeof title === 'function'
      ? title.call(vm)
      : title
  }
}
const serverTitleMixin = {
  created () {
    const title = getTitle(this)
    if (title) {
      this.$ssrContext.title = title
    }
  }
}
const clientTitleMixin = {
  mounted () {
    const title = getTitle(this)
    if (title) {
      document.title = title
    }
  }
}
// 可以通过 `webpack.DefinePlugin` 注入 `VUE_ENV`
export default process.env.VUE_ENV === 'server'
  ? serverTitleMixin
  : clientTitleMixin
```
在路由组件可以利用以上 mixin，来控制文档标题(document title)：
```
// Item.vue
export default {
  mixins: [titleMixin],
  title () {
    return this.item.title
  }
  asyncData ({ store, route }) {
    return store.dispatch('fetchItem', route.params.id)
  },
  computed: {
    item () {
      return this.$store.state.items[this.$route.params.id]
    }
  }
}
```

# 缓存
虽然 Vue 的服务器端渲染(SSR)相当快速，但是由于创建组件实例和虚拟 DOM 节点的开销，无法与纯基于字符串拼接(pure string-based)的模板的性能相当。在 SSR 性能至关重要的情况下，明智地利用缓存策略，可以极大改善响应时间并减少服务器负载。

## 页面级别缓存(Page-level Caching)

在大多数情况下，服务器渲染的应用程序依赖于外部数据，因此本质上页面内容是动态的，不能持续长时间缓存。然而，如果内容不是用户特定(user-specific)（即对于相同的 URL，总是为所有用户渲染相同的内容），我们可以利用名为 micro-caching 的缓存策略，来大幅度提高应用程序处理高流量的能力。

这通常在 Nginx 层完成，但是也可以在 Node.js 中实现它：
```
const microCache = LRU({
  max: 100,
  maxAge: 1000 // 重要提示：条目在 1 秒后过期。
})
const isCacheable = req => {
  // 实现逻辑为，检查请求是否是用户特定(user-specific)。
  // 只有非用户特定(non-user-specific)页面才会缓存
}
server.get('*', (req, res) => {
  const cacheable = isCacheable(req)
  if (cacheable) {
    const hit = microCache.get(req.url)
    if (hit) {
      return res.end(hit)
    }
  }
  renderer.renderToString((err, html) => {
    res.end(html)
    if (cacheable) {
      microCache.set(req.url, html)
    }
  })
})
```
由于内容缓存只有一秒钟，用户将无法查看过期的内容。然而，这意味着，对于每个要缓存的页面，服务器最多只能每秒执行一次完整渲染。??

## 组件级别缓存(Component-level Caching)
[node-lru-cache](https://github.com/isaacs/node-lru-cache)
vue-server-renderer 内置支持组件级别缓存(component-level caching)。要启用组件级别缓存，需要在创建 renderer 时提供具体缓存实现方式(cache implementation)。典型做法是传入 lru-cache：
```
const LRU = require('lru-cache')
const renderer = createRenderer({
  cache: LRU({
    max: 10000,
    maxAge: ...
  })
})
```

然后，可以通过实现 serverCacheKey 函数来缓存组件。
```
export default {
  name: 'item', // 必填选项
  props: ['item'],
  serverCacheKey: props => props.item.id,
  render (h) {
    return h('div', this.item.id)
  }
}
```
可缓存组件还必须定义一个唯一的 name 选项。
通过使用唯一的名称，每个缓存键(cache key)对应一个组件：无需担心两个组件返回同一个 key。

serverCacheKey 返回的 key 应该包含足够的信息，来表示渲染结果的具体情况。如果渲染结果仅由 props.item.id 决定，则上述是一个很好的实现。但是，如果具有相同 id 的 item 可能会随时间而变化，或者如果渲染结果依赖于其他 prop，则需要修改 getCacheKey 的实现，以考虑其他变量。

返回常量将导致组件始终被缓存，这对纯静态组件是有好处的。

## 何时使用组件缓存
如果 renderer 在组件渲染过程中进行缓存命中，那么它将直接重新使用整个子树的缓存结果。

这意味着在以下情况，不应该缓存组件：
- 它具有可能依赖于全局状态的子组件。
- 它具有对渲染上下文产生副作用(side effect)的子组件。

因此，应该小心使用组件缓存来解决性能瓶颈。在大多数情况下，不应该也不需要缓存单一实例组件。适用于缓存的最常见类型的组件，是在大的 v-for 列表中重复出现的组件。由于这些组件通常由数据库集合(database collection)中的对象驱动，它们可以使用简单的缓存策略：使用其唯一 id，再加上最后更新的时间戳，来生成其缓存键(cache key)：
```
serverCacheKey: props => props.item.id + '::' + props.item.last_updated
```

# Streaming(流式渲染)
对于 vue-server-renderer 的基本 renderer 和 bundle renderer 都提供开箱即用的流式渲染功能。所有你需要做的就是，用 renderToStream 替代 renderToString：
```
const stream = renderer.renderToStream(context)
```

返回的值是 Node.js stream：
```
let html = ''
stream.on('data', data => {
  html += data.toString()
})
stream.on('end', () => {
  console.log(html) // 渲染完成
})
stream.on('error', err => {
  // handle error...
})
```

## 流式传输说明(Streaming Caveats)
在流式渲染模式下，当 renderer 遍历虚拟 DOM 树(virtual DOM tree)时，会尽快发送数据。这意味着可以尽快获得"第一个 chunk"，并开始更快地将其发送给客户端。

然而，当第一个数据 chunk 被发出时，子组件甚至可能不被实例化，它们的生命周期钩子也不会被调用。这意味着，如果子组件需要在其生命周期钩子函数中，将数据附加到渲染上下文(render context)，当流(stream)启动时，这些数据将不可用。这是因为，大量上下文信息(context information)（如头信息(head information)或内联关键 CSS(inline critical CSS)）需要在应用程序标记(markup)之前出现，基本上必须等待流(stream)完成后，才能开始使用这些上下文数据。

因此，如果依赖由组件生命周期钩子函数填充的上下文数据，则不建议使用流式传输模式。(大概意思是纯dom的用这种方式更快)


# SSR的实现原理
客户端请求服务器，服务器根据请求地址获得匹配的组件，在调用匹配到的组件返回 Promise (官方是preFetch方法)来将需要的数据拿到。最后再通过
`<script>window.__initial_state=data</script>`
将其写入网页，最后将服务端渲染好的网页返回回去。

接下来客户端会将vuex将写入的 `__initial_state__` 替换为当前的全局状态树，再用这个状态树去检查服务端渲染好的数据有没有问题。遇到没被服务端渲染的组件，再去发异步请求拿数据。说白了就是一个类似React的 shouldComponentUpdate 的Diff操作。

Vue2使用的是单向数据流，用了它，就可以通过 SSR 返回唯一一个全局状态，并确认某个组件是否已经SSR过了。





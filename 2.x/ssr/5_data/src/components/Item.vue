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
<template>
    <div class="wrap">
        <router-link :to="{ name: 'home'}">to home page</router-link>
        <br>
        <ul>
            <li :key="item.title" v-for="item in list" @click="showTitle(item.title)">
                <img :src="item.image">
                <p>
                    {{item.title}}
                </p>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  //暴露出一个自定义静态函数 asyncData。
  //注意，由于此函数会在组件实例化之前调用，所以它无法访问 this。
  //需要将 store 和路由信息作为参数传递进去：
  asyncData({ store, route }) {
    // 触发 action 后，会返回 Promise
    store.dispatch('ajaxList');//这里好像不加return也没关系
    //return store.dispatch('fetchItem', route.params.id)
  },
  data() {
    return {}
  },
  methods: {
    showTitle(title) {
      console.log(title)
    }
  },
  computed: {
    list() {
      return this.$store.state.list
    }
  }
}
</script>
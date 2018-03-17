import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production', // 线上环境关闭store检查
  state: {
    items: {},
    list: [],
    hello: ''
  },
  actions: {
    fetchItem({ commit }, id) {
      // `store.dispatch()` 会返回 Promise，
      // 以便我们能够知道数据在何时更新
      return fetchItem(id).then(item => {
        commit('setItem', { id, item })
      })
    },
    setListData({ commit }, data) {
      commit('setListData', data)
    },
    async ajaxList({ commit }) {
      try {
        let response = await fetch('http://localhost:7000/data');
        let data = await response.json();
        commit('setListData', data.data.liveWodList)
      } catch (e) {
        console.log("Oops, error", e);
      }
    },
    async hello({ commit }) {
      try {
        let response = await fetch('http://localhost:7000/hello');
        let data = await response.text();
        commit('setHelloData', data);
      } catch (e) {
        console.log("Oops, error", e);
      }
    },
  },
  mutations: {
    setItem(state, { id, item }) {
      Vue.set(state.items, id, item)
    },
    setListData(state, data) {
      state.list = data
    },
    setHelloData(state, data) {
      state.hello = data
    }
  }
})

export default store;
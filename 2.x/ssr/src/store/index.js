import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
// 假定有一个可以返回 Promise 的
import { fetchItem } from '../api';

export function createStore() {
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production', // 线上环境关闭store检查
    state: {
      items: {},
      appName: 'appName',
      title: 'home'
    },
    actions: {
      fetchItem({ commit }, id) {
        // `store.dispatch()` 会返回 Promise，
        // 以便我们能够知道数据在何时更新
        return fetchItem(id).then(item => {
          commit('setItem', { id, item })
        })
      }
    },
    mutations: {
      setItem(state, { id, item }) {
        Vue.set(state.items, id, item)
      }
    }
  })
}
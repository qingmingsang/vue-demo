import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production', // 线上环境关闭store检查
    state: {
      list: [],
      hello: ''
    },
    actions: {
      setListData({ commit }, data) {
        commit('setListData', data)
      },
      async ajaxList({ commit }) {
        try {
          let data = await axios.get('http://localhost:7000/data');
          commit('setListData', data.data.data.liveWodList)
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
      setListData(state, data) {
        state.list = data
      },
      setHelloData(state, data) {
        state.hello = data
      }
    }
  })
}
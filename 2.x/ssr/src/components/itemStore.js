import axios from 'axios';

export default {
  namespaced: true,
  state: {
    list: []
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
  },
  mutations: {
    setListData(state, data) {
      state.list = data
    },
  },
}

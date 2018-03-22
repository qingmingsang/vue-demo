export default {
  home2: {
    namespaced: true,
    state: {
      goodbye: ''
    },
    actions: {
      async goodbye({ commit }) {
        try {
          let response = await fetch('http://localhost:7000/goodbye');
          let data = await response.text();
          commit('setGoodbyeData', data);
        } catch (e) {
          console.log("Oops, error", e);
        }
      },
    },
    mutations: {
      setGoodbyeData(state, data) {
        state.goodbye = data
      }
    }
  }
}


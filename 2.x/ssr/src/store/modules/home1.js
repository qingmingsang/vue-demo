export default {
  home1: {
    namespaced: true,
    state: {
      hello: ''
    },
    actions: {
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
      setHelloData(state, data) {
        state.hello = data
      }
    }
  }
}


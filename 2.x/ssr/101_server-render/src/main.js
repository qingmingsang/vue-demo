import Vue from 'vue';
//import App from './App.vue';
import App from './components/Home.vue';
import store from './store/index';
import router from './router';

//Vue.config.productionTip = false;

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
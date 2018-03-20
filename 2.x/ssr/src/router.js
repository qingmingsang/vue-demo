import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        redirect: '/home'
      },
      {
        path: '/home',
        name: 'home',
        component: () => import(/* webpackChunkName: "Home" */'./components/Home.vue')
      },
      {
        path: '/item',
        name: 'item',
        component: () => import(/* webpackChunkName: "Item" */'./components/Item.vue')
      }
    ]
  })
}
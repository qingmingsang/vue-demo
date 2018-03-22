import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import home1 from './modules/home1';
import home2 from './modules/home2';

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production', // 线上环境关闭store检查
    modules: {
      ...home1,
      ...home2
    },
  })
}
// 这个文件里面除了定义入口的.vue，其他的都不用配置
import Vue from 'vue';
// 引入.vue入口文件
//import App from './App.vue';
import App from './components/Home.vue';
import store from './store/index';
import axios from 'axios'
//const app = new Vue(App);
const app = new Vue({
  ...App,
  store
})
// 你问我这块代码是啥意思，其实我也不知道，想要打包server端代码，这个代码块是必须的
// 以后会在这段代码里面加入其他一些配置信息
export default function (context) {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:7000/data')
      .then((response) => {
        // 获取数据
        const list = response.data.data.liveWodList
        // 把数据存到Vuex里面
        store.dispatch('setListData', list)
        // 把state存放到context中
        context.state = store.state
        resolve(app)
      })
      .catch((e) => {
        console.log("Oops, error");
        reject(e)
      });
    // context.state = store.state
    // resolve(app)
  });
}
import Vue from 'vue';
import { Button } from 'element-ui';
import App from './App';

Vue.component(Button.name, Button);
/* 或写为
 * Vue.use(Button)
 */

new Vue({
  el: 'body',
  render: (h) => h(App)
})

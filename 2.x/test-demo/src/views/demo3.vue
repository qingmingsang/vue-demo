<template>
  <div id='demo3'>
    <h3>demo3</h3>
    <!--sss  -->
    <asyncCom></asyncCom>
  </div>
</template>

<script>

// 2.3 之前
// const asyncCom = () => import('../components/asyncCom.vue')

import loadingCom from '../components/loadingCom.vue'
import errCom from '../components/errCom.vue'

// 2.3 新增
const asyncCom = () => ({
  component: new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(import('../components/asyncCom1.vue'))
      // reject()
    }, 2000)
  }),
  loading: loadingCom,
  error: errCom,
  delay: 100,
  timeout: 3000
})

export default {
  name: 'demo3',
  data () {
    return {
      state: false  
    }
  },
  comments: true,
  components: {
    asyncCom
  }
}
</script>

<style scoped>

</style>

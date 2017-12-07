<template>
  <div class="container">
    <ul>
      <li>
        <v-link v-for="(v,k) in routes" :href="k" :key="k">
          {{v}}
        </v-link>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script>
import VLink from '../components/VLink.vue'
import routes from '../routes';

export default {
  data() {
    return {
      routes
    }
  },
  components: {
    VLink
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 15px 30px;
  background: #f9f7f5;
}
</style>

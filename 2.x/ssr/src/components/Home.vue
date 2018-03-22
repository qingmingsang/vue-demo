<template>
    <div>
      <router-link :to="{ name: 'item'}">to item page</router-link>
      <br>
      {{hello}}
      <br>
      {{goodbye}}
    </div>
</template>

<script>

export default {
  mounted() {
    this.$store.dispatch('home1/hello');
    this.$store.dispatch('home2/goodbye');
  },
  computed: {
    hello() {
      return this.$store.state.home1.hello
    },
    goodbye() {
      return this.$store.state.home2.goodbye
    }
  }
}
</script>

<style>
ul {
  list-style: none;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 auto;
  justify-content: center;
}

li {
  width: 380px;
  height: 270px;
  margin-right: 30px;
  background-color: #f2f2f2;
  cursor: pointer;
  margin-top: 10px;
}

img {
  width: 380px;
  height: 214px;
}

p {
  width: 380px;
  padding-left: 15px;
  font-size: 16px;
}
</style>

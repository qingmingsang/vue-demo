<template>
    <div class="wrap">
        <ul>
            <li :key="item.title" v-for="item in list" @click="showTitle(item.title)">
                <img :src="item.image">
                <p>
                    {{item.title}}
                </p>
            </li>
        </ul>
    </div>
</template>

<script>

export default {
  data() {
    return {}
  },
  methods: {
    showTitle(title) {
      console.log(title)
    }
  },
  mounted() {
    this.$store.dispatch('hello')
  },
  computed: {
    list() {
      return this.$store.state.list
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

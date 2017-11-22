<template>
  <div id="app">
    <el-button>{{ message }}</el-button>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      message: "Hello Vue!"
    };
  }
};
</script>

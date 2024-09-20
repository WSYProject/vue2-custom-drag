<template>
  <el-checkbox v-model="checked" @change="$emit('change', $event)"></el-checkbox>
</template>

<script>

export default {
  props: {
    value: {
      type: Boolean,
    },
  },
  data() {
    return {
      checked: false
    }
  },
  mounted() {
    this.checked = this.value
  }
}
</script>

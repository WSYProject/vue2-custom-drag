<template>
  <el-select :value="value" @change="$emit('change', $event)">
      <el-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label"></el-option>
  </el-select>
</template>

<script>

export default {
  props: {
    value: {
      type: [String, Array],
    },
    options: {
      type:Array,
      default: []
    }
  }
}
</script>

<template>
  <el-input type='text' v-model="tempValue" @keyup.enter.stop.prevent="onChanged(tempValue)"
              @change="onChanged($event)"/>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tempValue: ''
    }
  },
  methods: {
    onChanged(val) {
      this.$emit('change', val);
    }
  },
  mounted() {
    this.tempValue = this.value;
  }
}
</script>

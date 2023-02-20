<template>
  <div>
    <!--  卡片视图区-->
    <el-card>
      <!--    步骤条-->
      <el-steps :space="600" :active="activeIndex-0" finish-status="success" align-center>
        <el-step @click="activeIndex=1" title="表单配置"></el-step>
        <el-step @click="activeIndex=0" title="流程配置"></el-step>
      </el-steps>
      <el-button style="margin-top: 12px" @click="next">Next step</el-button>

      <div v-show="activeIndex===0">
        <generator/>
      </div>
      <div v-show="activeIndex!==0">
        <DesignCenter/>
      </div>
    </el-card>
  </div>
</template>

<script>
import Generator from '@/views/generator/index.vue'
import DesignCenter from '@/components/design-center'

export default {
  components: { Generator, DesignCenter },
  data() {
    return {
      activeIndex: 0
    }
  },
  created() {
  },
  methods: {
    next: function() {
      this.activeIndex = this.activeIndex + 1
      if (this.activeIndex > 1) {
        this.activeIndex = 0
      }
    }
  }
}
</script>

<style scoped lang="less">

</style>

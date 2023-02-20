<template>
  <div>
    <!--  卡片视图区-->
    <el-card>
      <!--    步骤条-->
      <el-steps :space="600" :active="activeIndex-0" finish-status="success" align-center>
        <el-step @click="activeIndex=1" title="表单配置"></el-step>
        <el-step @click="activeIndex=0" title="流程配置"></el-step>
      </el-steps>

      <div v-show="activeIndex===0">
        <generator/>
      </div>
      <div v-show="activeIndex!==0">
        none
      </div>
    </el-card>
  </div>
</template>

<script>
import Generator from '@/views/generator/index.vue'

export default {
  components: { Generator },
  data() {
    return {
      activeIndex: 0
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有分类数据
    async getCateList() {

    }
  }
}
</script>

<style scoped lang="less">

</style>

<template>
  <div>
    <!--  卡片视图区-->
    <el-card>
      <!--    步骤条-->
      <el-steps :space="800" :simple="true" :active="activeIndex" finish-status="success" align-center>
        <el-step title="基础信息"/>
        <el-step title="表单配置"/>
        <el-step title="流程配置"/>
        <el-step title="发布表单"/>
      </el-steps>
    </el-card>
    <el-tabs :tab-position="tabPosition" v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane name="base" label="基础信息">
        <generator/>
      </el-tab-pane>
      <el-tab-pane name="form" label="表单配置">
        <DesignCenter/>
      </el-tab-pane>
      <el-tab-pane name="process" label="流程配置">
        Role
      </el-tab-pane>
      <el-tab-pane name="deploy" label="发布表单">
        deploy
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import Generator from '@/views/generator/index.vue'
import DesignCenter from '@/components/design-center'

export default {
  components: { Generator, DesignCenter },
  data() {
    return {
      tabPosition: 'left',
      activeIndex: 0,
      activeName: 'base'
    }
  },
  created() {
  },
  methods: {
    handleClick(tab, event) {
      if (tab.name === 'base') {
        this.activeIndex = 0
      }
      if (tab.name === 'form') {
        this.activeIndex = 1
      }
      if (tab.name === 'process') {
        this.activeIndex = 2
      }
      if (tab.name === 'deploy') {
        this.activeIndex = 3
      }
    },
    next: function() {
      this.activeIndex = this.activeIndex + 1
      if (this.activeIndex > 1) {
        this.activeIndex = 0
      }
    }
  }
}
</script>

<style lang="css">
.el-card__body {
  margin: 0;
  padding: 0;
}

.demo-tabs > .el-tabs__content {
  padding: 0;
  height: 900px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}
</style>

<style lang="css" scoped>
hr {
  margin: 0;
  padding: 0;
  border: 0px;
}
</style>

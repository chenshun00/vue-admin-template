<template>
  <div>
    <div style="position: relative;">
      <el-tabs v-model="activeStep" :tab-position="tabPosition">
        <!--基础信息-->
        <el-tab-pane name="basicSetting" label="基础信息">
          <BasicSetting
            v-show="activeStep === 'basicSetting'"
            ref="basicSetting"
            tab-name="basicSetting"
            @initiatorChange="onInitiatorChange"
          />
        </el-tab-pane>
        <!-- 表单设计 -->
        <el-tab-pane name="formDesign" label="表单设计">
          <DynamicForm
            v-show="activeStep === 'formDesign'"
            ref="formDesign"
            tab-name="formDesign"
          />
        </el-tab-pane>
        <!-- 流程设计 -->
        <el-tab-pane name="processDesign" label="流程设计">
          <design-center
            v-show="activeStep === 'processDesign'"
            ref="processDesign"
            tab-name="processDesign"
            @startNodeChange="onStartChange"
          />
        </el-tab-pane>
        <!--高级设置-->
        <el-tab-pane name="advancedSetting" label="高级设置">
          <AdvancedSetting
            v-show="activeStep === 'advancedSetting'"
            ref="advancedSetting"
          />
        </el-tab-pane>
      </el-tabs>
      <el-button size="small" style="position: absolute;right:10px;top:5px;" class="publish-btn" @click="publish">
        发布
      </el-button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import BasicSetting from '@/components/BasicSetting'
import DynamicForm from '@/components/formDesign/index.vue'
import DesignCenter from '@/components/design-center'
import AdvancedSetting from '@/components/AdvancedSetting'

const beforeUnload = function(e) {
  const confirmationMessage = '离开网站可能会丢失您编辑得内容';
  (e || window.event).returnValue = confirmationMessage
  return confirmationMessage
}

export default {
  name: 'CustomForm',
  components: {
    BasicSetting,
    DynamicForm,
    DesignCenter,
    AdvancedSetting
  },
  props: {
    title: {
      type: String,
      default: '自定义表单'
    }
  },
  data() {
    return {
      tabPosition: 'top',
      mockData: null, // 可选择诸如 $route.param，Ajax获取数据等方式自行注入
      activeStep: 'basicSetting'
    }
  },
  beforeRouteEnter(to, from, next) {
    window.addEventListener('beforeunload', beforeUnload)
    next()
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener('beforeunload', beforeUnload)
    next()
  },
  mounted() {
    //
  },
  methods: {
    publish() {
      const getCmpData = name => this.$refs[name].getData()
      // basicSetting  formDesign processDesign 返回的是Promise 因为要做校验
      // advancedSetting返回的就是值
      const p1 = getCmpData('basicSetting')
      const p2 = getCmpData('formDesign')
      const p3 = getCmpData('processDesign')
      Promise.all([p1, p2, p3])
        .then(res => {
          const param = {
            basicSetting: res[0]['formData'],
            formDesign: res[1]['formData'],
            processDesign: res[2]['formData'],
            advancedSetting: getCmpData('advancedSetting')
          }
          this.sendToServer(param)
        })
        .catch(err => {
          err.target && (this.activeStep = err.target)
          err.msg && this.$message.warning(err.msg)
        })
    },
    sendToServer(param) {
      this.$notify({
        title: '数据已整合完成',
        message: '请在控制台中查看数据输出',
        position: 'bottom-right'
      })
      console.log('配置数据', param)
    },
    /**
     * 同步基础设置发起人和流程节点发起人
     */
    onInitiatorChange(val, labels) {
      const processCmp = this.$refs.processDesign
      const startNode = processCmp.data
      startNode.properties.initiator = val['dep&user']
      startNode.content = labels || '所有人'
      processCmp.forceUpdate()
    },
    /**
     * 监听 流程节点发起人改变 并同步到基础设置 发起人数据
     */
    onStartChange(node) {
      const basicSetting = this.$refs.basicSetting
      basicSetting.formData.initiator = { 'dep&user': node.properties.initiator }
    }
  }
}
</script>
<style lang="stylus" scoped>
$header-height = 54px;
.page {
  width: 100%;
  height: 100%;
  padding-top: $header-height;
  box-sizing: border-box;

  .page__header {
    width: 100%;
    height: $header-height;
    flex-center()
    justify-content: space-between;
    box-sizing: border-box;
    color: white;
    background: #3296fa;
    font-size: 14px;
    position: fixed;
    top: 0;

    .page-actions {
      height: 100%;
      text-align: center;
      line-height: $header-height;

      > div {
        height: 100%;
        padding-left: 20px;
        padding-right: 20px;
        display: inline-block;
      }

      i {
        font-size: 22px;
        vertical-align: middle;
      }
    }

    .step-tab {
      display: flex;
      justify-content: center;
      height: 100%;
      position: relative;

      > .step {
        width: 140px;
        line-height: $header-height;
        padding-left: 30px;
        padding-right: 30px;
        cursor: pointer;
        position: relative;

        &.ghost-step {
          position: absolute;
          height: $header-height;
          left: 0;
          z-index: -1;
          background: #4483f2;
          transition: transform .5s;

          &::after {
            content: '';
            border-width: 6px 6px 6px;
            border-style: solid;
            border-color: transparent transparent white;
            position: absolute;
            bottom: 0;
            left: 50%;
            margin-left: -6px;
          }
        }

        &.active > .step-index {
          background: white;
          color: #4483f2;
        }

        > .step-index {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 1px solid #fff;
          border-radius: 8px;
          line-height: 18px;
          text-align: center;
          box-sizing: border-box;
        }
      }
    }
  }

  .page__content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    background #f5f5f7
  }
}

.publish-btn {
  margin-right: 20px;
  color: #3296fa;
  padding: 7px 20px;
  border-radius: 4px;
  font-size: 14px;
}

.github {
  position fixed
  bottom 10px
  left 20px
}
</style>

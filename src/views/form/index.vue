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
            :conf="mockData.basicSetting"
            @initiatorChange="onInitiatorChange"
          />
        </el-tab-pane>
        <!-- 表单设计 -->
        <el-tab-pane name="formDesign" label="表单设计">
          <DynamicForm
            v-show="activeStep === 'formDesign'"
            ref="formDesign"
            :conf="mockData.formDesign"
            tab-name="formDesign"
            @onChange="onChange"
          />
        </el-tab-pane>
        <!-- 流程设计 -->
        <el-tab-pane name="processDesign" label="流程设计">
          <design-center
            v-show="activeStep === 'processDesign'"
            ref="processDesign"
            :form-field-list="formFields"
            :process-design="mockData.processDesign"
            tab-name="processDesign"
            @startNodeChange="onStartChange"
          />
        </el-tab-pane>
        <!--高级设置-->
        <el-tab-pane name="advancedSetting" label="高级设置">
          <AdvancedSetting
            v-show="activeStep === 'advancedSetting'"
            :conf="mockData.advancedSetting"
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
      mockData: JSON.parse('{"basicSetting":{"flowName":"审批名称1","flowImg":0,"flowGroup":1,"flowRemark":"审批说明1"},"formDesign":{"fields":[{"__config__":{"label":"姓名","labelWidth":null,"showLabel":true,"changeTag":true,"tag":"el-input","tagIcon":"input","required":true,"layout":"colFormItem","span":24,"document":"https://element.eleme.cn/#/zh-CN/component/input","regList":[],"formId":101,"renderKey":"1011677476889135","defaultValue":""},"__slot__":{"prepend":"","append":""},"placeholder":"请输入单行文本姓名","style":{"width":"100%"},"clearable":true,"prefix-icon":"","suffix-icon":"","maxlength":null,"show-word-limit":false,"readonly":false,"disabled":false,"__vModel__":"field001"},{"__config__":{"label":"性别","labelWidth":null,"showLabel":true,"tag":"el-radio-group","tagIcon":"radio","changeTag":true,"layout":"colFormItem","span":24,"optionType":"default","regList":[],"required":true,"border":false,"document":"https://element.eleme.cn/#/zh-CN/component/radio","formId":102,"renderKey":"1021676974428451","defaultValue":2},"__slot__":{"options":[{"label":"男","value":"男"},{"label":"女","value":"女"}]},"style":{},"size":"medium","disabled":false,"__vModel__":"field102"},{"__config__":{"label":"推荐人","labelWidth":null,"showLabel":true,"changeTag":true,"tag":"el-input","tagIcon":"input","required":true,"layout":"colFormItem","span":24,"document":"https://element.eleme.cn/#/zh-CN/component/input","regList":[],"formId":103,"renderKey":"1031677577179408"},"__slot__":{"prepend":"","append":""},"placeholder":"请输入推荐人","style":{"width":"100%"},"clearable":true,"prefix-icon":"","suffix-icon":"","maxlength":null,"show-word-limit":false,"readonly":false,"disabled":false,"__vModel__":"field103"},{"__config__":{"label":"下拉选择","showLabel":true,"labelWidth":null,"tag":"el-select","tagIcon":"select","layout":"colFormItem","span":24,"required":true,"regList":[],"changeTag":true,"document":"https://element.eleme.cn/#/zh-CN/component/select","formId":101,"renderKey":"1011676975236534"},"__slot__":{"options":[{"label":"选项一","value":1},{"label":"选项二","value":2}]},"placeholder":"请选择下拉选择下拉选择下拉选择","style":{"width":"100%"},"clearable":true,"disabled":false,"filterable":false,"multiple":false,"__vModel__":"field101"},{"__config__":{"label":"牛逼的","labelWidth":null,"showLabel":true,"changeTag":true,"tag":"el-input","tagIcon":"input","required":true,"layout":"colFormItem","span":24,"document":"https://element.eleme.cn/#/zh-CN/component/input","regList":[],"formId":102,"renderKey":"1021677562806469"},"__slot__":{"prepend":"","append":""},"placeholder":"请输入牛逼的","style":{"width":"100%"},"clearable":true,"prefix-icon":"","suffix-icon":"","maxlength":null,"show-word-limit":false,"readonly":false,"disabled":false,"__vModel__":"field102"},{"__config__":{"label":"评分","tag":"el-rate","tagIcon":"rate","defaultValue":0,"span":24,"showLabel":true,"labelWidth":null,"layout":"colFormItem","required":true,"regList":[],"changeTag":true,"document":"https://element.eleme.cn/#/zh-CN/component/rate","formId":103,"renderKey":"1031677563464532"},"style":{},"max":5,"allow-half":false,"show-text":false,"show-score":false,"disabled":false,"__vModel__":"field103"},{"__config__":{"label":"ficl有","tag":"el-date-picker","tagIcon":"date","defaultValue":null,"showLabel":true,"labelWidth":null,"span":24,"layout":"colFormItem","required":true,"regList":[],"changeTag":true,"document":"https://element.eleme.cn/#/zh-CN/component/date-picker","formId":104,"renderKey":"1041677563477031"},"placeholder":"请选择ficl有","type":"date","style":{"width":"100%"},"disabled":false,"clearable":true,"format":"yyyy-MM-dd","value-format":"yyyy-MM-dd","readonly":false,"__vModel__":"field104"}],"conf":{"formRef":"elForm","formModel":"formData","size":"medium","labelPosition":"right","labelWidth":80,"formRules":"rules","gutter":15,"disabled":false,"span":24,"formBtns":true}},"processDesign":{"fields":{"taskList":[{"taskNodeId":"task-start","taskNodeName":"发起人","taskNodeDescription":"所有人111","taskType":"start"},{"taskNodeId":"node-approver-fdc7-46b2-ac8a","taskNodeName":"审批人","taskNodeDescription":"张三","taskType":"audit","participant":{"list":{"u_user":[{"nodeId":20,"userId":20,"userName":"张三","deptId":1},{"nodeId":30,"userId":30,"userName":"李四","deptId":1}]},"type":"assign"},"buttonList":[],"opinionSetting":{"textOpinionName":"文本意见","textOpinionEnabled":false,"textOpinionRequired":false,"textOpinionTip":"","writeSignatureName":"手写签名","writeSignatureEnabled":false,"writeSignatureRequired":false,"writeSignatureCanUseLast":false},"taskRule":"countersign","canTransfer":false,"canRollback":false,"participantEmptyRule":"auto_complete","initiatorAutoComplete":true,"rollbackSubmitType":"backtracked"},{"taskNodeId":"task-end","taskNodeName":"结束","taskType":"end"}],"sequenceList":[{"id":"task-10ed-42f0-bccf","name":null,"conditionList":[],"sourceTaskId":"task-start","targetTaskId":"node-approver-fdc7-46b2-ac8a"},{"id":"task-abd2-4027-a887","name":null,"conditionList":[],"sourceTaskId":"node-approver-fdc7-46b2-ac8a","targetTaskId":"task-end"}],"flowCode":"","flowName":""}},"advancedSetting":{"autoRepeat":false,"myAuditAutoPass":true,"remarkTip":"dddd","remarkRequired":false,"notVisibleForSponsor":false}}'),
      activeStep: 'basicSetting',
      formFields: []
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
    this.mockData = JSON.parse('{"basicSetting":{"flowName":"审批名称1","flowImg":0,"flowGroup":1,"flowRemark":"审批说明1"},"formDesign":{"fields":[{"__config__":{"label":"姓名","labelWidth":null,"showLabel":true,"changeTag":true,"tag":"el-input","tagIcon":"input","required":true,"layout":"colFormItem","span":24,"document":"https://element.eleme.cn/#/zh-CN/component/input","regList":[],"formId":101,"renderKey":"1011677476889135","defaultValue":""},"__slot__":{"prepend":"","append":""},"placeholder":"请输入单行文本姓名","style":{"width":"100%"},"clearable":true,"prefix-icon":"","suffix-icon":"","maxlength":null,"show-word-limit":false,"readonly":false,"disabled":false,"__vModel__":"field001"},{"__config__":{"label":"性别","labelWidth":null,"showLabel":true,"tag":"el-radio-group","tagIcon":"radio","changeTag":true,"layout":"colFormItem","span":24,"optionType":"default","regList":[],"required":true,"border":false,"document":"https://element.eleme.cn/#/zh-CN/component/radio","formId":102,"renderKey":"1021676974428451","defaultValue":2},"__slot__":{"options":[{"label":"男","value":"男"},{"label":"女","value":"女"}]},"style":{},"size":"medium","disabled":false,"__vModel__":"field102"},{"__config__":{"label":"推荐人","labelWidth":null,"showLabel":true,"changeTag":true,"tag":"el-input","tagIcon":"input","required":true,"layout":"colFormItem","span":24,"document":"https://element.eleme.cn/#/zh-CN/component/input","regList":[],"formId":103,"renderKey":"1031677577179408"},"__slot__":{"prepend":"","append":""},"placeholder":"请输入推荐人","style":{"width":"100%"},"clearable":true,"prefix-icon":"","suffix-icon":"","maxlength":null,"show-word-limit":false,"readonly":false,"disabled":false,"__vModel__":"field103"},{"__config__":{"label":"下拉选择","showLabel":true,"labelWidth":null,"tag":"el-select","tagIcon":"select","layout":"colFormItem","span":24,"required":true,"regList":[],"changeTag":true,"document":"https://element.eleme.cn/#/zh-CN/component/select","formId":101,"renderKey":"1011676975236534"},"__slot__":{"options":[{"label":"选项一","value":1},{"label":"选项二","value":2}]},"placeholder":"请选择下拉选择下拉选择下拉选择","style":{"width":"100%"},"clearable":true,"disabled":false,"filterable":false,"multiple":false,"__vModel__":"field101"},{"__config__":{"label":"牛逼的","labelWidth":null,"showLabel":true,"changeTag":true,"tag":"el-input","tagIcon":"input","required":true,"layout":"colFormItem","span":24,"document":"https://element.eleme.cn/#/zh-CN/component/input","regList":[],"formId":102,"renderKey":"1021677562806469"},"__slot__":{"prepend":"","append":""},"placeholder":"请输入牛逼的","style":{"width":"100%"},"clearable":true,"prefix-icon":"","suffix-icon":"","maxlength":null,"show-word-limit":false,"readonly":false,"disabled":false,"__vModel__":"field102"},{"__config__":{"label":"评分","tag":"el-rate","tagIcon":"rate","defaultValue":0,"span":24,"showLabel":true,"labelWidth":null,"layout":"colFormItem","required":true,"regList":[],"changeTag":true,"document":"https://element.eleme.cn/#/zh-CN/component/rate","formId":103,"renderKey":"1031677563464532"},"style":{},"max":5,"allow-half":false,"show-text":false,"show-score":false,"disabled":false,"__vModel__":"field103"},{"__config__":{"label":"ficl有","tag":"el-date-picker","tagIcon":"date","defaultValue":null,"showLabel":true,"labelWidth":null,"span":24,"layout":"colFormItem","required":true,"regList":[],"changeTag":true,"document":"https://element.eleme.cn/#/zh-CN/component/date-picker","formId":104,"renderKey":"1041677563477031"},"placeholder":"请选择ficl有","type":"date","style":{"width":"100%"},"disabled":false,"clearable":true,"format":"yyyy-MM-dd","value-format":"yyyy-MM-dd","readonly":false,"__vModel__":"field104"}],"conf":{"formRef":"elForm","formModel":"formData","size":"medium","labelPosition":"right","labelWidth":80,"formRules":"rules","gutter":15,"disabled":false,"span":24,"formBtns":true}},"processDesign":{"fields":{"taskList":[{"taskNodeId":"task-start","taskNodeName":"发起人","taskNodeDescription":"所有人111","taskType":"start"},{"taskNodeId":"node-approver-fdc7-46b2-ac8a","taskNodeName":"审批人","taskNodeDescription":"张三","taskType":"audit","participant":{"list":{"u_user":[{"nodeId":20,"userId":20,"userName":"张三","deptId":1},{"nodeId":30,"userId":30,"userName":"李四","deptId":1}]},"type":"assign"},"buttonList":[],"opinionSetting":{"textOpinionName":"文本意见","textOpinionEnabled":false,"textOpinionRequired":false,"textOpinionTip":"","writeSignatureName":"手写签名","writeSignatureEnabled":false,"writeSignatureRequired":false,"writeSignatureCanUseLast":false},"taskRule":"countersign","canTransfer":false,"canRollback":false,"participantEmptyRule":"auto_complete","initiatorAutoComplete":true,"rollbackSubmitType":"backtracked"},{"taskNodeId":"task-end","taskNodeName":"结束","taskType":"end"}],"sequenceList":[{"id":"task-10ed-42f0-bccf","name":null,"conditionList":[],"sourceTaskId":"task-start","targetTaskId":"node-approver-fdc7-46b2-ac8a"},{"id":"task-abd2-4027-a887","name":null,"conditionList":[],"sourceTaskId":"node-approver-fdc7-46b2-ac8a","targetTaskId":"task-end"}],"flowCode":"","flowName":""}},"advancedSetting":{"autoRepeat":false,"myAuditAutoPass":true,"remarkTip":"dddd","remarkRequired":false,"notVisibleForSponsor":false}}')
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
      console.log('配置数据', JSON.stringify(param))
    },
    onChange(val) {
      this.formFields = val
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

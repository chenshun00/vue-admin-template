<template>
  <div>
    <div style="position: relative;align-items: center;">
      <el-tabs v-model="activeStep" :tab-position="tabPosition" stretch>
        <!--基础信息-->
        <el-tab-pane name="basicSetting" label="基础信息">
          <BasicSetting
            v-show="activeStep === 'basicSetting'"
            ref="basicSetting"
            tab-name="basicSetting"
            :conf="mockData.basicSetting"
            @initiatorChange="onInitiatorChange"
            @onNeedApproval="onNeedApproval"
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
              ref="advancedSetting"
              :conf="mockData.advancedSetting"
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
      processDisable: 2,
      mockData: null,
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
    this.mockData = JSON.parse('{"basicSetting":{"flowName":"审批名称","flowImg":0,"flowGroup":2,"flowRemark":"审批说明"},"formDesign":{"fields":[{"__config__":{"label":"单行文本","labelWidth":null,"showLabel":true,"changeTag":true,"tag":"el-input","tagIcon":"input","required":true,"layout":"colFormItem","span":24,"document":"https://element.eleme.cn/#/zh-CN/component/input","regList":[],"formId":101,"renderKey":"1011677680159501"},"__slot__":{"prepend":"","append":""},"placeholder":"请输入单行文本","style":{"width":"100%"},"clearable":true,"prefix-icon":"","suffix-icon":"","maxlength":null,"show-word-limit":false,"readonly":false,"disabled":false,"__vModel__":"field101"},{"__config__":{"label":"单选框组","labelWidth":null,"showLabel":true,"tag":"el-radio-group","tagIcon":"radio","changeTag":true,"layout":"colFormItem","span":24,"optionType":"default","regList":[],"required":true,"border":false,"document":"https://element.eleme.cn/#/zh-CN/component/radio","formId":102,"renderKey":"1021677680185005"},"__slot__":{"options":[{"label":"选项一","value":1},{"label":"选项二","value":2}]},"style":{},"size":"medium","disabled":false,"__vModel__":"field102"}],"conf":{"formRef":"elForm","formModel":"formData","size":"medium","labelPosition":"right","labelWidth":80,"formRules":"rules","gutter":15,"disabled":false,"span":24,"formBtns":true}},"processDesign":{"fields":{"taskList":[{"taskNodeId":"task-start","taskNodeName":"发起人","taskNodeDescription":"所有人","taskType":"start"},{"taskNodeId":"node-cbs-5413-4df3-b8c4","taskNodeName":"条件分支","taskType":"start_exclusive_gateway","oppositeTaskId":"node-cbe-c42c-47d7-b716"},{"taskNodeId":"node-approver-5c52-4ebf-9dae","taskNodeName":"审批人","taskNodeDescription":"李四","taskType":"audit","participant":{"list":{"u_user":[{"nodeId":30,"userId":30,"userName":"李四","deptId":1}]},"type":"assign"},"buttonList":[],"opinionSetting":{"textOpinionName":"文本意见","textOpinionEnabled":false,"textOpinionRequired":false,"textOpinionTip":"","writeSignatureName":"手写签名","writeSignatureEnabled":false,"writeSignatureRequired":false,"writeSignatureCanUseLast":false},"taskRule":"countersign","canTransfer":false,"canRollback":false,"participantEmptyRule":"auto_complete","initiatorAutoComplete":true,"rollbackSubmitType":"backtracked"},{"taskNodeId":"node-approver-95ce-463e-9da5","taskNodeName":"审批人","taskNodeDescription":"张三","taskType":"audit","formFieldList":[{"fieldKey":"field101","fieldName":"单行文本","editable":false,"canWrite":false,"canView":true,"useCondition":false,"textVisible":false,"require":true},{"fieldKey":"field102","fieldName":"单选框组","editable":false,"canWrite":false,"canView":true,"useCondition":false,"textVisible":false,"require":true}],"participant":{"list":{"u_user":[{"nodeId":20,"userId":20,"userName":"张三","deptId":1}]},"type":"assign"},"buttonList":[],"opinionSetting":{"textOpinionName":"文本意见","textOpinionEnabled":false,"textOpinionRequired":false,"textOpinionTip":"","writeSignatureName":"手写签名","writeSignatureEnabled":false,"writeSignatureRequired":false,"writeSignatureCanUseLast":false},"taskRule":"countersign","canTransfer":false,"canRollback":false,"participantEmptyRule":"auto_complete","initiatorAutoComplete":true,"rollbackSubmitType":"backtracked"},{"taskNodeId":"node-cbe-c42c-47d7-b716","taskNodeName":"条件结束","taskType":"end_exclusive_gateway","oppositeTaskId":"node-cbs-5413-4df3-b8c4"},{"taskNodeId":"task-end","taskNodeName":"结束","taskType":"end"}],"sequenceList":[{"id":"task-fee9-4240-8a03","name":null,"conditionList":[],"sourceTaskId":"task-start","targetTaskId":"node-cbs-5413-4df3-b8c4"},{"id":"task-7d6c-48b8-ac40","name":null,"conditionList":[{"fieldKey":"field102","conditionType":"equal","conditionCode":"radio","value":[1],"order":0,"leftBracket":true,"rightBracket":true,"unionLogic":null}],"type":"general","sourceTaskId":"node-cbs-5413-4df3-b8c4","targetTaskId":"node-approver-5c52-4ebf-9dae"},{"id":"task-0876-4eb7-899c","name":null,"conditionList":[],"type":"other_condition","sourceTaskId":"node-cbs-5413-4df3-b8c4","targetTaskId":"node-approver-95ce-463e-9da5"},{"id":"task-e4d6-4de7-91d9","name":null,"conditionList":[],"sourceTaskId":"node-approver-5c52-4ebf-9dae","targetTaskId":"node-cbe-c42c-47d7-b716"},{"id":"task-abe6-444e-9971","name":null,"conditionList":[],"sourceTaskId":"node-approver-95ce-463e-9da5","targetTaskId":"node-cbe-c42c-47d7-b716"},{"id":"task-a43e-49f1-b5e9","name":null,"conditionList":[],"sourceTaskId":"node-cbe-c42c-47d7-b716","targetTaskId":"task-end"}],"flowCode":"","flowName":""}},"advancedSetting":{"autoRepeat":false,"myAuditAutoPass":false,"remarkTip":"","remarkRequired":false,"notVisibleForSponsor":false}}')
    this.formFields = this.mockData ? this.mockData.formDesign.fields: []
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
    onNeedApproval(val) {
      this.processDisable = val
    },
    /**
     * 同步基础设置发起人和流程节点发起人
     */
    onInitiatorChange(val, labels) {
      const processCmp = this.$refs.processDesign
      const startNode = processCmp.data
      startNode.properties.initiator = val['dep&user']
      startNode.content = labels || '发起人'
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
<style lang="scss" scoped>
/* $header-height = 54px; */

::v-deep .el-tabs__nav-scroll{
    width:30%;
    margin:0 auto
  }

::v-deep .el-tabs__header {
    margin: 0 0 0 0
  }
</style>

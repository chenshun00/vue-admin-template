<template>
  <div ref="">
    {{ this.test }}
    <div class="flow-container">
      <FlowLayout
        :fields="formFields"
        :root-node="startNode"
        :curr-node="currNode"
        @click-node="handleClickNode"
        @update-node="handleUpdateNode"
      />

      <SidePanel
        ref="panel"
        :node="currNode"
        :project-only="!!projectSysNo"
        :join-plan="joinPlan"
        :fields="formFields"
        :visible.sync="visible"
      />

      <ConditionSettings
        v-if="currNode && conditionVisible"
        :node="currNode"
        :fields="conditionFields"
        :using-condition-fields="usingConditionFields"
        :visible.sync="conditionVisible"
      >
        <template slot="title">
          流转条件设置
          <span style="color: red">(表单必填字段可作为审批条件)</span>
        </template>
      </ConditionSettings>
    </div>
  </div>
</template>

<script>
import './styles.scss'
import { toJSON } from './adapters/toJSON'
import { toModel } from './adapters/toModel'
import { nodeDeepIterator } from './components/flow/helpers/NodeUtils'
import Flow from './components/flow/helpers/Flow'
import Node from './components/flow/helpers/Node'
import NodeManager from './components/flow/helpers/NodeManager'
import SidePanel from './components/panel/index'
import FlowLayout from './components/flow/index'
import ConditionSettings from './_condition-settings'
import { BUSINESS_FLOW } from './constants/FLOW_TYPE'
import { SPONSOR_TYPE_NAME } from './constants/CONDITION_ADDITION'
import { updateFieldsWithMerge } from './utils/fieldsHelpers'
import { getDrawingList } from '@/utils/db'
import { CONDITION_TYPES } from '@/components/design-center/constants/ENUM_DEFINITIONS'

export default {
  name: 'DesignCenter',
  components: {
    SidePanel,
    FlowLayout,
    ConditionSettings
  },
  props: {
    test: {
      type: Array
    }
  },
  data() {
    return {
      currNode: null,
      conditionVisible: false,
      projectSysNo: this.$route && this.$route.params.projectSysNo,

      dirty: false /* 用户是否更新过节点 */,
      startNode: null,
      // errorMsg: [{ key: 1, txt: [] }],
      isDev: process.env.NODE_ENV !== 'production',
      usingConditionFields: {},

      flowForm: {},
      flowModel: {},
      flowSponsors: {},
      flowSettings: {},

      currentOrganization: {},

      corpSysNo: ''
    }
  },
  computed: {
    formFields() {
      const f = getDrawingList()
      const ff = []
      f.forEach(item => {
        const gg = {
          fieldKey: item.__vModel__,
          fieldName: item.__config__.label,
          type: item.__config__.tagIcon,
          require: item.__config__.required,
          editable: false,
          canWrite: false,
          canView: false,
          useCondition: false,
          textVisible: false
        }
        ff.push(gg)
      })
      return ff
    },
    flowFields() {
      return []
    },
    joinPlan() {
      /**
       * 根据JoinPlan字段判断，
       *   为1时，表单字段权限和以前一样
       *   为2时，表单的可见与可编辑根据表单设计的textVisible, editable确定
       *   为3时，表单字段权限标签隐藏掉
       */
      if (this.isBusinessFlow) {
        return (this.flowForm && this.flowForm.joinPlan) || 1
      }

      // 默认为1
      return 1
    },
    // 是否是业务流程
    isBusinessFlow() {
      return this.flowSettings && this.flowSettings.flowType === BUSINESS_FLOW
    },
    // 条件字段
    conditionFields() {
      console.log('----')
      const f = getDrawingList()
      const ff = []
      f.filter(x => {
        return Object.values(CONDITION_TYPES).indexOf(x.__config__.tagIcon) > 0
      }).forEach(item => {
        const gg = {
          fieldKey: item.__vModel__,
          fieldName: item.__config__.label,
          fieldType: item.__config__.tagIcon,
          fieldOptions: item.__slot__&&item.__slot__.options? item.__slot__.options: []
        }
        ff.push(gg)
      })
      console.log(ff)
      return ff
    },
    flowCode() {
      return this.$route.query && this.$route.query.flowCode
    },
    isReady() {
      return !!this.startNode
    },
    visible: {
      get() {
        return (
          this.currNode &&
          this.currNode.type !== Node.TYPE.CONDITION_NODE &&
          Boolean(this.currNode)
        )
      },
      set(val) {
        if (!val && this.currNode) {
          this.currNode = null
          this.$refs.panel.activeName = 'node'

          return false
        }
      }
    }
  },
  watch: {
    conditionVisible(val) {
      if (!val && this.currNode) this.currNode = null
    },
    flowModel(val, oldVal) {
      /**
       * flowModel 仅需要在第一次被传值时初始化，否则后续重新赋值 this.startNode 导致当前被操作的 currNode 引用变化
       g         */
      const hasOld =
        oldVal &&
        typeof oldVal === 'object' &&
        Boolean(Object.keys(oldVal).length)

      if (!hasOld && oldVal !== val) {
        val && this.getUsingConditionFields()
        val && this.initViewModel()
      }
    },
    flowSponsors(val) {
      val && this.startNode && this.startNode.read(this.flowSponsors)
    },
    flowSettings() {
      this.updateStartNode()
    },
    flowFields(val, oldVal) {
      if (Array.isArray(val) && Array.isArray(oldVal)) {
        if (val.length !== oldVal.length) {
          this.updateFieldsList()
        }
      }
    },
    startNode: {
      deep: true,
      handler(newval, oldVal) {
        if (newval && oldVal && newval === oldVal) {
          this.dirty = true
        }

        this.updateStartNode()
      }
    },
    usingConditionFields: {
      deep: true,
      handler() {
        this.updateFieldsWritable()
      }
    }
  },
  created() {
    this.listenEvent()
    this.getUsingConditionFields()
    this.initViewModel()
  },
  beforeRouteLeave(to, from, next) {
    // 切换 tab 才存
    this.$root && this.$root.$off('wf-save')
    this.$root && this.$root.$off('wf-release')

    // 如果 el-drawer 未被关闭，需要编程式关闭
    if (this.visible) {
      this.visible = false
    }

    if (this.dirty) {
      try {
        const ignoreError = true
        this.$store.commit(
          'workFlow/setDesignProcess',
          this.geneFlowModel(ignoreError)
        )
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error(e)
        }

        this.$message({
          message: e.message || e,
          type: 'warning'
        })
      }
    }

    next()
  },
  destroyed() {
    NodeManager.clear()
  },
  methods: {
    getUsingConditionFields() {
      const localConditions = Object.keys(SPONSOR_TYPE_NAME)
      const conditions = ((this.flowModel || {}).sequenceList || [])
        .map((i) => i.conditionList)
        .filter((i) => i && i.length)
      const allResult = []
      conditions.forEach((i) => allResult.push(...i))
      const result = (allResult || [])
        .map((i) => i.fieldKey)
        .filter((i) => !localConditions.includes(i))
      result.forEach((i) => {
        if (!Reflect.has(this.usingConditionFields, i)) {
          this.$set(
            this.usingConditionFields,
            i,
            result.filter((x) => x === i).length
          )
        }
      })
    },
    listenEvent() {
      this.$root && this.$root.$on('wf-save', this.handleSave)
      this.$root && this.$root.$on('wf-release', this.handleRelease)
    },
    initViewModel() {
      this.startNode = toModel(
        this.flowModel || {},
        {
          conditionFields: this.conditionFields,
          flowFields: this.flowFields
        },
        this.isBusinessFlow
      )

      this.startNode &&
      this.flowFields &&
      this.flowFields.length &&
      this.updateFieldsList()
    },
    updateStartNode() {
      const currTitle = this.startNode && this.startNode.read()
      const settings = this.flowSettings
      const newTitle =
        this.flowSponsors ||
        (settings &&
          settings.applyScope &&
          settings.applyScope.applyScopeName)

      if (this.startNode && (!currTitle || currTitle !== newTitle)) {
        this.startNode.read(newTitle)
      }
    },
    updateFieldsList() {
      const nodeProps = this.startNode && this.startNode.props
      const oldFields = nodeProps && nodeProps.formFieldList

      if (
        !oldFields ||
        !oldFields.length ||
        this.flowFields.length !== oldFields.length
      ) {
        nodeDeepIterator(this.startNode, (node) => {
          node.updateProps({
            formFieldList: updateFieldsWithMerge(
              this.flowFields.map((field) => ({
                ...field,
                canWrite: this.usingConditionFields[field.fieldKey]
                  ? false
                  : this.joinPlan === 1
              })),
              node.formFieldList,
              node.alias || node.type
            )
          })
        })

        this.handleUpdateNode(this.startNode)
      }
    },
    updateFieldsWritable() {
      nodeDeepIterator(this.startNode, (node) => {
        if (node.type !== Node.TYPE.SPONSOR_NODE) {
          (node.props.formFieldList || []).forEach((i) => {
            if (this.usingConditionFields[i.fieldKey]) {
              i.canWrite = false
            }
          })
          node.updateProps({
            formFieldList: node.props.formFieldList
          })
        }
      })
    },
    // 应该是生成节点信息
    geneFlowModel(ignoreError) {
      if (process.env.NODE_ENV === 'development') {
        console.log('ignoreError: ', ignoreError)
      }

      const flowData = toJSON(this.startNode, ignoreError)
      const { flowCode = '', flowName = '' } = this.flowSettings || {}

      const flowModel = {
        ...this.flowModel,
        flowCode,
        flowName,
        ...flowData
      }

      console.log('flowModel: ', flowModel)

      return flowModel
    },
    getData() {
      return new Promise((resolve, reject) => {
        resolve({
          formData: {
            fields: this.geneFlowModel(true)
          }
        })
      })
    },
    // 暂时没看懂
    handleSave(test) {
      try {
        if (test) {
          this.dirty && this.geneFlowModel(test)
        } else {
          this.$store.dispatch(
            'workFlow/saveDesignProcess',
            this.dirty && this.geneFlowModel(true)
          )
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error(e)
        }

        this.$message({
          message: e.message || e,
          type: 'warning'
        })
      }
    },
    // 暂时没有看到接口信息
    handleRelease() {
      try {
        this.$store.commit('workFlow/setDesignProcess', this.geneFlowModel())
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error(e)
        }

        return this.$message({
          message: e.message || e,
          type: 'warning'
        })
      }

      this.$store.dispatch('workFlow/publishFlow').then((path) => {
        this.$router.push({ path })
      })
    },
    // 修改当前接口，用户展现侧边栏以及其他信息
    handleClickNode(node) {
      this.currNode = node

      if (node.type === Node.TYPE.CONDITION_NODE) {
        this.conditionVisible = true
      } else {
        this.visible = true
      }
    },
    handleUpdateNode(node) {
      const { props, ...params } = node || NodeManager.getNode(this.startNode)

      this.startNode = Flow.createNode({ ...params, ...props })
      this.dirty = true
    }
  }
}
</script>

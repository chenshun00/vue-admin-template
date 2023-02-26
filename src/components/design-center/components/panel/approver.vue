<template>
  <div>
    <PanelBlock title="审批人节点名称">
      <el-input
        v-model="node.model.title"
        size="mini"
        @change="handleChange"
      />
    </PanelBlock>

    <PanelBlock title="审批人设置">
      <!-- 下拉选择指定人员/发起人自选-->
      <el-select
        v-model="participant.type"
        placeholder="请选择"
        class="flow-panel-radios"
      >
        <el-option
          v-for="option in participantTypesOpts"
          :key="option.value"
          v-bind="option"
        />
      </el-select>

      <!-- 是否展现 <添加指定人员的button> -->
      <div v-if="participant.type==='assign'" class="flow-panel-button">
        <fc-user-select
          ref="org-select"
          v-model="participant.list"
          :show="stationVisible"
          :tab-list="['u_user']"
          title="发起人"
          buttonType="button"
          @input="input"
        />
      </div>
    </PanelBlock>
  </div>
</template>

<script>
import FcUserSelect from '@/components/FormControls/UserSelect/index.vue'
import PropTypes from 'vue-types'
import Node from '../flow/helpers/Node'
import PanelBlock from './_base-block'
import FLOW_NODE_TYPE_ENUM from '../flow/constants/FLOW_NODE_TYPE_ENUM'
import FLOW_NODE_TYPE_PROPS from '../flow/constants/FLOW_NODE_TYPE_PROPS'
import { OPTIONAL_SCOPE_ENUM, OPTIONAL_SCOPE_KEYS, OPTIONAL_TYPE_ENUM } from './../../constants/OPTIONAL_PERSONAL'
import { ROLLBACK_ENUM } from './../../constants/ROLLBACK_ENUM'
import { checkDoesUserExist } from '../../service'
import { deepCopy } from '../../utils/index'
import {
  AUDIT_TYPES_NAME,
  FORM_FIELDS_KEYS,
  FORM_FIELDS_TYPES,
  NO_AUDIT_TYPES,
  PARTICIPANT_TYPES,
  PARTICIPANT_TYPES_NAME,
  PEOPLE_TYPES_KEY_MAP
} from '../../constants/ENUM_DEFINITIONS'
import { objectToOptions } from '../../utils/objectToOptions'
import { APPROVE_ORDER_ENUM, APPROVE_ORDER_TYPE } from '../../constants/POSITION_LABEL_SELECTION'

const fileds2options = (arr) =>
  arr.map(({ fieldKey, fieldName }) => ({
    value: fieldKey,
    label: fieldName
  }))

export default {
  name: 'ApproverPanel',
  type: FLOW_NODE_TYPE_ENUM.APPROVER_NODE,
  components: {
    PanelBlock,
    FcUserSelect
  },
  props: {
    // eslint-disable-next-line
    node: PropTypes.instanceOf(Node).required,
    // eslint-disable-next-line
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.def(''),
        fieldKey: PropTypes.string.isRequired,
        fieldName: PropTypes.string.isRequired,
        canView: PropTypes.bool.isRequired,
        canWrite: PropTypes.bool.isRequired,
        require: PropTypes.bool.isRequired,
        editable: PropTypes.bool.isRequired,
        textVisible: PropTypes.bool.isRequired,
        useCondition: PropTypes.bool.isRequired
      })
    )
  },
  data() {
    /**
     * http://shzhangji.com/blog/2018/04/17/form-handling-in-vuex-strict-mode/
     * 在反显的状态下数据来自 Vuex 不能直接更新，所以干脆就 deepCopy 一份数据
     */
    const canRollback = this.getValue('canRollback')
    return {
      optionalTypes: OPTIONAL_TYPE_ENUM,
      optionalScope: OPTIONAL_SCOPE_ENUM,
      /* 参与人类型 */
      participantTypesOpts: objectToOptions(PARTICIPANT_TYPES_NAME),
      participantTypes: PARTICIPANT_TYPES_NAME,
      /* 多人审批类型 */
      taskRuleTypes: AUDIT_TYPES_NAME,
      /* 审批人为空的类型 */
      // participantEmptyTypes: NO_AUDIT_TYPES_NAME,

      /* 审批优先级枚举 */
      approveOrderEnum: APPROVE_ORDER_ENUM,

      /* node props model */
      participant: this.getValue('participant'),
      stationVisible: false,
      opinionSetting: this.getValue('opinionSetting'),
      taskRule: this.getValue('taskRule'),
      canTransfer: this.getValue('canTransfer'),
      // transfer: this.getValue('transfer'),
      canRollback:
        canRollback === null || canRollback === undefined
          ? true
          : canRollback,
      participantEmptyRule:
        this.getValue('participantEmptyRule') ===
        NO_AUDIT_TYPES.AUTO_COMPLETE || false,
      initiatorAutoComplete: this.getValue('initiatorAutoComplete') || false,
      rollbackSubmitType: this.getValue('rollbackSubmitType'),
      /* is tansfer flag */
      // isTransfer: false,
      /* submit picker reactive data */
      pickerType: null, // SUBMIT_PICKER_TYPES[participant.type],
      isDirectRollback: false
    }
  },
  computed: {
    computedParticipantsList() {
      const list = this.participant.list
      const isPosition =
        this.participant.type === PARTICIPANT_TYPES.POSITION_LABEL ||
        (this.isOptionalPersonal &&
          this.participant.optionalScope ===
          OPTIONAL_SCOPE_KEYS.ASSIGN_POSITION_LABEL)
      return (list && list.length ? list : []).map((i) => ({
        ...i,
        [isPosition ? 'positionName' : 'nodeName']: i.name,
        parentFullName: i.parentFullName,
        sysNo: i.value,
        key: isPosition
          ? i.value
          : `${i.value}-${PEOPLE_TYPES_KEY_MAP[this.pickerType]}`
      }))
    },
    formRoleFields() {
      return this.fields.filter(({ type }) => type === FORM_FIELDS_KEYS.JOB)
    },
    formDepartmentFields() {
      return this.fields.filter(
        ({ type }) => type === FORM_FIELDS_KEYS.DEPARTMENT
      )
    },
    selectOptions() {
      return this.getSelectOptions()
    },
    showAddBtn() {
      return !this.showSelect && !this.isSelf && !this.isOptionalPersonal
    },
    showClearBtn() {
      return this.participant.list && this.participant.list.length
    },
    showSelect() {
      return Boolean(FORM_FIELDS_TYPES[this.participant.type])
    },
    showPositionLabelSelection() {
      return this.participant.type === PARTICIPANT_TYPES.POSITION_LABEL
    },
    isSelf() {
      return this.participant.type === PARTICIPANT_TYPES.INITIATOR
    },
    isDraggable() {
      return (
        this.participant.scope &&
        this.participant.scope === APPROVE_ORDER_TYPE.PRIORITY
      )
    },
    isAssignType() {
      return [
        OPTIONAL_SCOPE_KEYS.ASSIGN_POSITION,
        OPTIONAL_SCOPE_KEYS.ASSIGN_USER,
        OPTIONAL_SCOPE_KEYS.ASSIGN_POSITION_LABEL
      ].includes(this.participant.optionalScope)
    },
    pickerVisible: {
      get() {
        return !!this.pickerType
      },
      set(val) {
        if (!val) {
          /* if (this.isTransfer) {
          this.isTransfer = false
        } */

          if (this.pickerType) {
            this.pickerType = null
          }

          return false
        }
      }
    },
    isOptionalPersonal() {
      return this.participant.type === PARTICIPANT_TYPES.OPTIONAL_PERSONNEL
    }
  },
  watch: {
    'participant.type'() {
      this.participant.list = []
      if (this.participant.formFieldKey) {
        this.participant.formFieldKey = null
      }

      this.node.read('')
      if (this.isOptionalPersonal) {
        if (!Reflect.has(this.participant, 'optionalType')) {
          this.$set(this.participant, 'optionalType', 'single')
        }
        if (!Reflect.has(this.participant, 'optionalScope')) {
          this.$set(
            this.participant,
            'optionalScope',
            OPTIONAL_SCOPE_KEYS.TENANT_ORGANIZATION
          )
        }
      }
    },
    'participant.formFieldKey'(val) {
      if (val) {
        this.node.read(
          PARTICIPANT_TYPES_NAME[this.participant.type] +
          '：' +
          (this.fields.find((field) => field.fieldKey === val) || {})
            .fieldName || ''
        )
      } else {
        this.node.read('')
      }
    },
    'participant.list'(val) {
      if (this.participant.type === 'assign') {
        if (val['u_user']) {
          this.node.read(val['u_user'].map(x => x.userName).join())
        } else {
          this.node.read(undefined)
        }
      } else if (this.isSelf) {
        this.node.read(this.participantTypes[this.participant.type])
      } else if (this.showSelect) {
        const text =
          (
            (this.selectOptions || []).find(
              ({ value }) => value === this.participant.formFieldKey
            ) || {}
          ).label || ''

        this.node && this.node.read(text)
      } else {
        if (this.isOptionalPersonal && !this.isAssignType) {
          const scope =
            OPTIONAL_SCOPE_ENUM.find(
              (i) => i.value === this.participant.optionalScope
            ) || {}
          if (scope.label) {
            this.node.read(
              `${this.participantTypes[this.participant.type]}(${
                scope.label
              })`
            )
          }
        } else {
          val.length ? this.node.read({ list: val }) : this.node.read('')
        }
      }
    },
    'participant': {
      deep: true,
      handler() {
        if (this.node.read() && this.node.model.errorState) {
          this.node.model.errorState = false
        }

        this.handleUpdateProps('participant')
      }
    },
    'opinionSetting': {
      deep: true,
      handler(val) {
        if (!val.writeSignatureEnabled) {
          if (val.writeSignatureRequired) {
            val.writeSignatureRequired = false
          }

          if (val.writeSignatureCanUseLast) {
            val.writeSignatureCanUseLast = false
          }
        } else {
          // feat: (#1006031)【审批流】【流程设计】【节点设置】【手写签名】手写签名一旦勾选，一定为必填
          if (!val.writeSignatureRequired) {
            val.writeSignatureRequired = true
          }
        }

        if (!val.textOpinionEnabled && val.textOpinionRequired) {
          val.textOpinionRequired = false
        }

        this.handleUpdateProps('opinionSetting')
      }
    },
    taskRule() {
      this.handleUpdateProps('taskRule')
    },
    canTransfer() {
      this.handleUpdateProps('canTransfer')
    },
    canRollback() {
      if (!this.canRollback) {
        this.isDirectRollback = false
      }
      this.handleUpdateProps('canRollback')
    },
    participantEmptyRule(value) {
      this.node &&
      this.node.updateProps({
        participantEmptyRule: value
          ? NO_AUDIT_TYPES.AUTO_COMPLETE
          : NO_AUDIT_TYPES.CANNOT_SUBMIT
      })
    },
    initiatorAutoComplete() {
      this.handleUpdateProps('initiatorAutoComplete')
    },
    isDirectRollback: {
      immediate: true,
      handler(val) {
        if (this.node) {
          this.node.updateProps({
            rollbackSubmitType: !val
              ? ROLLBACK_ENUM.SEQUENCE
              : ROLLBACK_ENUM.BACK_TRACKED
          })
        }
      }
    },
    rollbackSubmitType: {
      immediate: true,
      handler(val) {
        this.isDirectRollback = val !== ROLLBACK_ENUM.SEQUENCE
      }
    }
  },
  created() {
    if (this.isOptionalPersonal) {
      if (
        this.participant.optionalScope === OPTIONAL_SCOPE_KEYS.ASSIGN_POSITION
      ) {
        checkDoesUserExist({
          list: this.participant.list,
          type: PARTICIPANT_TYPES.POSITION
        })
      }
    } else {
      checkDoesUserExist(this.participant)
    }
  },
  methods: {
    input(data) {

    },
    /**
     * @description 如果 node 节点的 props 中已存在该值，则取它的值，否则取 defaultSettings 的默认值
     * @param {string} key key name
     * @returns {any*}
     */
    getValue(key) {
      if (this.node && this.node.props) {
        const propValue = this.node.props[key]
        const isObject = typeof this.node.props[key] === 'object'

        return isObject
          ? deepCopy({
            // fixed: 并行分支子节点选择后未更新VIEW(#1017053)
            ...FLOW_NODE_TYPE_PROPS[this.node.type][key],
            ...this.node.props[key]
          })
          : propValue
      }
    },
    getSelectOptions() {
      if (this.showSelect) {
        const type = this.participant.type

        if (
          type === PARTICIPANT_TYPES.POSITION_OF_FORM ||
          type === PARTICIPANT_TYPES.ORGANIZATION_POSITION_OF_FORM
        ) {
          return fileds2options(this.formRoleFields) || []
        } else if (
          type === PARTICIPANT_TYPES.DEPARTMENT_OF_FORM ||
          type === PARTICIPANT_TYPES.DEPARTMENT_POSITION_OF_FORM
        ) {
          return fileds2options(this.formDepartmentFields) || []
        }
      }

      return []
    },
    /* 修改node信息 */
    handleChange(val) {
      this.node &&
      this.node.update({
        title: val
      })
    },
    /* update node props */
    handleUpdateProps(key) {
      this.node &&
      this.node.updateProps({
        [key]: this[key]
      })
    },
    handleAddPeople() {
      this.stationVisible = true
    },
    handleConfirmPicker(values) {
      if (this.isOptionalPersonal) {
        this.participant.list = values.map((i) => {
          if (
            this.participant.optionalScope === OPTIONAL_SCOPE_KEYS.ASSIGN_USER
          ) {
            return {
              name: i.name,
              value: i.sysNo,
              hasUser: true,
              model: {
                userName: i.name,
                userSysNo: i.sysNo,
                unitType: PARTICIPANT_TYPES.OPTIONAL_PERSONNEL
              }
            }
          }
          if (
            this.participant.optionalScope ===
            OPTIONAL_SCOPE_KEYS.ASSIGN_POSITION
          ) {
            return {
              name: i.name,
              value: i.sysNo,
              hasUser: undefined,
              model: {
                positionName: i.name,
                positionSysNo: i.sysNo,
                unitType: PARTICIPANT_TYPES.OPTIONAL_PERSONNEL
              }
            }
          }
        })
        if (
          this.participant.optionalScope ===
          OPTIONAL_SCOPE_KEYS.ASSIGN_POSITION
        ) {
          checkDoesUserExist({
            list: this.participant.list,
            type: PARTICIPANT_TYPES.POSITION
          })
        }
      } else {
        this.participant.list = values
        checkDoesUserExist(this.participant)
      }
    },
    handleCallBack(values) {
      console.log('handleCallBack')
      this.participant.list = values.map((i) => ({
        ...i,
        name: i.positionName,
        parentFullName: i.parentFullName,
        organizationType: i.organizationType,
        value: i.sysNo,
        hasUser: undefined,
        userName: i.userName,
        model: {
          positionLabelSysNo: i.sysNo,
          positionLabelName: i.positionName,
          parentFullName: i.parentFullName,
          organizationType: i.organizationType,
          unitType: PARTICIPANT_TYPES.POSITION_LABEL
        }
      }))
    },
    handleDeleteTag(list, tag) {
      list.splice(list.indexOf(tag), 1)
    },
    handleClearTags() {
      this.participant.list = []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/style/var';

.participant {
  &-item {
    display: inline-flex;
    align-items: center;
    margin-top: 10px;

    & + &,
    & + span {
      margin-left: 5px;
    }

    &.draggable {
      .el-tag {
        cursor: move;
      }
    }

    .el-icon-rank {
      cursor: move;
      color: $--color-icon-primary;
      font-size: 16px;
      margin-right: 5px;
    }
  }
}
</style>

<style lang="scss">
.wf-approver-ghost-item {
  .el-tag {
    opacity: 0.5;
    background: #c8ebfb;
  }
}
</style>

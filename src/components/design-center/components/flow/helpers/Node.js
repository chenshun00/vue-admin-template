import Vue from 'vue'
import NodeManager from './NodeManager'
import {
  createChildNode,
  isBranchChildNode,
  isBranchNode,
  removeOldNode
} from './NodeUtils'
import FlowNodeType from '../constants/FLOW_NODE_TYPE_ENUM'
import { LOGIC_SIGN_NAME } from '../../../constants/LOGICAL_SIGN'
import {
  CONDITION_CODE_TYPES,
  CONDITION_TYPES
} from '../../../constants/ENUM_DEFINITIONS'
import { deepCopy } from '../../../utils/index'

/**
 * Class to create a Node object.
 * @class Node
 */
export default class Node {
  static TYPE = FlowNodeType

  // static UUID_MAP = {}
  /* https://github.com/reduxjs/redux/blob/master/src/utils/actionTypes.js#L8 */

  /* https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
  static getUUID(prefix = 'uuid', type) {
    // if (process.env.NODE_ENV !== 'development') type = ''

    return `${prefix}${type ? '-' + type : ''}-xxxx-4xxx-yxxx`.replace(
      /[xy]/g,
      function(c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8

        return v.toString(16)
      }
    )
  }

  /**
   * @typedef NodeOptions
   * @property {string} type The type of the node.
   * @property {string} nodeId The nodeId of the node.
   * @property {string} prevId The prevId of the node.
   * @property {string} [alias] The alias of the node.
   * @property {'general'|'other_condition'} [conditionType]
   * @property {string} [oppositeTaskId] The end node ID of the branch node
   * @property {Node} [childNode]
   * @property {Node[]} [childrenNodes]
   * @property {{}} [model]
   * @property {{}} [props]
   *
   * @constructor
   * @param {NodeOptions} node constructor options
   */
  constructor({
    type = '',
    alias = '',
    nodeId = '',
    prevId = '',
    oppositeTaskId = '',
    childNode = null,
    childrenNodes = null,
    conditionType = null,
    model,
    ...props
  }) {
    this.type = type
    this.nodeId = nodeId || Node.getUUID('node', type)
    this.prevId = prevId

    if (oppositeTaskId) {
      this.oppositeTaskId = oppositeTaskId
    }

    /**
     * ?????? ???????????? ???????????? alias
     * @type {string} alias The alias of the node.
     */
    alias && (this.alias = alias)
    childNode && (this.childNode = childNode)
    childrenNodes && (this.childrenNodes = childrenNodes)
    conditionType && (this.conditionType = conditionType)
    model && (this.model = deepCopy(model))
    props && (this.props = deepCopy(props))

    /* ????????? NodeManager */
    NodeManager.addNode(this)
  }

  isBranchNode() {
    return isBranchNode(this.type)
  }

  isBranchChildNode() {
    return isBranchChildNode(this.alias || this.type)
  }

  /**
   * ???????????????????????? node ??????????????????????????? prevId, nextId ??????
   * @memberof Node
   * @param {Node| Node[] | null} node ???????????? childNode | childNodes ??????
   * // @param {boolean} deleteChildren ?????????????????????
   * @returns {Node}
   */
  next(node) {
    if (node && typeof node === 'object') {
      if (Array.isArray(node)) {
        node.forEach((t) => (t.prevId = this.nodeId))
        Vue.set(this, 'childrenNodes', node)

        this.childrenNodes = node
      } else {
        /**
         * https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
         * ???????????? JavaScript ????????????Vue ?????????????????????????????????????????????
         * ????????????????????????????????? childNode ????????? Vue Reactive ???????????????????????????
         */
        node.prevId = this.nodeId
        Vue.set(this, 'childNode', node)

        this.childNode = node
      }
    } else {
      Vue.set(this, 'childrenNodes', null)
      Vue.set(this, 'childNode', null)

      delete this.childNode
    }

    NodeManager.updateNode(this)
    NodeManager.updateNode(node)

    return this
  }

  /* GET */
  /**
   * ??????/?????????????????? => node.model.content
   * @param {Array|Object<string, any>} val
   * @returns {string}
   */
  read(val) {
    if (val === undefined) {
      return this.model.content || ''
    } else {
      if (typeof val === 'string') {
        this.update({
          content: val
        })
      } else {
        if (
          // fixed:???????????????????????????????????????VIEW(#1017053)
          this.alias === Node.TYPE.APPROVER_NODE ||
          this.type === Node.TYPE.APPROVER_NODE ||
          this.type === Node.TYPE.NOTIFIER_NODE
        ) {
          const { list } = val

          this.update({
            content:
              list && list.length
                ? (list || [])
                  .map(
                    (item) =>
                      `${item.name}${
                        item.parentFullName
                          ? '(' + item.parentFullName + ')'
                          : ''
                      }`
                  )
                  .join('???')
                : ''
          })
        } else if (this.type === Node.TYPE.CONDITION_NODE) {
          const { conditions, fields } = val
          const fieldNames = {}
          const fieldTypes = {}
          const fieldOptions = {}

          fields.forEach(
            ({ fieldKey, fieldName, fieldType, fieldOptions: options }) => {
              fieldNames[fieldKey] = fieldName
              fieldTypes[fieldKey] = fieldType

              if (
                options &&
                options.length &&
                (fieldType === CONDITION_TYPES.COMBO || fieldType === CONDITION_TYPES.RADIO)
              ) {
                fieldOptions[fieldKey] = options
              }
            }
          )

          const content = conditions
            .filter((condition) => condition && condition.fieldKey)
            .map(
              ({
                fieldKey,
                conditionCode,
                conditionType,
                value,
                unionLogic,
                leftBracket,
                rightBracket
              }) => {
                if (!fieldKey || !conditionType || !value) return ''

                if (fieldOptions[fieldKey]) {
                  const options = fieldOptions[fieldKey]
                  const str =
                    (options.find((item) => Array.isArray(value) ? value.includes(item.value) : value === item.value) || {})
                      .label || ''

                  if (str) {
                    value = str
                  }
                }

                return [
                  leftBracket && '???',
                  unionLogic && LOGIC_SIGN_NAME[unionLogic],
                  fieldNames[fieldKey],
                  CONDITION_CODE_TYPES[conditionCode][conditionType] || '',
                  Array.isArray(value)
                    ? value.every((val) => typeof val === 'string')
                      ? value.join('???')
                      : value.map(({ name }) => name).join('???')
                    : value,
                  rightBracket && '???'
                ]
                  .filter(Boolean)
                  .join('')
              }
            )
            .filter((str) => str && str.trim())
            .join('???')

          this.update({
            content
          })
        }
      }
    }
  }

  /**
   * ???????????????
   * @memberof Node
   * @param {string|{type: string, [props: string]: any}} opts
   */

  /* create */
  add(opts) {
    return createChildNode(this, opts)
  }

  /**
   * ?????????????????????????????? x
   * @memberof Node
   */

  /* delete */
  remove() {
    return removeOldNode(this)
  }

  move(i1, i2) {
    if (this.isBranchChildNode()) {
      const prevNode = this.prevId && NodeManager.getNode(this.prevId)

      if (prevNode) {
        const arr = prevNode.childrenNodes

        if (arr && arr.length && ~i1 && ~i2) {
          let temp1 = arr[i1]
          let temp2 = arr[i2]

          /*
           * https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
           * ??????JS???????????? Vue ????????????????????????????????????
           * 1??????????????????????????????????????????????????? vm.items[indexOfItem] = newValue
           * 2??????????????????????????????????????? vm.items.length = newLength
           */
          Vue.set(arr, i1, temp2)
          Vue.set(arr, i2, temp1)
          // arr[i1] = temp2
          // arr[i2] = temp1
        }
      }
    }
  }

  /**
   * ???????????????
   * @memberof Node
   * @param {string|NodeConfig}
   */
  getRootNode(node) {
    while (node.prevId) {
      node = NodeManager.getNode(node.prevId)
    }

    if (!node.prevId) {
      return node
    }
  }

  update() {
    return this.updateModel.apply(this, arguments)
  }

  updateModel(opts = {}) {
    this.model = {
      ...this.model,
      ...opts
    }
  }

  updateProps(opts = {}) {
    this.props = {
      ...this.props,
      ...opts
    }
  }
}

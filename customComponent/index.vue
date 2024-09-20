<template>
  <div class="custom-container">
    <div class="custom-toolbox">
      <div class="ide-left-tree-warp">
        <el-tree class="ide-left-tree" ref="toolboxTree" :data="node" node-key="Name" :render-content="onRenderContent"
          @node-drag-start="onDragStart" @node-drag-end="onDragEndItem" draggable :allow-drop="allowDrop"
          :allow-drag="allowDrag" :props="treeOption">
        </el-tree>
      </div>
    </div>
    <div class="custom-designer">
      <!-- 设计区域 -->
      <div class="editorPanel">
        <grid-layout 
        ref="gridLayout" 
        class="editorCanvas" 
        :layout.sync="layout" 
        :col-num="layoutOption.colNum"
        :row-height="layoutOption.rowHeight"
        :is-draggable="true" 
        :is-resizable="true"
        @dragover.native="onDragOverGrid">
          <grid-item
          class="widgetPanel" 
          v-for="item in layout" 
          :x="item.x" 
          :y="item.y" 
          :w="item.w" 
          :h="item.h"
          :i="item.i" 
          :key="item.i" 
          @resize="onItemResize(item)" 
          @container-resized="onItemResize(item)">
            <div v-if="!preview" class="widgetOverlay" @click="onSelectWidget(item)"></div>
            <component :ref="item.i" :is="item.c" :style="makeWidgetStyle(item)" v-model="runState[item.m]"
              v-bind="item.p" v-on="item.a">
              {{ item.t }}
            </component>
          </grid-item>
        </grid-layout>
      </div>

    </div>
     <!-- 右边属性区域 -->
     <vue-property-panel slot="panel2" :owner="selectedWidget" :state="state"></vue-property-panel>
  </div>
</template>

<script lang="jsx">

import Vue from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout'
import VueToolbox from './VueToolbox';
import { RuntimeVueState } from './IVueVisual';
import DesignStore from './DesignStore.js'
import VuePropertyPanel from './VuePropertyPanel'

export default {
  components: {
    GridLayout,
    GridItem,
    VuePropertyPanel
  },
  data() {
    return {
      node: [
        {
          Icon: "el-icon-edit",
          Name: 'Input',
          Component: 'ElInput',
          Width: 5,
          Height: 1,
          Props: [
            {
              Name: 'size',
              Type: 'Select',
              Default: 'small',
              Editor: 'Select',
              EditorOptions: [
                { label: 'medium', value: 'medium' },
                { label: 'small', value: 'small' },
                { label: 'mini', value: 'mini' },
              ]
            },
            {
              Name: 'placeholder',
              Type: 'Text',
              Default: '',
            }
          ]
        },
        {Icon: "el-icon-edit", Name: 'Button', Component: 'ElButton', Text: "按钮", Width: 5, Height:1,
        Props: [
            {
              Name: 'size',
              Type: 'Select',
              Default: 'small',
              Editor: 'Select',
              EditorOptions: [
                { label: 'medium', value: 'medium' },
                { label: 'small', value: 'small' },
                { label: 'mini', value: 'mini' },
              ]
            },
            {
              Name: 'type',
              Type: 'Select',
              Default: 'primary',
              Editor: 'Select',
              EditorOptions: [
                { label: 'primary', value: 'primary' },
                { label: 'success', value: 'success' },
                { label: 'warning', value: 'warning' },
                { label: 'danger', value: 'danger' },
                { label: 'info', value: 'info' },
                { label: 'text', value: 'text' },
              ]
            },
            {
              Name: 'icon',
              Type: 'icon',
              Default: '',
              Editor: 'Icon',
            }
          ]}
      ], //ControlToolBox,
      treeHeight: 0,
      treeOption: {
        label: 'Name',
        children: 'Item'
      },
      onRenderContent: (h, node) => {
        // console.log('jabsfhsajsf', node)
        return (<span class="el-tree-node__label">
          <i class={node.data.Icon + ' fa-fw'}></i> {node.data.Name}</span>)
      },
      // 设计器数据
      readOnly: true, // 是否只读模式，对应模型的签出状态
      preview: false, // 是否预览模式
      route: {
        Enable: false, // 是否启用路由
        Parent: '',    // 自定义路由的上级
        Path: '',      // 自定义路由的路径
        DlgVisible: false
      },
      selectedWidget: null, //当前选择的Widget

      state: [],             //设计时状态
      layout: [],          //设计时布局
      layoutOption: {
        colNum: 24,
        rowHeight: 32
      },
      runState: new RuntimeVueState(), //运行时状态

      draggingItem: null,
      dragPreX: -99999,
      dragPreY: -99999,
    }
  },
  
  methods: {
    allowDrag(draggingNode) {
      return true
    },
    filterNode(value, data) {
      if (!value) return true
      return data.Name.indexOf(value) !== -1
    },
    allowDrop() {
      return false; /*always false*/
    },

    onDragStart(node, e) {
      console.log('grag start', node)
      this.$refs.toolboxTree.setCurrentKey(node.data.Name);
    },
    onDragEndItem(snode, dnode, place, e) {
      console.log('grag end', e)
      this.onDragEnd(e)
    },

    /** 获取当前选择 */
    getSelected() {
      return this.$refs.toolboxTree.getCurrentNode()
    },
    /** 清除选择 */
    clearSelected() {
      this.$refs.toolboxTree.setCurrentKey(null)
    },



    // ----- start ---------

    /** 生成新的标识号 */
    makeWidgetId() {
      let id = 0;
      do {
        if (this.layout.find(t => t.i == id.toString())) {
          id++;
        } else {
          break;
        }
      } while (true);
      return id.toString();
    },
    /** 仅用于设计时绑定设计及默认样式 */
    makeWidgetStyle(item) {
      let s = item.Widget && item.Widget.Style ? item.Widget.Style : {};
      s['zIndex'] = this.preview ? 'auto' : -1;
      return s;
    },

    makeWidget(name) {
      //先判断是否全局注册的组件
      let isGlobal = name.indexOf('.') < 0; //TODO:暂简单判断
      if (isGlobal) {
        return Vue.component(name);
      }
      // else {
      //     return LoadView(name, this.$root);
      // }
    },
    createLayoutItem(toolboxItem, byDrag) {
      let id = this.makeWidgetId();
      let item = {
        n: toolboxItem.Name,
        i: id,
        x: (this.layout.length * 2) % 24, //(this.colNum || 12),
        y: this.layout.length + 24, //(this.colNum || 12), // puts it at the bottom
        w: toolboxItem.Width,
        h: toolboxItem.Height,
        p: VueToolbox.MakeDefaultProps(toolboxItem),
        Widget: toolboxItem
      };
      if (toolboxItem.Text) {
        item.t = toolboxItem.Text;
      }
      if (toolboxItem.Model) {
        item.m = '';
      }
      if (!byDrag) {
        item.c = this.makeWidget(toolboxItem.Component);
      }
      return item;
    },
    /** 用于某些基于Canvas的组件需要更新大小 */
    onItemResize(item) {
      const ref = this.$refs[item.i];
      console.log('anjksnfjasfa', ref, item)
      if (ref) {
        const c = ref[0];
        if (c && c.updateSize) {
          c.updateSize();
        }
      }
    },

    onSelectWidget(item) {
      this.selectedWidget = item;
    },
    onUpdateLayoutItem(newItem) {
      this.selectedWidget = newItem
      let index = this.layout.findIndex(item => item.i === newItem.i)
      if(index !== -1){
        this.layout.splice(index, 1, newItem)
      }
    },
    /** 工具箱拖动Widget至GridLayout之上 */
    onDragOverGrid(e) {
      console.log('drop end')
      e.preventDefault(); //TODO:判断是否允许

      const grid = this.$refs.gridLayout;
      if (!grid) {
        console.log('Can\'t find gridLayout component');
        return;
      }

      if (!this.draggingItem) {
        let toolboxItem = this.getSelected();
        this.draggingItem = this.createLayoutItem(toolboxItem, true);
        this.layout.push(this.draggingItem);
      }

      //注意:GridLayout.$children下有个placeholder
      if (grid.$children.length === this.layout.length) {
        return; //尚未挂载新建的
      }

      const parentRect = grid.$el.getBoundingClientRect();
      const offsetX = e.clientX - parentRect.left;
      const offsetY = e.clientY - parentRect.top;
      const dx = Math.abs(offsetX - this.dragPreX);
      const dy = Math.abs(offsetY - this.dragPreY);

      if (dx > 5 || dy > 5) { //TODO:根据布局参数计算最小diff
        let el = grid.$children[this.layout.length]; //注意placeholder
        el.dragging = { top: offsetY, left: offsetX };

        let newPos = el.calcXY(offsetY, offsetX);
        if (this.draggingItem.x != newPos.x || this.draggingItem.y != newPos.y) {
          grid.dragEvent('dragstart', this.draggingItem.i,
            newPos.x, newPos.y, this.draggingItem.h, this.draggingItem.w);
        }

        this.dragPreX = offsetX;
        this.dragPreY = offsetY;
      }
    },

    onDragEnd(e) {
      console.log('drag endend', {e, draggingItem: this.draggingItem})
      if (!this.draggingItem) {
        return;
      }

      const grid = this.$refs.gridLayout;
      console.log('abjfabsfasf', grid)
      if (grid) {
        let parentRect = grid.$el.getBoundingClientRect();
        const offsetX = e.clientX - parentRect.left;
        const offsetY = e.clientY - parentRect.top;
        let el = grid.$children[this.layout.length];
        let newPos = el.calcXY(offsetY, offsetX);
        grid.dragEvent('dragend', this.draggingItem.i, newPos.x, newPos.y,
          this.draggingItem.h, this.draggingItem.w);

        this.draggingItem.c = this.makeWidget(this.draggingItem.Widget.Component);
        console.log('拖拽》》》》》》》》123', this.draggingItem)
        // debugger
        // this.layout.push(this.draggingItem)
        this.selectedWidget = this.draggingItem;
      }

      this.draggingItem = null;
      this.dragPreX = this.dragPreY = -99999;
    }
    // ------ end -----------
  },
  mounted() {
    DesignStore.onEvent('updateOwner', this.onUpdateLayoutItem)
  },
  destroyed(){
    DesignStore.offEvent('updateOwner', this.onUpdateLayoutItem)
  }
}
</script>
<style scoped lang="scss">
.custom-container {
  width: 100%;
  height: 100%;
  display: flex;

  .custom-toolbox {
    height: 100%;
    width: 270px;
    background-color: #f3f3f3;
  }

  .custom-designer {
    height: 100%;
    width: calc(100% - 494px);
    background-color: #fff;
    -webkit-box-shadow: 0 0 10px #000000;
    box-shadow: 0 0 10px #000000;

    .editorPanel {
      background-color: #a2a2a2;
      height: calc(100% - 40px);
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      padding: 10px;
      overflow: auto;
    }

    .vue-grid-item>button,
    .vue-grid-item>div,
    .vue-grid-item>div>.el-input__inner {
      width: 100% !important;
      height: 100% !important;
      padding: 0;
      margin: 0;
      line-height: 100% !important;
    }
    ::v-deep .vue-grid-item{
      .el-input__inner {
      width: 100% !important;
      height: 100% !important;
      padding: 0;
      margin: 0;
      line-height: 100% !important;
     }
      .vue-resizable-handle{
        z-index: 9999 !important;
      }
    }
    .editorCanvas {
      background-color: #fff;
      box-shadow: 0 0 10px #000000;
    }

    .widgetPanel {
      touch-action: none;
      box-sizing: border-box;
      // .vue-resizable-handle {
      //   z-index: 9999 !important;
      // }
    }

    // .widgetPanel>>>.vue-resizable-handle {
    //   z-index: 9999;
    // }

    .widgetOverlay {
      position: absolute;
      top: 0;
      left: 0;
      filter: alpha(opacity=60);
      background-color: #777;
      opacity: 0.1;
      -moz-opacity: 0.1;
      width: 100%;
      height: 100%;
      z-index: 9998;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }

  }

}
</style>
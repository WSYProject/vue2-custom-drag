<template>
  <div class="ide-property-panel">
    <el-collapse class="ide-property-collapse" :value="expands">
      <!--State-->
      <!-- <el-collapse-item key="State" title="State" name="State">
              <el-button-group>
                  <el-button @click="onAddState" size="mini" type="plain" icon="fa fa-plus"></el-button>
                  <el-button size="mini" type="plain" icon="fa fa-minus"></el-button>
              </el-button-group>
              <c-grid :data="state" :theme="gridTheme" :default-row-height="28"
                      style="height:180px;border: solid silver 1px;background-color: white">
                  <c-grid-input-column field="Name" caption="Name" :width="80"></c-grid-input-column>
                  <c-grid-input-column field="Type" caption="Type" :width="100"></c-grid-input-column>
                  <c-grid-button-column field="Value" caption="..." @click="onSetState" width="auto">Value
                  </c-grid-button-column>
              </c-grid>
          </el-collapse-item> -->
      <!--Widget-->
      <el-collapse-item v-if="owner" key="Widget" title="Widget" name="Widget">
        <el-form label-position="right" size="mini" :label-width="labelWidth">
          <el-form-item key="name" label="Name:">
            <el-input :value="name" disabled></el-input>
          </el-form-item>
          <el-form-item key="id" label="Id:">
            <el-input :value="id" disabled></el-input>
          </el-form-item>
          <el-form-item v-if="this.owner && this.owner.Widget.hasOwnProperty('Text')" key="text" label="Text:">
            <el-input :value="text" @input="handleTest($event)"></el-input>
          </el-form-item>
          <el-form-item v-if="this.owner && this.owner.Widget.hasOwnProperty('model')">
            <el-input :value="model" @change="handleModel($event)"></el-input> <!--TODO:专用编辑器-->
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <!--Props-->
      <el-collapse-item v-if="owner && props" key="Props" title="Props" name="Props">
        <el-form label-position="right" size="mini" :label-width="labelWidth">
          <el-form-item v-for="item in props" :key="item.Name" :label="item.Name + ':'">
            <component :is="getPropEditor(item)" :value="getPropValue(item.Name)" :options="item.EditorOptions"
              @change="setPropValue(item, $event)"></component>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <!--Events-->
      <!-- <el-collapse-item v-if="owner && events" key="Events" title="Events" name="Events">
        <el-form label-position="right" size="mini" :label-width="labelWidth">
          <el-form-item v-for="item in events" :key="item.Name" :label="item.Name + ':'">
            <event-editor :value="getEventAction(item.Name)" @change="setEventAction(item.Name, $event)"></event-editor>
          </el-form-item>
        </el-form>
      </el-collapse-item> -->
    </el-collapse>

    <!--设置状态值对话框-->
    <!-- <event-action-dialog :visible.sync="stateDlgVisible" :state="currentState"
      @change="onStateValueChanged"></event-action-dialog> -->
  </div>
</template>

<script>
import VueToolbox from './VueToolbox';
// import EventEditor from './EventEditor.vue';
// import EventActionDialog from '@/components/Designers/View/PropertyEditors/EventActionDialog.vue';
import DesignStore from './DesignStore'

export default {
  components: {
    // EventActionDialog,
    // EventEditor
  },
  props: {
    state: {
      type: Array,
      default: []
    },
    owner: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      gridTheme: {
        frozenRowsBgColor: '#f3f3f3',
        borderColor: 'silver',
        highlightBorderColor: '#409EFF',
        underlayBackgroundColor: 'white',
        font: '12px sans-serif',
      },

      labelWidth: '100px',
      // expands: ['State', 'Widget', 'Props', 'Events'], // 展开所有分类
      expands: ['Widget'],

      /** 当前选择的State */
      currentState: null,
      stateDlgVisible: false,
    }
  },
  computed: {
    name() {
      return this.owner ? this.owner.n : '';
    },
    id(){
      return this.owner ? this.owner.i : '';
    },
    text() {
      return this.owner ? this.owner.t : '';
    },
    model() {
      return this.owner ? this.owner.m : '';
    },
    props() {
      return this.owner ? this.owner.Widget.Props : [];
    },

    events() {
      return this.owner ? this.owner.Widget.Events : null;
    },

  },
  methods: {

    // text(value) {
    //   if (this.owner) {
    //     this.owner.t = value;
    //   }
    // },
    handleTest(e){
      // e.preventDefault()
      let newOwner = {...this.owner, Widget: {...this.owner.Widget, Text: e || ''}, t: e || ''}
      // console.log('njkansfa>>>>>', newOwner)
      DesignStore.emitEvent('updateOwner', newOwner)
    },

    // model(value) {
    //   if (this.owner) {
    //     this.owner.m = value;
    //   }
    // },
    handleModel(e){},


    getPropValue(name) {
      console.log('anjankkjsfa', this.owner)
      if (!this.owner) {
        return null;
      }

      if (this.owner.b && this.owner.b.hasOwnProperty(name)) {
        return this.owner.b[name];
      }
      if (this.owner.p && this.owner.p.hasOwnProperty(name)) {
        return this.owner.p[name];
      }

      return null;
    },

    setPropValue(prop, newValue) {
      console.log('ankjsfnasfa',prop, newValue)
      if (!newValue) {
        this.$delete(this.owner.p, prop.Name);
        if (this.owner.b && this.owner.b[prop.Name]) {
          this.$delete(this.owner.b, prop.Name);
        }
        return;
      }

      if (typeof newValue === 'string' && newValue.startsWith(':')) {
        if (!this.owner.b) {
          this.owner.b = {};
        }
        this.$set(this.owner.b, prop.Name, newValue);
        //不用在这里同步绑定,预览时处理
      } else {
        //TODO:判断等于默认值删除属性
        if (this.owner.b && this.owner.b[prop.Name]) {
          this.$delete(this.owner.b, prop.Name);
        }
        this.$set(this.owner.p, prop.Name, newValue);
        console.log('ankjfnjakfsa', this.owner)
      }
    },

    getPropEditor(prop) {
      if (!prop.e) {
        console.log('设置属性编辑器: ' + prop.Editor);
        prop.e = VueToolbox.GetPropEditor(prop, this.$root);
      }
      return prop.e;
    },

    getEventAction(name) {
      if (!this.owner || !this.owner.e || !this.owner.e[name]) {
        return undefined;
      }
      return this.owner.e[name];
    },

    setEventAction(name, newValue) {
      if (!this.owner.e) {
        this.$set(this.owner, 'e', {});
      }
      this.$set(this.owner.e, name, newValue);
    },

    // onAddState() {
    //   this.state.push({ Name: 'name', Type: 'string', Value: null });
    // },

    // onSetState(val) {
    //   this.currentState = val;
    //   this.stateDlgVisible = true;
    // },

    // onStateValueChanged(val) {
    //   this.currentState.Value = val;
    // }
  }
}
</script>

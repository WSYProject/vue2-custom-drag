import SelectEditor from "./PropertyEditors/SelectEditor.vue";
import TextEditor from "./PropertyEditors/TextEditor.vue";
import IconEditor from "./PropertyEditors/IconEditor.vue";
import CheckEditor from './PropertyEditors/CheckEditor.vue';

export default class VueToolbox {
  static hasBindChangeEvent = false;
  static widgets = [];

  static MakeDefaultProps(component) {
    if (!component.Props) {
      return null;
    }
    let props = {};
    for (let prop of component.Props) {
      if (prop.hasOwnProperty("Default")) {
        props[prop.Name] = prop.Default;
      }
    }
    return props;
  }

  static GetWidget(name) {
    return VueToolbox.widgets.find((c) => c.Name == name);
  }
  static GetPropEditor(prop, root) {
    //TODO: finish it
    let isGlobal = !prop.Editor || prop.Editor.indexOf(".") < 0; //TODO:暂简单判断
    if (isGlobal) {
      if (prop.Editor == "Select") {
        return SelectEditor;
      } else if (prop.Editor == "Icon") {
        return IconEditor;
      } else if(prop.Editor == "Check"){
        return CheckEditor
      } else {
        return TextEditor;
      }
    } else {
      console.log("加载自定义属性编辑器");
      // return LoadView(prop.Editor, root);
    }
  }
}

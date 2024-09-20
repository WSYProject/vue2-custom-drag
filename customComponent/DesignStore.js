import Vue from 'vue';

// type EventId = 'NodeCheckout' | 'CurrentNodeChanged' | 'SettingsChanged' | 'DesignerChanged' | 'Publish'

// export interface IToolbox {
//     getSelected(): any;

//     clearSelected(): void;
// }

/** 用于设计时全局状态与事件管理 */
export default class DesignStore { //TODO: rename to DesignContext?
    static eventBus = new Vue();

    static router = null;                 // 指向路由，仅方便使用
    static ide = null;                    // 指向AppStudio实例
    static tree = null;                   // 指向DesignTreeView实例
    static designers = null;              // 指向DesignerPads实例
    static toolbox = null;    // 指向ToolBoxTree实例
    static errors = null;                 // 指向ErrorsView实例
    static usages = null;                 // 指向UsagesView实例
    static visualDesigner = null;                 // 指向VueVisualDesigner实例

    static emitEvent(eventId, arg1, arg2, arg3) {
        DesignStore.eventBus.$emit(eventId, arg1, arg2, arg3);
    }

    static onEvent(eventId, callback) {
        DesignStore.eventBus.$on(eventId, callback);
    }

    static offEvent(eventId, callback) {
        DesignStore.eventBus.$off(eventId, callback);
    }
}

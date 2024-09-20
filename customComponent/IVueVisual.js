/** 运行时的视图状态 */
export class RuntimeVueState {
  // [index: string]: any;
  /** 处理好的设置状态值的行为 eg: {data: function(){...}} */
  _valueActions = null;

  get ValueActions() {
      if (!this._valueActions) {
          this._valueActions = {};
      }
      return this._valueActions;
  }

  /** 刷新运行时状态 */
  Refresh() {
      if (this._valueActions) {
          for (const prop in this._valueActions) {
              if (!this._valueActions.hasOwnProperty(prop)) {
                  continue;
              }
              this._valueActions[prop]();
          }
      }
  }
}
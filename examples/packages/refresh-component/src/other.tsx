//@ts-nocheck

export interface PropTypes {
  /**
   * @description        Control half page show and hide
   * @description.zh-CN  控制半页显示隐藏
   * @default            false
   */
  visible: boolean;
  /**
   * @description        The half-page pop-up window is implemented by the modal component of react native, and the props passed in this property will be transparently transmitted to the modal component of react native
   * @description.zh-CN  半页弹窗由 react native 的 modal 组件实现，该属性传入的 props 会透传给 react native 的 modal 组件
   */
  modalProps?: ModalProps;
  /**
   * @description        The callback function of the click mask layer
   * @description.zh-CN  点击遮罩层的回调函数
   */
  onBackdropPress?: () => void;
  /**
   * @description        the color of the mask layer
   * @description.zh-CN  遮罩层的颜色
   */
  backDropColor?: string;
}

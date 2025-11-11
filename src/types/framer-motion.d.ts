import 'framer-motion';

declare module 'framer-motion' {
  // 扩展ValueAnimationTransition接口，这是transition属性的实际类型
  interface ValueAnimationTransition {
    ease?: Easing | Easing[] | string | undefined;
    type?: string | AnimationGeneratorType;
  }
  
  // 同时扩展Transition接口以确保全面覆盖
  interface Transition {
    ease?: Easing | Easing[] | string | undefined;
    type?: string | AnimationGeneratorType;
  }
}
import {
  Component,
  JSXComponent,
  RefObject,
  Ref,
  Mutable,
  Method,
  Effect,
  InternalState,
} from '@devextreme-generator/declarations';

import { DisposeEffectReturn } from '../../../utils/effect_return';
import { BaseWidgetProps } from '../../common/base_props';

import { Scrollbar } from './scrollbar';
import { requestAnimationFrame, cancelAnimationFrame } from '../../../../animation/frame';
import { ScrollableSimulatedProps } from '../common/simulated_strategy_props';
import { inRange } from '../../../../core/utils/math';
import { DxMouseEvent } from '../common/types';
import { clampIntoRange } from '../utils/clamp_into_range';
import { AnimatedScrollbarProps } from '../common/animated_scrollbar_props';
import { isDxMouseWheelEvent } from '../../../../events/utils/index';

export const OUT_BOUNDS_ACCELERATION = 0.5;

export const ACCELERATION = 0.92;
export const MIN_VELOCITY_LIMIT = 1;
export const BOUNCE_MIN_VELOCITY_LIMIT = MIN_VELOCITY_LIMIT / 5;

const FRAME_DURATION = 17; // Math.round(1000 / 60)
const BOUNCE_DURATION = 400;
const BOUNCE_FRAMES = BOUNCE_DURATION / FRAME_DURATION;
export const BOUNCE_ACCELERATION_SUM = (1 - ACCELERATION ** BOUNCE_FRAMES) / (1 - ACCELERATION);

export const viewFunction = (viewModel: AnimatedScrollbar): JSX.Element => {
  const {
    scrollbarRef, newScrollLocation,
    props: {
      direction,
      contentSize, containerSize,
      showScrollbar, scrollByThumb, bounceEnabled, scrollLocationChange,
      visible, rtlEnabled,
      minOffset, maxOffset,
      containerHasSizes,
    },
  } = viewModel;

  return (
    <Scrollbar
      ref={scrollbarRef}
      direction={direction}
      contentSize={contentSize}
      containerSize={containerSize}
      visible={visible}
      minOffset={minOffset}
      maxOffset={maxOffset}
      scrollLocation={newScrollLocation}
      scrollLocationChange={scrollLocationChange}
      scrollByThumb={scrollByThumb}
      bounceEnabled={bounceEnabled}
      showScrollbar={showScrollbar}
      containerHasSizes={containerHasSizes}
      // Horizontal
      rtlEnabled={rtlEnabled}
    />
  );
};

type AnimatedScrollbarPropsType = AnimatedScrollbarProps
// eslint-disable-next-line @typescript-eslint/no-type-alias
& Pick<BaseWidgetProps, 'rtlEnabled'>
// eslint-disable-next-line @typescript-eslint/no-type-alias
& Pick<ScrollableSimulatedProps, 'pullDownEnabled' | 'reachBottomEnabled' | 'forceGeneratePockets'
| 'inertiaEnabled' | 'showScrollbar' | 'scrollByThumb' | 'bounceEnabled' | 'scrollLocationChange'>;

@Component({
  defaultOptionRules: null,
  view: viewFunction,
})

export class AnimatedScrollbar extends JSXComponent<AnimatedScrollbarPropsType>() {
  @Ref() scrollbarRef!: RefObject<Scrollbar>;

  @InternalState() canceled = false;

  @InternalState() newScrollLocation = 0;

  @InternalState() forceAnimationToBottomBound = false;

  @InternalState() pendingRefreshing = false;

  @InternalState() pendingLoading = false;

  @InternalState() pendingBounceAnimator = false;

  @InternalState() pendingInertiaAnimator = false;

  @InternalState() needRiseEnd = false;

  @InternalState() wasRelease = false;

  @Mutable() thumbScrolling = false;

  @Mutable() crossThumbScrolling = false;

  @Mutable() stepAnimationFrame = 0;

  @Mutable() velocity = 0;

  @Mutable() refreshing = false;

  @Mutable() loading = false;

  @Method()
  isThumb(element: EventTarget | null): boolean {
    return this.scrollbarRef.current!.isThumb(element);
  }

  @Method()
  isScrollbar(element: EventTarget | null): boolean {
    return this.scrollbarRef.current!.isScrollbar(element);
  }

  @Method()
  reachedMin(): boolean {
    return this.props.scrollLocation <= this.maxOffset;
  }

  @Method()
  reachedMax(): boolean {
    return this.props.scrollLocation >= this.props.minOffset;
  }

  @Method()
  initHandler(
    event: DxMouseEvent,
    crossThumbScrolling: boolean,
    offset: number,
  ): void {
    this.cancel();

    this.refreshing = false;
    this.loading = false;

    if (!isDxMouseWheelEvent(event.originalEvent)) {
      const { target } = event.originalEvent;
      const scrollbarClicked = this.props.scrollByThumb && this.isScrollbar(target);

      this.calcThumbScrolling(event, crossThumbScrolling, scrollbarClicked);

      if (scrollbarClicked) {
        this.moveToMouseLocation(event, offset);
      }

      if (this.thumbScrolling) {
        this.setActiveState();
      }
    }
  }

  @Method()
  moveHandler(delta: number, isDxMouseWheel: boolean): void {
    if (this.crossThumbScrolling) {
      return;
    }

    let resultDelta = delta;

    if (this.thumbScrolling) {
      resultDelta = -Math.round(delta / (this.props.containerSize / this.props.contentSize));
    }

    const isOutBounds = !inRange(this.props.scrollLocation, this.maxOffset, this.props.minOffset);
    if (isOutBounds) {
      resultDelta *= OUT_BOUNDS_ACCELERATION;
    }

    const scrollValue = this.props.scrollLocation + resultDelta;

    this.moveTo(this.props.bounceEnabled && !isDxMouseWheel
      ? scrollValue
      : clampIntoRange(scrollValue, this.props.minOffset, this.maxOffset));
  }

  @Method()
  endHandler(receivedVelocity: number, needRiseEnd: boolean): void {
    this.velocity = this.props.inertiaEnabled && !this.thumbScrolling ? receivedVelocity : 0;

    this.needRiseEnd = needRiseEnd;
    this.resetThumbScrolling();
  }

  @Method()
  stopHandler(): void {
    if (this.thumbScrolling) {
      this.needRiseEnd = true;
    }

    this.resetThumbScrolling();
  }

  @Method()
  scrollTo(value: number): void {
    this.loading = false;
    this.refreshing = false;

    this.moveTo(-clampIntoRange(value, -this.maxOffset, 0));
    // uses for jest tests only
    // I wanna use this statement ->
    // this.newScrollLocation = -clampIntoRange(value, -this.maxOffset, 0);

    this.needRiseEnd = true;
  }

  @Method()
  releaseHandler(): void {
    if (this.props.forceGeneratePockets && this.props.reachBottomEnabled
      && inRange(this.props.scrollLocation, this.maxOffset, this.props.maxOffset)) {
      this.forceAnimationToBottomBound = true;
    }

    this.wasRelease = true;
    this.needRiseEnd = true;

    this.resetThumbScrolling();
    this.pendingRefreshing = false;
    this.pendingLoading = false;
  }

  @Effect({ run: 'once' })
  disposeAnimationFrame(): DisposeEffectReturn {
    return (): void => { this.cancel(); };
  }

  @Effect()
  risePullDown(): void {
    if (
      this.props.forceGeneratePockets
      && this.isReadyToStart
      && this.inRange
      && this.props.pulledDown
      && !this.refreshing
    ) {
      this.refreshing = true;
      this.pendingRefreshing = true;

      this.props.onPullDown?.();
    }
  }

  @Effect()
  riseEnd(): void {
    const isInsideBounds = inRange(this.props.scrollLocation, this.props.maxOffset, 0);
    if (
      isInsideBounds
      && this.isReadyToStart
      && this.finished
      && !this.pendingRelease
    ) {
      this.needRiseEnd = false;
      this.wasRelease = false;

      this.forceAnimationToBottomBound = false;
      this.props.onEnd?.(this.props.direction);
    }
  }

  @Effect()
  riseReachBottom(): void {
    if (
      this.props.forceGeneratePockets
      && this.isReadyToStart
      && this.inRange
      && this.isReachBottom
      && !this.loading
      && this.finished
    ) {
      this.loading = true;
      this.pendingLoading = true;

      this.props.onReachBottom?.();
    }
  }

  @Effect()
  startAnimator(): void {
    if (this.isReadyToStart) {
      this.canceled = false;

      if (!this.inRange && this.props.bounceEnabled) {
        const distanceToBound = clampIntoRange(
          this.props.scrollLocation, this.props.minOffset, this.maxOffset,
        ) - this.props.scrollLocation;

        this.velocity = distanceToBound / BOUNCE_ACCELERATION_SUM;
        this.props.onBounce?.();
        this.pendingBounceAnimator = true;
      }

      if (this.inRange && this.props.inertiaEnabled) {
        if (this.thumbScrolling || (!this.thumbScrolling && this.crossThumbScrolling)) {
          this.velocity = 0;
        }
        this.pendingInertiaAnimator = true;
      }
    }
  }

  @Effect()
  syncScrollLocation(): void {
    if (!this.inProgress) {
      this.newScrollLocation = this.props.scrollLocation;
    }
  }

  @Effect()
  performAnimation(): void {
    if (this.pendingInertiaAnimator) {
      if (this.canceled) {
        this.needRiseEnd = false;
        this.stop();
        return;
      }

      if (this.finished || (!this.props.bounceEnabled && this.distanceToNearestBoundary === 0)) {
        this.stop();
        return;
      }

      if (!this.props.bounceEnabled) {
        this.suppressVelocityBeforeBoundary();
      }
      this.scrollToNextStep();
    }

    if (this.pendingBounceAnimator) {
      if (this.distanceToNearestBoundary === 0) {
        this.stop();
        return;
      }
      this.suppressVelocityBeforeBoundary();
      this.scrollToNextStep();
    }
  }

  @Effect()
  updateLockedState(): void {
    if (this.pendingBounceAnimator || this.pendingRefreshing || this.pendingLoading) {
      this.props.onLock?.();
    } else {
      this.props.onUnlock?.();
    }
  }

  get isReadyToStart(): boolean {
    return this.needRiseEnd
      && !this.inProgress
      && !(this.pendingRefreshing || this.pendingLoading);
    // && this.props.maxOffset < 0; // TODO: try without it
  }

  get distanceToNearestBoundary(): number {
    return Math.min(Math.abs(this.distanceToMin), Math.abs(this.distanceToMax));
  }

  suppressVelocityBeforeBoundary(): void {
    if (Math.abs(this.distanceToMin) - Math.abs(this.velocity) <= 0) {
      this.velocity = this.distanceToMin;
    }
    if (Math.abs(this.distanceToMax) - Math.abs(this.velocity) <= 0) {
      this.velocity = this.distanceToMax;
    }
  }

  scrollToNextStep(): void {
    cancelAnimationFrame(this.stepAnimationFrame);

    this.stepAnimationFrame = requestAnimationFrame(() => {
      this.newScrollLocation = this.props.scrollLocation + this.velocity;
      this.velocity *= this.acceleration;
    });
  }

  setActiveState(): void {
    this.scrollbarRef.current!.setActiveState();
  }

  moveTo(value: number): void {
    this.scrollbarRef.current!.moveTo(value);
  }

  moveToMouseLocation(event: DxMouseEvent, offset: number): void {
    this.scrollbarRef.current!.moveToMouseLocation(event, offset);
  }

  resetThumbScrolling(): void {
    this.thumbScrolling = false;
    this.crossThumbScrolling = false;
  }

  stop(): void {
    this.velocity = 0;

    this.pendingBounceAnimator = false;
    this.pendingInertiaAnimator = false;
  }

  cancel(): void {
    this.canceled = true;
    this.stop();

    cancelAnimationFrame(this.stepAnimationFrame);
  }

  calcThumbScrolling(
    event: DxMouseEvent,
    currentCrossThumbScrolling: boolean,
    isScrollbarClicked: boolean,
  ): void {
    const { target } = event.originalEvent;

    this.thumbScrolling = isScrollbarClicked || (this.props.scrollByThumb && this.isThumb(target));
    this.crossThumbScrolling = !this.thumbScrolling && currentCrossThumbScrolling;
  }

  get distanceToMin(): number {
    return this.props.minOffset - this.props.scrollLocation;
  }

  get distanceToMax(): number {
    return this.maxOffset - this.props.scrollLocation;
  }

  get pendingRelease(): boolean {
    return ((this.props.pulledDown && this.props.pullDownEnabled)
      || (this.isReachBottom && this.props.reachBottomEnabled)) && !this.wasRelease;
  }

  get inProgress(): boolean {
    return this.pendingBounceAnimator || this.pendingInertiaAnimator;
  }

  get inRange(): boolean {
    return inRange(this.props.scrollLocation, this.maxOffset, this.props.minOffset);
  }

  get isReachBottom(): boolean {
    // T1032842
    // when sizes is decimal and a rounding error of about 1px
    // scrollLocation = 72.3422123432px | maxOffset = 73px
    return this.props.reachBottomEnabled
      && Math.round(this.props.scrollLocation - this.props.maxOffset) <= 1;
  }

  get finished(): boolean {
    if (this.pendingBounceAnimator) {
      return Math.abs(this.velocity) <= BOUNCE_MIN_VELOCITY_LIMIT;
    }

    return Math.abs(this.velocity) <= MIN_VELOCITY_LIMIT;
  }

  get acceleration(): number {
    return this.pendingBounceAnimator || this.inRange
      ? ACCELERATION
      : OUT_BOUNDS_ACCELERATION;
  }

  get maxOffset(): number {
    if (this.props.forceGeneratePockets
      && this.props.reachBottomEnabled && !this.forceAnimationToBottomBound) {
      return this.props.maxOffset - this.props.bottomPocketSize - this.props.contentPaddingBottom;
    }

    return this.props.maxOffset;
  }
}

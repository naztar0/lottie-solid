import {
  JSX,
  Ref,
  Setter,
  onMount,
  onCleanup,
  createSignal,
  Switch,
  Match,
  lazy,
} from 'solid-js';
import { render } from 'solid-js/web'
import lottie, { AnimationItem as LWAnimationItem } from 'lottie-web';

const Controls = lazy(() => import('./Controls'));

export type AnimationItem = {
  _play: () => void;
  _pause: () => void;
  _stop: () => void;
  setSeeker: (seek: number, play?: boolean) => void;
} & LWAnimationItem;

/**
 * Parse a resource into a JSON object or a URL string
 */
export function parseSrc(src: string | object): string | object {
  if (typeof src === 'object') {
    return src;
  }

  try {
    return JSON.parse(src);
  } catch (e) {
    // Do nothing...
  }

  // Try to construct an absolute URL from the src URL
  try {
    return new URL(src).toString();
  } catch (e) {
    // Do nothing...
  }

  return src;
}

// Necessary so that we can add Lottie to the window afterward
declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    lottie: any;
  }
}

// Define valid player states
export enum PlayerState {
  Loading = 'loading',
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
  Error = 'error',
}

// Define player events
export enum PlayerEvent {
  Load = 'load',
  InstanceSaved = 'instanceSaved',
  Error = 'error',
  Ready = 'ready',
  Play = 'play',
  Pause = 'pause',
  Stop = 'stop',
  Loop = 'loop',
  Complete = 'complete',
  Frame = 'frame',
}

export enum Buttons {
  Play = 'play',
  Stop = 'stop',
  Frame = 'frame',
  Background = 'background',
  Repeat = 'repeat',
  Snapshot = 'snapshot',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Transparent = 'transparent',
}

export type PlayerDirection = -1 | 1;

export interface IPlayerProps {
  id?: string;
  ref?: (ref: HTMLDivElement) => void;
  lottieRef?: (ref: AnimationItem) => void;
  onEvent?: (event: PlayerEvent) => any;
  onStateChange?: (state: PlayerState) => any;
  onBackgroundChange?: (color: string) => void;
  autoplay?: boolean;
  background?: string;
  controls?: boolean;
  direction?: PlayerDirection;
  hover?: boolean;
  click?: boolean;
  loop?: boolean;
  renderer?: 'svg' | 'canvas';
  speed?: number;
  src: object | string;
  style?: JSX.CSSProperties;
  rendererSettings?: object;
  keepLastFrame?: boolean;
  className?: string;
  buttons?: Buttons[];
  theme?: Theme;
}

interface IPlayerState {
  animationData: any;
  background: string;
  containerRef: Ref<HTMLDivElement> | null;
  seeker: number;
  loop: boolean;
  playerState: PlayerState;
}

// Build default config for lottie-web player
const defaultOptions = {
  clearCanvas: false,
  hideOnTransparent: true,
  progressiveLoad: true,
};

const defaultProps = {
  src: Object,
  loop: false,
  renderer: 'svg' as const,
  theme: (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') as Theme,
}

export const Player = (props: IPlayerProps = defaultProps): JSX.Element => {
  const player = new PlayerClass(props);

  onMount(() => {
    player.componentDidMount();
  });

  onCleanup(() => {
    player.componentWillUnmount();
  });

  return player.render();
};

class PlayerClass {
  private state: () => IPlayerState;
  private setState: Setter<IPlayerState>;
  private readonly props: IPlayerProps;

  private container: () => Element | null;
  private setContainer: Setter<Element | null>;
  private instance: AnimationItem | null = null;

  public unmounted = false;

  constructor(props: IPlayerProps) {
    this.props = { ...defaultProps, ...props };

    [this.state, this.setState] = createSignal<IPlayerState>({
      animationData: null,
      background: 'transparent',
      containerRef: null,
      playerState: PlayerState.Loading,
      seeker: 0,
      loop: this.props.loop || false,
    });

    [this.container, this.setContainer] = createSignal<Element | null>(null);

    if (typeof window !== 'undefined') {
      window.lottie = lottie;
    }
  }

  private updateState = (update: Partial<IPlayerState>) => {
    if (typeof this.props.onStateChange === 'function' && update.playerState) {
      this.props.onStateChange(update.playerState);
    }
    this.setState((prev) => ({ ...prev, ...update }));
  }

  public componentDidMount() {
    if (!this.unmounted) {
      this.createLottie().then();
    }
  }

  public componentWillUnmount() {
    this.unmounted = true;
    if (this.instance) {
      this.instance.destroy();
    }
  }

  handleBgChange = (data: string) => {
    const { onBackgroundChange } = this.props;

    if (typeof onBackgroundChange === 'function') {
      onBackgroundChange(data);
    }
    this.updateState({ background: data });
  };

  triggerDownload = (dataUri: any, filename: any) => {
    const element = document.createElement('a');

    element.href = dataUri;
    element.download = filename;
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  snapshot = (download = true) => {
    let data;
    const id = this.props.id ? this.props.id : 'lottie';
    const lottieElement = document.getElementById(id);
    if (this.props.renderer === 'svg') {
      if (lottieElement) {
        const svgElement = lottieElement.querySelector('svg');

        if (svgElement) {
          const serializedSvg = new XMLSerializer().serializeToString(svgElement);
          data = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serializedSvg);
        }
      }
      if (download) {
        this.triggerDownload(data, `snapshot.svg`);
      }
    } else if (this.props.renderer === 'canvas') {
      if (lottieElement) {
        const canvas = lottieElement.querySelector('canvas');
        if (canvas) {
          data = canvas.toDataURL('image/png');
        }
      }
      if (download) {
        this.triggerDownload(data, `snapshot.png`);
      }
    }
    return data;
  };

  public render() {
    const { style, className } = this.props;

    return (
      <div class="lottie-player-container" ref={this.props.ref}>
        <Switch>
          <Match when={this.state().playerState === PlayerState.Error}>
            <div class="lottie-error">
              <span aria-label="error-symbol" role="img">
                ⚠️
              </span>
            </div>
          </Match>
          <Match when={this.state().playerState !== PlayerState.Error}>
            <div
              id={this.props.id ? this.props.id : 'lottie'}
              ref={this.setContainer}
              style={{
                background: this.state().background,
                margin: '0 auto',
                outline: 'none',
                overflow: 'hidden',
                ...style,
              }}
              class={className}
            />
          </Match>
        </Switch>
      </div>
    );
  }

  private async createLottie() {
    const {
      autoplay,
      direction,
      loop,
      lottieRef,
      renderer,
      speed,
      src,
      background,
      rendererSettings,
      hover,
      click,
      buttons,
      theme,
    } = this.props;

    if (!src || !this.container()) {
      return;
    }

    // Load the resource information
    try {
      // Parse the src to see if it is a URL or Lottie JSON data
      let animationData = parseSrc(src);

      if (typeof animationData === 'string') {
        const fetchResult = await fetch(animationData as string).catch(() => {
          this.updateState({ playerState: PlayerState.Error });
          this.triggerEvent(PlayerEvent.Error);
          throw new Error('lottie-solid: Animation data could not be fetched.');
        });

        animationData = await fetchResult.json().catch(() => {
          this.updateState({ playerState: PlayerState.Error });
          this.triggerEvent(PlayerEvent.Error);
          throw new Error('lottie-solid: Animation data could not be fetched.');
        });
      }

      // Clear previous animation, if any
      if (this.instance) {
        this.instance.destroy();
      }

      // Initialize lottie player and load animation
      const newInstance = lottie.loadAnimation({
        rendererSettings: rendererSettings || defaultOptions,
        animationData,
        autoplay: autoplay || false,
        container: this.container()!,
        loop: loop || false,
        renderer,
      }) as AnimationItem;

      newInstance._play = newInstance.play.bind(newInstance);
      newInstance._pause = newInstance.pause.bind(newInstance);
      newInstance._stop = newInstance.stop.bind(newInstance);
      newInstance.play = this.play.bind(this);
      newInstance.pause = this.pause.bind(this);
      newInstance.stop = this.stop.bind(this);
      newInstance.setLoop = this.setLoop.bind(this);
      newInstance.setSeeker = this.setSeeker.bind(this);

      if (speed) {
        newInstance.setSpeed(speed);
      }
      this.instance = newInstance;
      this.updateState({ animationData });
      this.triggerEvent(PlayerEvent.InstanceSaved);

      if (typeof lottieRef === 'function') {
        lottieRef(newInstance);
      }
      if (autoplay) {
        this.play();
      }

      // Handle new frame event
      newInstance.addEventListener('enterFrame', () => {
        this.triggerEvent(PlayerEvent.Frame);

        this.updateState({
          seeker: Math.floor((newInstance as any).currentFrame),
        });
      });

      // Handle lottie-web ready event
      newInstance.addEventListener('DOMLoaded', () => {
        this.triggerEvent(PlayerEvent.Load);
      });

      // Handle animation data load complete
      newInstance.addEventListener('data_ready', () => {
        this.triggerEvent(PlayerEvent.Ready);
      });

      // Set error state when animation load fail event triggers
      newInstance.addEventListener('data_failed', () => {
        this.updateState({ playerState: PlayerState.Error });
        this.triggerEvent(PlayerEvent.Error);
      });

      // Handle new loop event
      newInstance.addEventListener('loopComplete', () => {
        this.triggerEvent(PlayerEvent.Loop);
      });

      // Set state to stop if the loop is off and anim has completed
      newInstance.addEventListener('complete', () => {
        this.triggerEvent(PlayerEvent.Complete);
        this.updateState({ playerState: PlayerState.Stopped });

        if (!this.props.keepLastFrame || this.props.loop) {
          this.setSeeker(0);
        }
      });

      if (hover) {
        this.container()!.addEventListener('mouseenter', () => {
          if (this.state().playerState !== PlayerState.Playing) {
            if (this.props.keepLastFrame) {
              this.stop();
            }
            this.play();
          }
        });
        this.container()!.addEventListener('mouseleave', () => {
          if (this.state().playerState === PlayerState.Playing) {
            this.stop();
          }
        });
      }

      if (click) {
        this.container()!.addEventListener('click', () => {
          if (this.state().playerState !== PlayerState.Playing) {
            if (this.props.keepLastFrame) {
              this.stop();
            }
            this.play();
          } else {
            this.stop();
          }
        });
      }

      if (this.props.controls) {
        render(() => (
          <Controls
            buttons={buttons}
            instance={newInstance}
            theme={theme}
            state={this.state}
            pause={() => this.pause()}
            play={() => this.play()}
            stop={() => this.stop()}
            snapshot={() => this.snapshot()}
            setLoop={(loop: boolean) => this.setLoop(loop)}
            setSeeker={(f: number, p: boolean) => this.setSeeker(f, p)}
            colorChangedEvent={(hex: string) => this.handleBgChange(hex)}
          />
        ), this.container()!);
      }

      // Set initial playback speed and direction
      if (speed) {
        newInstance.setSpeed(speed);
      }

      if (direction) {
        newInstance.setDirection(direction);
      }

      if (background) {
        this.updateState({ background });
      }
    } catch (e) {
      this.updateState({ playerState: PlayerState.Error });
      this.triggerEvent(PlayerEvent.Error);
    }
  }

  public play() {
    if (!this.instance) {
      return;
    }
    this.instance._play();
    this.updateState({ playerState: PlayerState.Playing });
    this.triggerEvent(PlayerEvent.Play);
  }

  public pause() {
    if (!this.instance) {
      return;
    }
    this.instance._pause();
    this.updateState({ playerState: PlayerState.Paused });
    this.triggerEvent(PlayerEvent.Pause);
  }

  public stop() {
    if (!this.instance) {
      return;
    }
    this.instance._stop();
    this.updateState({ playerState: PlayerState.Stopped });
    this.triggerEvent(PlayerEvent.Stop);
  }

  public setSeeker(seek: number, play = false) {
    if (!this.instance) {
      return;
    }
    if (play) {
      this.instance.goToAndPlay(seek, true);
      this.updateState({ playerState: PlayerState.Playing, seeker: seek });
      this.triggerEvent(PlayerEvent.Play);
    } else {
      this.instance.goToAndStop(seek, true);
      this.updateState({ playerState: PlayerState.Paused, seeker: seek });
      this.triggerEvent(PlayerEvent.Pause);
    }
  }

  public setLoop(loop: boolean) {
    if (!this.instance) {
      return;
    }
    this.instance.loop = loop;
    this.updateState({ loop });
  }

  private triggerEvent(event: PlayerEvent) {
    const { onEvent } = this.props;

    if (onEvent) {
      onEvent(event);
    }
  }
}

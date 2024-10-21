## LottiePlayer Solid Component

This is a Solid.js component for the Lottie Web Player.<br>Based on the [Lottie Player Web Component](https://github.com/LottieFiles/lottie-player). 

## Demo

![screencast](https://i.imgur.com/miLzIkJ.gif)

## Usage

### Installation

1. Install package using npm or yarn.

```shell
npm install lottie-solid
```

2. Import package in your code.

```javascript
import { Player, Buttons, Theme } from 'lottie-solid';
```

### Player component

Add the element `Player` and set the `src` prop to a URL pointing to a valid Lottie JSON.

```javascript
<Player
  autoplay
  loop
  controls
  src="https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json"
  style={{ height: '300px', width: '300px' }}
  buttons={[Buttons.Play, Buttons.Repeat, Buttons.Frame]}
  theme={Theme.Transparent}
/>
```

## Props

| Prop                 | Description                                                            | Type                | Default     |
|----------------------|------------------------------------------------------------------------|---------------------|-------------|
| `lottieRef`          | Get lottie animation object                                            | `function`          | `undefined` |
| `onEvent`            | Listen for events                                                      | `function`          | `undefined` |
| `onStateChange`      | Play state changes                                                     | `function`          | `undefined` |
| `onBackgroundChange` | Listen for bg changes                                                  | `function`          | `undefined` |
| `autoplay`           | Autoplay animation on load.                                            | `boolean`           | `false`     |
| `background`         | Background color.                                                      | `string`            | `undefined` |
| `controls`           | Show controls.                                                         | `boolean`           | `false`     |
| `direction`          | Direction of animation.                                                | `number`            | `1`         |
| `hover`              | Whether to play on mouse hover.                                        | `boolean`           | `false`     |
| `click`              | Whether to play on mouse click.                                        | `boolean`           | `false`     |
| `keepLastFrame`      | Stop animation on the last frame.</br>Has no effect if `loop` is true. | `boolean`           | `false`     |
| `loop`               | Whether to loop animation.                                             | `boolean`           | `false`     |
| `renderer`           | Renderer to use.                                                       | `"svg" \| "canvas"` | `'svg'`     |
| `speed`              | Animation speed.                                                       | `number`            | `1`         |
| `style`              | The style for the container.                                           | `object`            | `undefined` |
| `buttons`            | The buttons to show.                                                   | `Buttons[]`         | `undefined` |
| `theme`              | The theme to use.                                                      | `Theme`             | `undefined` |
| `src` _(required)_   | Bodymovin JSON data or URL to JSON.                                    | `object`            | `string`    |

## Get Player instance

To call methods on the instance of the Player component. You may get a reference to the component and call the methods
on ref.current. That's a solid way of doing a document.getElementById(); You may then use this ref i.e.: player
in the example below to call methods that are described in this documentation.

```typescript jsx
import { createSignal, createEffect } from 'solid-js';
import { Player } from 'lottie-solid';

export default function App() {
  const [playerRef, setPlayerRef] = createSignal<HTMLDivElement>();

  return (
    <Player
      ref={setPlayerRef} // set the ref to your component
      loop
      src="https://assets3.lottiefiles.com/packages/lf20_XZ3pkn.json"
      style={{ height: '300px', width: '300px' }}
    />
  );
}
```

## Get Lottie instance

The lottieRef prop returns the Lottie instance which you can use to set data and call methods as described in the
[bodymovin documentation](https://github.com/airbnb/lottie-web).

```typescript jsx
import { createSignal, createEffect } from 'solid-js';
import { Player, AnimationItem } from 'lottie-solid';

export default function App() {
  const [lottieRef, setLottieRef] = createSignal<AnimationItem>();

  // example of calling a method on the lottie instance
  // this will pause the animation after 1 second
  createEffect(() => {
    const lottie = lottieRef();
    if (lottie) {
      setTimeout(() => lottie.pause(), 1000);
    }
  });
  
  return (
    <Player
      lottieRef={setLottieRef} // the lottie instance is returned in the argument of this prop. set it to your local state
      loop
      src="https://assets3.lottiefiles.com/packages/lf20_XZ3pkn.json"
      style={{ height: '300px', width: '300px' }}
    />
  );
}
```

## Listening for events

```typescript jsx
import { createSignal, createEffect } from 'solid-js';
import { Player, AnimationItem } from 'lottie-solid';

export default function App() {
  const [lottieRef, setLottieRef] = createSignal<AnimationItem>();


  const doSomething = () => {
    lottieRef()?.play(); // make use of the lottie instance and call methods
  }
  
  return (
    <Player
      onEvent={(event) => {
        // check event type and do something
        if (event === 'load') {
          this.doSomething();
        }
      }}
      lottieRef={setLottieRef}
      loop
      src="https://assets3.lottiefiles.com/packages/lf20_XZ3pkn.json"
      style={{ height: '300px', width: '300px' }}
    />
  );
}
```

## Events

The following events are exposed and can be listened to via `addEventListener` calls.

| Name       | Description                                                               |
|------------|---------------------------------------------------------------------------|
| `load`     | Animation data is loaded.                                                 |
| `error`    | An animation source cannot be parsed, fails to load or has format errors. |
| `ready`    | Animation data is loaded and player is ready.                             |
| `play`     | Animation starts playing.                                                 |
| `pause`    | Animation is paused.                                                      |
| `stop`     | Animation is stopped.                                                     |
| `loop`     | An animation loop is completed.                                           |
| `complete` | Animation is complete (all loops completed).                              |
| `frame`    | A new frame is entered.                                                   |

## Methods

### `play() => void`

Start playing animation.

#### Returns

Type: `void`

### `pause() => void`

Pause animation play.

#### Returns

Type: `void`

### `stop() => void`

Stop animation play.

#### Returns

Type: `void`

### `setDirection(direction: 1 | -1 ) => void`

Animation play direction.

#### Parameters

| Name    | Type     | Description       |
|---------|----------|-------------------|
| `value` | `number` | Direction values. |

#### Returns

Type: `void`

### `setSpeed(speed?: number) => void`

Sets animation play speed.

#### Parameters

| Name    | Type     | Description     |
|---------|----------|-----------------|
| `value` | `number` | Playback speed. |

#### Returns

Type: `void`

### `setSeeker(frame: number, play: boolean) => void`

Seek to a given frame.

#### Parameters

| Name    | Type      | Description       |
|---------|-----------|-------------------|
| `frame` | `number`  | Frame number.     |
| `play`  | `boolean` | Play after seek.  |

#### Returns

Type: `void`

## License

MIT License © Neulen.dev

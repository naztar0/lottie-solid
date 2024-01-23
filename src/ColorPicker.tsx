import { createSignal, createEffect, Setter } from 'solid-js';

interface ColorPickerProps {
  colorChangedEvent?: (hex: string) => void;
}

interface ColorPickerState {
  red: number;
  green: number;
  blue: number;
  rgba: string | null;
  hex: string;
  colorComponents: number[];
}

export const ColorPicker = (props: ColorPickerProps) => {
  const colorPicker = new ColorPickerClass(props);
  return colorPicker.render();
}

class ColorPickerClass {
  private props: ColorPickerProps;

  private state: () => ColorPickerState;
  private setState: Setter<ColorPickerState>;

  constructor(props: ColorPickerProps) {
    this.props = props;

    [this.state, this.setState] = createSignal<ColorPickerState>({
      red: 0,
      green: 0,
      blue: 0,
      rgba: null,
      hex: '#000000',
      colorComponents: [],
    });
  }

  private handleChange = (rgb: string, value: any) => {
    if (rgb === 'r') {
      this.setState((prev) => ({
        ...prev,
        hex: '#' +
          (value | (1 << 8)).toString(16).slice(1) +
          (prev.green | (1 << 8)).toString(16).slice(1) +
          (prev.blue | (1 << 8)).toString(16).slice(1)
      }));
    } else if (rgb === 'g') {
      this.setState((prev) => ({
        ...prev,
        hex: '#' +
          (prev.red | (1 << 8)).toString(16).slice(1) +
          (value | (1 << 8)).toString(16).slice(1) +
          (prev.blue | (1 << 8)).toString(16).slice(1)
      }));
    } else if (rgb === 'b') {
      this.setState((prev) => ({
        ...prev,
        hex: '#' +
          (prev.red | (1 << 8)).toString(16).slice(1) +
          (prev.green | (1 << 8)).toString(16).slice(1) +
          (value | (1 << 8)).toString(16).slice(1)
      }));
    }
  };

  private parseColor = (input: string | null) => {
    if (typeof input !== 'string') {
      return;
    }
    if (input[0] === '#') {
      this.setState((prev) => ({
        ...prev,
        colorComponents: input.length === 4
          ? [input.slice(1, 2), input.slice(2, 3), input.slice(3, 4)].map(n => parseInt(`${n}${n}`, 16))
          : [input.slice(1, 3), input.slice(3, 5), input.slice(5, 7)].map(n => parseInt(n, 16))
      }));
    } else if (input.startsWith('rgb')) {
      const colorComponents = input.match(/\d+/g)?.map(n => parseInt(n));
      if (colorComponents !== undefined) {
        this.setState((prev) => ({ ...prev, colorComponents }));
      }
    }

    if (this.state().colorComponents.length) {
      this.state().red = this.state().colorComponents[0];
      this.state().green = this.state().colorComponents[1];
      this.state().blue = this.state().colorComponents[2];
    }
  };


  public render() {
    createEffect(() => {
      if (this.props.colorChangedEvent) {
        this.props.colorChangedEvent(this.state().hex);
      }
    });

    return (
      <div class="lottie-color-picker">
        <div class="lottie-color-selectors">
          <div class="lottie-color-component">
            <strong>Red</strong>
            <input
              type="range"
              min="0"
              max="255"
              value={this.state().red}
              onChange={event => {
                this.state().red = Number(event.target.value);
                this.handleChange('r', event.target.value);
              }}
            />
            <input
              class="lottie-text-input"
              type="number"
              min="0"
              max="255"
              value={this.state().red}
              onChange={event => {
                this.state().red = Number(event.target.value);
                this.handleChange('r', event.target.value);
              }}
            />
          </div>
          <div class="lottie-color-component">
            <strong>Green</strong>
            <input
              type="range"
              min="0"
              max="255"
              value={this.state().green}
              onChange={event => {
                this.state().green = Number(event.target.value);
                this.handleChange('g', event.target.value);
              }}
            />
            <input
              class="lottie-text-input"
              type="number"
              min="0"
              max="255"
              value={this.state().green}
              onChange={event => {
                this.state().green = Number(event.target.value);
                this.handleChange('g', event.target.value);
              }}
            />
          </div>
          <div class="lottie-color-component">
            <strong>Blue</strong>
            <input
              type="range"
              min="0"
              max="255"
              value={this.state().blue}
              onChange={event => {
                this.state().blue = Number(event.target.value);
                this.handleChange('b', event.target.value);
              }}
            />
            <input
              class="lottie-text-input"
              type="number"
              min="0"
              max="255"
              value={this.state().blue}
              onChange={event => {
                this.state().blue = Number(event.target.value);
                this.handleChange('b', event.target.value);
              }}
            />
          </div>
        </div>
        <div class="lottie-color-preview">
          <div
            class="lottie-preview"
            style={{ background: `rgb(${this.state().red}, ${this.state().green}, ${this.state().blue})` }}
          />
          <div>
            <input
              class="lottie-text-input"
              type="text"
              value={this.state().hex}
              onChange={e => {
                this.state().hex = e.target.value;
                this.parseColor(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

import { createMemo, JSX, Show } from 'solid-js';
import { Theme } from './Player';
import './styles.css';

interface ISeekerProps {
  className?: string;
  disabled?: boolean;
  max: number;
  min: number;
  onChange: (e: any) => void;
  onChangeStart?: (v: number) => void;
  onChangeEnd?: (v: number) => void;
  showLabels?: boolean;
  step: number;
  state: () => { seeker: number };
  theme?: Theme;
}

// noinspection JSUnusedGlobalSymbols
export const Seeker = (props: ISeekerProps) => {
  const seeker = new SeekerClass(props);
  return seeker.render();
};

class SeekerClass {
  private props: ISeekerProps;
  inputRef: any = null;

  constructor(props: ISeekerProps) {
    this.props = props;
  }

  handleChange = () => (event: any) => {
    const value = event.target.value;
    const frame = Math.floor((value / 100) * this.props.max);
    this.props.onChange(frame);
  };

  render() {
    const progress = createMemo(() => (this.props.state().seeker / this.props.max) * 100);

    const seekerContainerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      marginRight: '5px',
      marginLeft: '5px',
      position: 'relative',
    } as JSX.CSSProperties;

    const minLabelStyle = {
      position: 'absolute',
      left: 0,
      marginTop: '8px',
      width: '20px',
      display: 'block',
      border: '0px',
      backgroundColor: this.props.theme === Theme.Dark ? '#505050' : '#DAE1E7',
      color: this.props.theme === Theme.Dark ? '#B9B9B9' : '#555',
      padding: '2px',
      textAlign: 'center',
      borderRadius: '3px',
      fontSize: '8px',
      fontWeight: 'bold',
    } as JSX.CSSProperties;

    const maxLabelStyle = {
      position: 'absolute',
      right: 0,
      marginTop: '8px',
      width: '20px',
      display: 'block',
      border: '0px',
      backgroundColor: this.props.theme === Theme.Dark ? '#505050' : '#DAE1E7',
      color: this.props.theme === Theme.Dark ? '#B9B9B9' : '#555',
      padding: '2px',
      textAlign: 'center',
      borderRadius: '3px',
      fontSize: '8px',
      fontWeight: 'bold',
    } as JSX.CSSProperties;

    return (
      <div style={seekerContainerStyle}>
        <input
          ref={this.inputRef}
          id="track"
          class="lottie-progress"
          name="progress"
          aria-label="progress"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress()}
          onInput={this.handleChange()}
          onChange={this.handleChange()}
        />
        <Show when={this.props.showLabels}>
          <div style={{ display: 'flex', 'justify-content': 'space-between' }}>
            <div style={minLabelStyle}>{this.props.min}</div>
            <div style={maxLabelStyle}>{this.props.max}</div>
          </div>
        </Show>
      </div>
    );
  }
}

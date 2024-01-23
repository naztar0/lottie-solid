import { createSignal, JSX } from 'solid-js';

interface IPopoverProps {
  children: JSX.Element;
  icon: JSX.Element;
}

export const Popover = (props: IPopoverProps) => {
  const { children, icon } = props;
  const [_open, setOpen] = createSignal(false);

  /**
   * Show content box
   */
  const show = () => {
    setOpen(true);
  };

  /**
   * Hide content box
   */
  const hide = () => {
    setOpen(false);
  };

  return (
    <div
      class="lottie-popover"
      onMouseOver={show}
      onMouseLeave={hide}
    >
      <div class=" lottie-player-btn">{icon}</div>
      <div
        class="lottie-popover-content"
        style={{
          bottom: '22px',
          right: '0px',
          'z-index': 2,
          visibility: _open() ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};

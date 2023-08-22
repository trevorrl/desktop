import React, { useRef } from 'react';
import cx from 'classnames';
import useLayout, { LayoutProps, ILayoutSlotArray } from './hooks';
import ResizeBar from 'components-react/root/ResizeBar';
import styles from './Layouts.m.less';

export default function Default(p: React.PropsWithChildren<LayoutProps>) {
  const { mins, bars, resizes, calculateMax, setResizing, setBar } = useLayout(
    componentRef.current,
    vectors,
    false,
    [],
    p.onTotalWidth,
  );

  const vectors: ILayoutSlotArray = ['1', '2', ['3', '4', '5']];
  const componentRef = useRef<HTMLDivElement>(null);

  function BottomSection() {
    return (
      <div
        className={styles.segmented}
        style={{ height: `${resizes.bar2 * 100}%`, padding: '0 8px' }}
      >
        {['3', '4', '5'].map(slot => (
          <div className={cx(styles.cell, 'no-top-padding')}>{p.children[slot]}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.rows} ref={componentRef}>
      <div
        className={styles.cell}
        style={{ height: `${100 - (resizes.bar1 + resizes.bar2) * 100}%` }}
      >
        {p.children['1']}
      </div>
      <ResizeBar
        position="top"
        value={bar1}
        onInput={(value: number) => setBar('bar1', value)}
        onResizestart={() => setResizing(true)}
        onResizestop={() => setResizing(false)}
        max={calculateMax(mins.rest + bars.bar2)}
        min={mins.bar1}
        reverse
      />
      <div
        style={{ height: `${resizes.bar1 * 100}%` }}
        className={cx(styles.cell, 'no-top-padding')}
      >
        {p.children['2']}
      </div>
      <ResizeBar
        position="top"
        value={bar2}
        onInput={(value: number) => setBar('bar2', value)}
        onResizestart={() => setResizing(true)}
        onResizestop={() => setResizing(false)}
        max={calculateMax(mins.rest + mins.bar1)}
        min={mins.bar2}
        reverse
      />
      <BottomSection />
    </div>
  );
}

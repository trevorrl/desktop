import React, { useState } from 'react';
import { IHotkey, IBinding } from 'services/hotkeys';
import TsxComponent, { createProps } from 'components/tsx-component';
import { byOS, OS } from 'util/operating-systems';

import './Hotkey.m.less';

/**
 * Represents a binding that has a unique key for CSS animations
 */
interface IKeyedBinding {
  binding: IBinding;
  key: string;
}

class HotkeyProps {
  hotkey: IHotkey = {} as IHotkey;
}

export default function Hotkey(props: React.PropsWithChildren<HotkeyProps>) {
  const bindings: IKeyedBinding[] = [];

  const [description, setDescription] = useState<string>();
  const [hotkey, setHotkey] = useState<IHotkey>();

  /**
   * Add binding to the bindings array
   * @param index
   */
  function addBinding(index: number) {
    bindings.splice(index + 1, 0, createBindingWithKey(getBlankBinding()));
  }

  /**
   * Needed to uniquely identify the binding in the DOM. This allows CSS animations to work properly
   * @param binding
   * @returns Key bound to action/key
   */
  function createBindingWithKey(binding: IBinding): IKeyedBinding {
    return {
      binding,
      key: Math.random().toString(36).substring(2, 15),
    };
  }

  function created() {
    setHotkey(props.hotkey);
    setDescription(props.hotkey.description);

    if (props.hotkey.bindings.length === 0) {
      // bindings = []
    }
  }

  /**
   *
   * @param binding
   * @returns String of the current key binding in a human readable format
   */
  function getBindingString(binding: IBinding): string {
    let key = binding.key;
    const keys: string[] = [];
    const matchKey = binding.key.match(/^Key([A-Z])$/);
    const matchDigit = binding.key.match(/^Digit([0-9])$/);

    if (binding.modifiers.alt) {
      keys.push(byOS({ [OS.Windows]: 'Alt', [OS.Mac]: 'Opt' }));
    }
    if (binding.modifiers.ctrl) {
      keys.push('Ctrl');
    }
    if (binding.modifiers.shift) {
      keys.push('Shift');
    }
    if (binding.modifiers.meta) {
      keys.push(byOS({ [OS.Windows]: 'Win', [OS.Mac]: 'Cmd' }));
    }

    if (matchDigit) {
      key = matchDigit[1];
    }

    if (matchKey) {
      key = matchKey[1];
    }

    if (key === 'MiddleMouseButton') {
      key = 'Mouse 3';
    }
    if (key === 'X1MouseButton') {
      key = 'Mouse 4';
    }
    if (key === 'X2MouseButton') {
      key = 'Mouse 5';
    }

    keys.push(key);

    return keys.join('+');
  }

  /**
   *
   * @returns A blank hotkey binding object
   */
  const getBlankBinding = () => {
    return {
      key: '',
      modifiers: {
        alt: false,
        ctrl: false,
        shift: false,
        meta: false,
      },
    };
  };

  const getModifiers = (event: KeyboardEvent | MouseEvent) => {
    return {
      alt: event.altKey,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    };
  };

  function handlePress(event: KeyboardEvent | MouseEvent, index: number) {
    // We don't allow binding left or right click
    if (event instanceof MouseEvent && (event.button === 0 || event.button === 2)) return;

    // We don't allow binding a modifier by instelf
    if (event instanceof KeyboardEvent && isModifierPress(event)) return;

    event.preventDefault();

    const binding = bindings[index];

    const key = (event instanceof MouseEvent
      ? {
          1: 'MiddleMouseButton',
          3: 'X1MouseButton',
          4: 'X2MouseButton',
        }[event.button]
      : event.code) as string;

    binding.binding = {
      key,
      modifiers: getModifiers(event),
    };

    setBindings();
  }

  /**
   * Will return a true or false if one of the modifiers are pressed
   * @param event
   * @returns Boolean
   */
  function isModifierPress(event: KeyboardEvent): boolean {
    return ['Control', 'Alt', 'Meta', 'Shift'].includes(event.key);
  }

  /**
   * This removes the selected binding from the bindings array
   * @param index
   */
  function removeBinding(index: number) {
    if (bindings.length === 1) {
      bindings[0].binding = getBlankBinding();
    } else {
      bindings.splice(index, 1);
    }

    setBindings();
  }

  function setBindings() {
    const _bindings: IBinding[] = [];

    bindings.forEach(binding => {
      if (binding.binding.key) {
        _bindings.push(binding.binding);
      }
    });

    // This needs updated
    // props.hotkey.bindings = bindings;
  }

  return (
    <div className="hotkey">
      <div className="Hotkey-description">{description}</div>
      <div className="Hotkey-bindings">
        {bindings.map((binding, index) => (
          <div className="hotkey-binding">
            <input
              type="text"
              class="Hotkey-input"
              value={getBindingString(binding.binding)}
              onKeyDown={(event: KeyboardEvent) => handlePress(event, index)}
              onMouseDown={(event: MouseEvent) => handlePress(event, index)}
            />
            <i className="Hotkey-control fa fa-plus" onClick={addBinding(index)} />
            <i className="Hotkey-control fa fa-minus" onClick={removeBinding(index)} />
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { AutoComplete } from 'antd';
import { InputComponent } from './inputs';
import InputWrapper from './InputWrapper';
import { TListInputProps } from './ListInput';

export const AutocompleteInput = InputComponent(
  <T extends any>(p: TListInputProps<T> & { validator?: (value: string) => boolean }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [query, setQuery] = useState(p.value as string);

    function handleChange(val: string) {
      setQuery(val);

      console.log(val);

      if (p.onChange) {
        p.onChange(val as T);
      }
    }

    return (
      <InputWrapper label={p.label}>
        <AutoComplete
          options={p.options as { label: string; value: string }[]}
          value={query}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
          open={dropdownOpen}
          onChange={handleChange}
          onSelect={handleChange}
          rules={p.rules}
          defaultValue={p.defaultValue as string}
          data-value={p.value}
        />
      </InputWrapper>
    );
  },
);

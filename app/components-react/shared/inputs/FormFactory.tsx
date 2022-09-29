import React from 'react';
import { FormProps, InputProps } from 'antd';
import * as inputs from './index';
import Form from './Form';
import { TInputMetadata } from './metadata';
import { TSlobsInputProps } from './index';

type TInputValue = string | number | boolean;

const componentTable: Dictionary<React.FunctionComponent<TSlobsInputProps<{}, TInputValue>>> = {
  text: inputs.TextInput,
  number: inputs.NumberInput,
  slider: inputs.SliderInput,
  bool: inputs.CheckboxInput,
  list: inputs.ListInput,
  seconds: inputs.SliderInput,
};

interface IFormMetadata {
  [value: string]: TInputMetadata;
}

export default function FormFactory(p: {
  metadata: IFormMetadata;
  onInput: (key: string) => (value: TInputValue) => void;
  values: Dictionary<TInputValue>;
  formOptions?: FormProps;
}) {
  return (
    <Form {...p.formOptions}>
      {Object.keys(p.metadata).map((key: string) => {
        const metadata = p.metadata[key];
        if (!metadata.type) return <div />;

        const Input = componentTable[metadata.type];
        const children = metadata.children;

        return (
          <>
            <Input
              {...p.metadata}
              value={p.values[key]}
              onChange={metadata.onChange || p.onInput(key)}
            />
            {children &&
              Object.keys(children)
                .filter(childKey => children[childKey].displayed)
                .map(childKey => (
                  <Input
                    {...children[childKey]}
                    value={p.values[childKey]}
                    onChange={children[childKey].onChange || p.onInput(childKey)}
                  />
                ))}
          </>
        );
      })}
    </Form>
  );
}

import React from 'react';
import { FormProps } from 'antd';
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
  onChange: (key: string) => (value: TInputValue) => void;
  values: Dictionary<TInputValue>;
  formOptions?: FormProps;
}) {
  return (
    <Form {...p.formOptions}>
      {Object.keys(p.metadata).map((inputKey: string) => (
        <FormInput
          key={inputKey}
          id={inputKey}
          metadata={p.metadata[inputKey]}
          values={p.values}
          onChange={p.onChange}
        />
      ))}
    </Form>
  );
}

function FormInput(p: {
  id: string;
  metadata: TInputMetadata<unknown>;
  values: Dictionary<TInputValue>;
  onChange: (key: string) => (value: TInputValue) => void;
}) {
  const children = p.metadata.children;

  if (!p.metadata.type) return <></>;

  const Input = componentTable[p.metadata.type];

  return (
    <>
      <Input
        {...p.metadata}
        value={p.values[p.id]}
        onChange={p.metadata.onChange || p.onChange(p.id)}
      />
      {children &&
        Object.keys(children)
          .filter(childKey => children[childKey].displayed)
          .map(childKey => (
            <FormInput
              key={childKey}
              id={childKey}
              metadata={children[childKey]}
              values={p.values}
              onChange={() => children[childKey].onChange || p.onChange(childKey)}
            />
          ))}
    </>
  );
}

import React from 'react';
import * as inputs from './index';
import Form from './Form';
import { TInputMetadata } from './metadata';

const componentTable: Dictionary<React.FunctionComponent> = {
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

export default function FormFactory(p: { metadata: IFormMetadata }) {
    <Form>
        {Object.keys(p.metadata).map((key: string) => {
            const metadata = p.metadata[key];
            const Input = componentTable[metadata.type];

            return <Input {...p.metadata} />;
        })}
    </Form>
}

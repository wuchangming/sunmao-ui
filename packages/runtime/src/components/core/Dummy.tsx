import { createComponent } from '@meta-ui/core';
import { useEffect } from 'react';
import { ComponentImplementation } from '../../services/registry';

const Dummy: ComponentImplementation<Record<string, unknown>> = ({ effects }) => {
  useEffect(() => {
    return () => {
      effects?.forEach(e => e());
    };
  }, []);

  return null;
};
export default {
  ...createComponent({
    version: 'core/v1',
    metadata: {
      name: 'dummy',
      displayName: 'Dummy',
      description: 'Dummy Invisible component',
      isDraggable: false,
      isResizable: false,
      exampleProperties: {},
    },
    spec: {
      properties: {},
      acceptTraits: [],
      state: {},
      methods: [],
    },
  }),
  impl: Dummy,
};
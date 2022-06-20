import * as Icons from '@arco-design/web-react/icon';
import { implementRuntimeComponent } from '@sunmao-ui/runtime';
import { css, cx } from '@emotion/css';
import { Type } from '@sinclair/typebox';
import { FALLBACK_METADATA } from '../sunmao-helper';
import { StringUnion } from '@sunmao-ui/shared';

const IconsType = Object.keys(Icons);

const IconPropsSpec = Type.Object({
  name: StringUnion(IconsType, {
    title: 'Name',
  }),
  spin: Type.Boolean({
    title: 'Spin',
  }),
});

export const Icon = implementRuntimeComponent({
  version: 'arco/v1',
  metadata: {
    ...FALLBACK_METADATA,
    name: 'icon',
    displayName: 'Icon',
    exampleProperties: {
      name: 'IconArrowUp',
      spin: false,
    },
    annotations: {
      category: 'Display',
    },
  },
  spec: {
    properties: IconPropsSpec,
    state: Type.Object({}),
    methods: {},
    slots: {},
    styleSlots: ['content'],
    events: ['event'],
  },
})(props => {
  const { elementRef, name, spin, customStyle } = props;
  const _Icon = Icons[name as keyof typeof Icons];

  return <_Icon ref={elementRef} className={cx(css(customStyle?.content))} spin={spin} />;
});

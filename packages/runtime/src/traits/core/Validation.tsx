import { Static, Type } from '@sinclair/typebox';
import { isEqual } from 'lodash-es';
import { implementRuntimeTrait } from '../../utils/buildKit';
import { CORE_VERSION, CoreTraitName } from '@sunmao-ui/shared';

type ValidationResult = Static<typeof ResultSpec>;
type ValidationRule = (text: string) => ValidationResult;

const ResultSpec = Type.Object({
  isInvalid: Type.Boolean(),
  errorMsg: Type.String(),
});

export const ValidationTraitStateSpec = Type.Object({
  validResult: ResultSpec,
});

export const ValidationTraitPropertiesSpec = Type.Object({
  value: Type.String(),
  rule: Type.Optional(Type.String()),
  maxLength: Type.Optional(Type.Integer()),
  minLength: Type.Optional(Type.Integer()),
});

export default implementRuntimeTrait({
  version: CORE_VERSION,
  metadata: {
    name: CoreTraitName.Validation,
    description: 'validation trait',
  },
  spec: {
    properties: ValidationTraitPropertiesSpec,
    state: ValidationTraitStateSpec,
    methods: [],
  },
})(() => {
  const rules = new Map<string, ValidationRule>();

  function addValidationRule(name: string, rule: ValidationRule) {
    rules.set(name, rule);
  }

  addValidationRule('email', text => {
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(text)) {
      return {
        isInvalid: false,
        errorMsg: '',
      };
    } else {
      return {
        isInvalid: true,
        errorMsg: '请输入正确的 email',
      };
    }
  });

  addValidationRule('phoneNumber', text => {
    if (/^1[3456789]\d{9}$/.test(text)) {
      return {
        isInvalid: false,
        errorMsg: '',
      };
    } else {
      return {
        isInvalid: true,
        errorMsg: '请输入正确的手机号码',
      };
    }
  });
  const ValidationResultCache: Record<string, ValidationResult> = {};

  return props => {
    const { value, minLength, maxLength, mergeState, componentId, rule } = props;

    const result: ValidationResult = {
      isInvalid: false,
      errorMsg: '',
    };

    if (maxLength !== undefined && value.length > maxLength) {
      result.isInvalid = true;
      result.errorMsg = `最长不能超过${maxLength}个字符`;
    } else if (minLength !== undefined && value.length < minLength) {
      result.isInvalid = true;
      result.errorMsg = `不能少于${minLength}个字符`;
    } else {
      const rulesArr = rule ? rule.split(',') : [];
      for (const ruleName of rulesArr) {
        const validateFunc = rules.get(ruleName);
        if (validateFunc) {
          const { isInvalid, errorMsg } = validateFunc(value);
          if (isInvalid) {
            result.isInvalid = true;
            result.errorMsg = errorMsg;
            break;
          }
        }
      }
    }

    if (!isEqual(result, ValidationResultCache[componentId])) {
      ValidationResultCache[componentId] = result;
      mergeState({
        validResult: result,
      });
    }

    return {
      props: null,
    };
  };
});

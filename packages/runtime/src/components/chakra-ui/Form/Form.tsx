import { useEffect, useMemo, useRef, useState } from 'react';
import { Type, Static } from '@sinclair/typebox';
import { createComponent } from '@meta-ui/core';
import { Button } from '@chakra-ui/react';
import { watch } from '@vue-reactivity/watch';
import { ComponentImplementation } from '../../../modules/registry';
import Slot from '../../_internal/Slot';

const FormImpl: ComponentImplementation<Static<typeof PropsSchema>> = ({
  mergeState,
  subscribeMethods,
  hideSubmit,
  slotsMap,
  callbackMap,
  mModules,
}) => {
  const [invalidArray, setInvalidArray] = useState<boolean[]>([]);
  const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false);
  const formDataRef = useRef<Record<string, any>>({});
  const formControlIds = useMemo<string[]>(() => {
    return (
      slotsMap?.get('content')?.map(slot => {
        return slot.id;
      }) || []
    );
  }, [slotsMap]);

  useEffect(() => {
    setInvalidArray(
      formControlIds.map(fcid => {
        return mModules.stateManager.store[fcid].isInvalid;
      })
    );
  }, []);

  useEffect(() => {
    const disable = invalidArray.some(v => v);
    setIsFormInvalid(disable);
    mergeState({
      disableSubmit: disable,
    });
  }, [invalidArray]);

  useEffect(() => {
    subscribeMethods({
      resetForm() {
        formControlIds.forEach(fcId => {
          const inputId = mModules.stateManager.store[fcId].inputId;
          mModules.apiService.send('uiMethod', {
            componentId: inputId,
            name: 'resetInputValue',
          });
        });
      },
    });
  }, [formControlIds]);

  useEffect(() => {
    const stops: ReturnType<typeof watch>[] = [];
    formControlIds.forEach((fcId, i) => {
      // watch isInvalid
      let stop = watch(
        () => {
          return mModules.stateManager.store[fcId].isInvalid;
        },
        newV => {
          setInvalidArray(oldValidArray => {
            const newValidArray = [...oldValidArray];
            newValidArray[i] = newV;
            return newValidArray;
          });
        }
      );
      stops.push(stop);

      // watch value
      stop = watch(
        () => {
          return mModules.stateManager.store[fcId].value;
        },
        newV => {
          const fcState = mModules.stateManager.store[fcId];
          formDataRef.current[fcState.fieldName] = newV;
          mergeState({ data: { ...formDataRef.current } });
        }
      );
      stops.push(stop);
    });

    return () => {
      stops.forEach(s => {
        s();
      });
    };
  }, [formControlIds]);

  const onSubmit = () => {
    callbackMap?.onSubmit();
  };

  return (
    <form>
      <Slot slotsMap={slotsMap} slot="content" />
      {hideSubmit ? undefined : (
        <Button disabled={isFormInvalid} onClick={onSubmit}>
          提交
        </Button>
      )}
    </form>
  );
};

const PropsSchema = Type.Object({
  hideSubmit: Type.Boolean(),
});

export default {
  ...createComponent({
    version: 'chakra_ui/v1',
    metadata: {
      name: 'form',
      description: 'chakra-ui form',
    },
    spec: {
      properties: PropsSchema,
      acceptTraits: [],
      state: Type.Object({
        data: Type.Any(),
        disableSubmit: Type.Boolean(),
      }),
      methods: [
        {
          name: 'resetForm',
        },
      ],
    },
  }),
  impl: FormImpl,
};

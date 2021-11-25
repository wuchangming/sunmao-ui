import { Application } from '@sunmao-ui/core';
import produce from 'immer';
import { BaseLeafOperation } from '../../type';

export type ModifyComponentIdOperationContext = {
  componentId: string;
  newId: string;
};

export class ModifyComponentIdOperation extends BaseLeafOperation<ModifyComponentIdOperationContext> {
  do(prev: Application): Application {
    return produce(prev, draft => {
      const comp = draft.spec.components.find(c => c.id === this.context.componentId);
      if (!comp) {
        console.warn('component not found');
        return;
      }
      comp.id = this.context.newId;
    });
  }
  redo(prev: Application): Application {
    return produce(prev, draft => {
      const comp = draft.spec.components.find(c => c.id === this.context.componentId);
      if (!comp) {
        console.warn('component not found');
        return;
      }
      comp.id = this.context.newId;
    });
  }
  undo(prev: Application): Application {
    return produce(prev, draft => {
      const comp = draft.spec.components.find(c => c.id === this.context.newId);
      if (!comp) {
        console.warn('component not found');
        return;
      }
      comp.id = this.context.componentId;
    });
  }
}

import React, { useMemo } from 'react';
import { createApplication } from '@meta-ui/core';
import { initStateAndMethod } from './utils/initStateAndMethod';
import { ImplWrapper } from './modules/ImplWrapper';
import { resolveAppComponents } from './modules/resolveAppComponents';
import { AppProps, MetaUIModules } from './types/RuntimeSchema';
import { DebugEvent, DebugStore } from './modules/DebugComponents';

// inject modules to App
export function genApp(mModules: MetaUIModules) {
  return (props: Omit<AppProps, 'mModules'>) => {
    return <App {...props} mModules={mModules} />;
  };
}

export const App: React.FC<AppProps> = props => {
  const {
    options,
    mModules,
    componentWrapper,
    gridCallbacks,
    debugStore = true,
    debugEvent = true,
  } = props;
  const app = createApplication(options);

  initStateAndMethod(mModules.registry, mModules.stateManager, app.spec.components);

  const { topLevelComponents, slotComponentsMap } = useMemo(
    () =>
      resolveAppComponents({
        mModules,
        components: app.spec.components,
        app,
        componentWrapper,
        gridCallbacks,
      }),
    [app]
  );

  return (
    <div className="App">
      {topLevelComponents.map(c => {
        return (
          <ImplWrapper
            key={c.id}
            component={c}
            mModules={mModules}
            slotsMap={slotComponentsMap.get(c.id)}
            targetSlot={null}
            app={app}
            componentWrapper={componentWrapper}
            gridCallbacks={gridCallbacks}
          />
        );
      })}
      {debugStore && <DebugStore stateManager={mModules.stateManager} />}
      {debugEvent && <DebugEvent apiService={mModules.apiService} />}
    </div>
  );
};

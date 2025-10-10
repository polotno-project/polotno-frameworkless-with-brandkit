import React from 'react';
import ReactDOM from 'react-dom/client';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import Workspace from 'polotno/canvas/workspace';
import Toolbar from 'polotno/toolbar/toolbar';
import SidePanel, { DEFAULT_SECTIONS } from 'polotno/side-panel/side-panel';
import { BrandKitSection } from '../components/side-panel/brand-kit/brand-kit-panel';
import ZoomButtons from 'polotno/toolbar/zoom-buttons';
import { DownloadButton } from 'polotno/toolbar/download-button';
import * as config from 'polotno/config';

import { createStore, StoreType } from 'polotno/model/store';

declare global {
  interface Window {
    createPolotnoApp: typeof createPolotnoApp;
    polotnoConfig: typeof config;
  }
}

export const PolotnoApp = ({
  store,
  style,
  sections,
}: {
  store: StoreType;
  style?: any;
  sections?: Array<string>;
}) => {
  let visibleSections = [...DEFAULT_SECTIONS, BrandKitSection];
  if (sections) {
    visibleSections = sections
      .map((name) => {
        const section = DEFAULT_SECTIONS.find((s) => s.name === name);
        if (!section) {
          console.error(`Section ${name} not found`);
        }
        return section;
      })
      .filter((s): s is typeof s & {} => Boolean(s));
  }
  return (
    <PolotnoContainer className="polotno-app-container" style={style}>
      <SidePanelWrap>
        <SidePanel store={store} sections={visibleSections} />
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar
          store={store}
          components={{
            ActionControls: () => {
              return <DownloadButton store={store} />;
            },
          }}
        />
        <Workspace store={store} />
        <ZoomButtons store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
};

export function createPolotnoApp({ container, key, showCredit, sections }): {
  store: StoreType;
  root: ReactDOM.Root;
  destroy: () => void;
} {
  const store = createStore({ key, showCredit }) as any;

  const root = ReactDOM.createRoot(container);

  root.render(<PolotnoApp store={store} sections={sections} />);

  store.addPage();
  store.history.clear();

  return { store, root, destroy: () => root.unmount() };
}

window.createPolotnoApp = createPolotnoApp;
window.polotnoConfig = config;

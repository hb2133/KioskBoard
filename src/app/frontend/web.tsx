import { createRoot } from 'react-dom/client';
import '@fontsource-variable/noto-sans-kr';
import { InstallWebWorkbenchBridge } from '@/core/infra/web/WebWorkbenchBridge';
import { App } from './App';

InstallWebWorkbenchBridge();
document.documentElement.dataset.runtime = 'web';

const RootContainer = document.getElementById('root');

if (RootContainer == null)
{
    throw new Error('Missing #root container for the web frontend.');
}

createRoot(RootContainer).render(
    <App />,
);

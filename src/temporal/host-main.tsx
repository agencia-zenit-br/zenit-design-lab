import React from 'react';
import { createRoot } from 'react-dom/client';
import { PortabilityDemo } from './PortabilityDemo';
import { defaultRegionalSettings } from '../calendarLocale';
import '../styles.css';

/** A completely separate page/root from Design Lab. Temporal shared components
 * mount without .lab, global product navigation, DesignLab state or its services. */
export function StandaloneTemporalHost() {
  return <main className="temporal-standalone" data-standalone-host="true">
    <header className="temporal-standalone__header">
      <h1>Temporal Core · host independiente</h1>
      <p>Dos aplicaciones ilustrativas, un mismo contrato y dos skins.</p>
    </header>
    <PortabilityDemo settings={defaultRegionalSettings}/>
  </main>;
}
const mount=document.getElementById('temporal-root');
if(!mount)throw new Error('Missing independent temporal host root');
createRoot(mount).render(<React.StrictMode><StandaloneTemporalHost/></React.StrictMode>);

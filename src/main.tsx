import React from 'react';
import { createRoot } from 'react-dom/client';
import { DesignLab } from './DesignLab';
import './styles.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><DesignLab /></React.StrictMode>);

import type { Meta, StoryObj } from '@storybook/react';
import { Button, MetricCard, StatusPill } from './components';
import { Icon, type IconName } from './Icon';

const meta = {
  title: 'Zenit/Controles',
  component: Button,
  args: { children: 'Nueva operación' },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', children: 'Ver servicios' } };
export const Compact: Story = { args: { size: 'compact', children: 'Compacto' } };
export const Prominent: Story = { args: { size: 'prominent', children: 'Prominente' } };
export const Disabled: Story = { args: { disabled: true } };

export const Metric = () => <MetricCard label="Servicios activos" value="12" detail="Datos sintéticos" icon="services" />;

export const States = () => <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
  <StatusPill tone="success">Activo</StatusPill>
  <StatusPill tone="warning">En revisión</StatusPill>
  <StatusPill tone="danger">Error</StatusPill>
  <StatusPill>Neutral</StatusPill>
</div>;

const iconNames: IconName[] = ['dashboard','components','editorial','organizations','services','storage','activity','settings','search','bell','user','plus','check','filter','trash','menu'];
export const Icons = () => <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:12}}>
  {iconNames.map(name => <div key={name} style={{display:'flex',alignItems:'center',gap:8,padding:8,border:'1px solid #d8d8d8',borderRadius:8}}>
    <Icon name={name} size={18} /><span style={{fontSize:12}}>{name}</span>
  </div>)}
</div>;

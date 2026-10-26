/**
 * Deck-it — biblioteca de componentes de UI.
 *
 * Todas as telas importam daqui:
 *   import { Screen, AppHeader, GlassCard, Button } from '../components';
 *
 * Regra do projeto: uma tela não define cor, fonte nem sombra por conta
 * própria — ou usa um componente daqui, ou usa os tokens de `../theme`.
 */
export { default as Screen } from './Screen';
export { default as ScreenBackground } from './ScreenBackground';
export { default as AppHeader } from './AppHeader';
export { default as Logo } from './Logo';
export { default as GlassCard } from './GlassCard';
export { default as Button } from './Button';
export { default as IconButton } from './IconButton';
export { default as GemChip } from './GemChip';
export { default as SearchField } from './SearchField';
export { default as Field } from './Field';
export { default as SectionLabel } from './SectionLabel';
export { default as Tag } from './Tag';
export { default as StatBox } from './StatBox';
export { ListGroup, ListRow } from './ListGroup';

// The glossary's English names, for the italic gloss (Prompt AQ §4). Server-side:
// this imports the whole glossary, so client code receives the resulting list from
// the root layout (components/GlossNames.jsx) and never imports this file.
import { GLOSSARY } from '../semantic/glossary.js';
import { englishNamesOf } from './glossItalics.js';

export const GLOSS_NAMES_EN = englishNamesOf(GLOSSARY);

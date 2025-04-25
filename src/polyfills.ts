// Import polyfills
import { Buffer as BufferPolyfill } from 'buffer';
import process from 'process';

// Ensure the Buffer polyfill is available globally
window.Buffer = window.Buffer || BufferPolyfill;

// Ensure process is available globally
window.process = window.process || process;

// Ensure global is available
window.global = window.global || window; 
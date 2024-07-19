import React from 'react';
import ReactDOM from 'react-dom';
import ReadingCompanion from './ReadingCompanion';

console.log('React script started');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
    const rootElement = document.getElementById('root');
    if (rootElement) {
        console.log('About to render React app');
        ReactDOM.render(<ReadingCompanion />, rootElement, () => {
            console.log('React render completed');
        });
    } else {
        console.error('Root element not found');
    }
});
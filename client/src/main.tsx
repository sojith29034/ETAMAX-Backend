import ReactDOM from 'react-dom/client'; // Import the correct method for React 18
import App from './App.tsx';
import './index.css'

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!); // Create the root element
root.render(<App />); // Render your app using createRoot

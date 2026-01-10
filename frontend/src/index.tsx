import ReactDOM from 'react-dom/client'

import App from './components/App'

const rootElement = document.getElementById('app')
if (rootElement == null) {
  throw new Error('Failed to find the root element with id "app". Please check your HTML file.')
}

const root = ReactDOM.createRoot(rootElement)
root.render(<App />)

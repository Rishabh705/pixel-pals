import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
// import { Auth0Provider } from '@auth0/auth0-react';
import { store } from './rtk/store.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <Auth0Provider
      domain="dev-bri8t2dnihpvvxfi.us.auth0.com"
      clientId="if2m1SqIVenJaFqzSzxRbStIIfeFvt7R"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    > */}
      <Provider store={store}>
        <App />
      </Provider>
    {/* </Auth0Provider> */}
  </React.StrictMode>,
)

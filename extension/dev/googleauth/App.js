import logo from './logo.svg';
import './App.css';
import g_login_button from './components/g_login_button';
import g_logout_button from './components/g_logout_button';
import { useEffect } from 'react';
import {gapi} from 'gapi-script';

const clientId = '467769474365-subo3k3h1cbp63u3pec5f4q6etdmtuqq.apps.googleusercontent.com'
function App() {
  useEffect(() => {
    function start(){
      gapi.client.init({
        clientId: clientId,
        scope: ''
      })
    }
    gapi.load('client:auth2', start)
  })

  var accessToken = gapi.auth.getToken().access_token

  return (
    <div className="App">
      <g_login_button />
      <g_logout_button />
    </div>
  );
}

export default App;

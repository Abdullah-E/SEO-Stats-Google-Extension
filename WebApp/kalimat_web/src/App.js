import './App.css';
import {gapi} from 'gapi-script';
import { useEffect } from 'react';
import G_login_button from './components/g_login_button';
import G_logout_button from './components/g_logout_button';

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

    if (gapi.auth ){
      if(gapi.auth.getToken() ){
        var accessToken = gapi.auth.getToken().access_token
        console.log(accessToken)
      }
    }
    // var accessToken = gapi.auth.getToken().access_token
    // console.log("accesToken: ", accessToken)
  })
  // if(gapi.auth.getToken() ){
  //   var accessToken = gapi.auth.getToken().access_token
  //   console.log(accessToken)
  // }else{
  //   console.log("no toekn")
  // }
  
  return (
    <div className="App">
      <G_login_button />
      <G_logout_button />
    </div>
  );
}

export default App;

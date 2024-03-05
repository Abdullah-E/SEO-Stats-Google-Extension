import {GoogleLogin} from 'react-google-login';
import { useCookies } from 'react-cookie';
// import UserContext from '../contexts/UserContext';
const clientId = '467769474365-subo3k3h1cbp63u3pec5f4q6etdmtuqq.apps.googleusercontent.com';
const { sendProfileToServer } = require('../../api/api');

function Login(){

    // const {setUser} = useContext(UserContext);
    const [cookies, setCookie] = useCookies(['user']);
    const onSuccess = (res) => {
        console.log('Login Success: currentUser:', res.profileObj);
        setCookie('user', res.profileObj, { path: '/' })
        console.log("cookies:", cookies)

        sendProfileToServer(res.profileObj)
            .then(response => {
                // Handle response if needed
                console.log('Profile sent successfully:', response);
            })
            .catch(error => {
                // Handle error if needed
                console.error('Failed to send profile to server:', error);
            });
        // setUser(res.profileObj);
        //rfresh the page:
        // window.location.reload();

      };
    
      const onFailure = (res) => {
        console.log('Login failed: res:', res);
        // window.location.reload();
        
      };
    
      return (
        <div id = "g_login_button">
          <GoogleLogin
            clientId={clientId}
            buttonText="Login"
            onSuccess={onSuccess}
            onFailure={onFailure}
            cookiePolicy={'single_host_origin'}
            // style={{ marginTop: '100px' }}
            isSignedIn={true}
          />
        </div>
      );
}

export default Login;
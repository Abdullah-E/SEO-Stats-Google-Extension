import {GoogleLogin} from 'react-google-login';

const clientId = '467769474365-subo3k3h1cbp63u3pec5f4q6etdmtuqq.apps.googleusercontent.com';

function Login(){
    const onSuccess = (res) => {
        console.log('Login Success: currentUser:', res.profileObj);
        // alert(
        //   `Logged in successfully welcome ${res.profileObj.name} 😍. \n See console for full profile object.`
        // );
        this.props.history.push('/');
      };
    
      const onFailure = (res) => {
        console.log('Login failed: res:', res);
        // alert(
        //   `Failed to login. 😢 `
        // );
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
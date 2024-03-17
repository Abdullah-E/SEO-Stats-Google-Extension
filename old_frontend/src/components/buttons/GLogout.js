import {GoogleLogout} from 'react-google-login';
import { useCookies } from 'react-cookie';

const clientId = '467769474365-subo3k3h1cbp63u3pec5f4q6etdmtuqq.apps.googleusercontent.com';

function Logout() {
    const [cookies, setCookie] = useCookies(['user']);
    const onSuccess = () => {
        console.log('Logout made successfully');
        setCookie('user', '', { path: '/' })
        console.log("cookies:", cookies)
        alert('Logout made successfully');
        // window.location.reload();
        
        // this.props.history.push('/');
    };
    
    return (
        <div>
        <GoogleLogout
            clientId={clientId}
            buttonText="Logout"
            onLogoutSuccess={onSuccess}
        ></GoogleLogout>
        </div>
    );
    }
export default Logout;
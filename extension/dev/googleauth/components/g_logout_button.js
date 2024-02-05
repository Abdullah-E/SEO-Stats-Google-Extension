import {GoogleLogout} from 'react-google-login';

const clientId = '467769474365-subo3k3h1cbp63u3pec5f4q6etdmtuqq.apps.googleusercontent.com';

function Logout() {
    const onSuccess = () => {
        alert('Logout made successfully');
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
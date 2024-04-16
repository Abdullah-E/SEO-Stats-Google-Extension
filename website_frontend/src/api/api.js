import { useCookies } from "react-cookie"

const API_URL = 'https://seo-stats-google-extension.onrender.com'
export const googleLoginRequest = async (profileObj) => {
    const endpoint = API_URL + '/login' 

    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileObj),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send profile to server')
        }
        return response.json()
    })
    .catch(error => {
        console.error('Error sending profile to server:', error)
        throw error
    })
}


export const getProfile = async (googleId) => {
    const endpoint = API_URL + '/profile?googleId=' + googleId

    return fetch(endpoint)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch profile from server')
        }
        return response.json()
    })
    .catch(error => {
        console.error('Error fetching profile from server:', error)
        throw error
    })
}

export const OauthRedirect = async () => {
    const endpoint = API_URL + '/oauth-redirect'
    return fetch(endpoint)
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid access token response from server')
        }
        return response.json()
    })
    .catch(error => {
        console.error('Error fetching access token from server:', error)
        throw error
    })
}


// export const accessTokenRequest = async (code) => {
//     const endpoint = API_URL + '/google-callback?code=' + code
//     return fetch(endpoint)
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Invalid access token response from server')
//         }
//         return response
//     })
//     .catch(error => {
//         console.error('Error fetching access token from server:', error)
//         throw error
//     })
// }

export const accessTokenRequest = async (code) => {
    const endpoint = API_URL + '/google-callback?code=' + code
    try {
        const response = await fetch(endpoint)
        if (!response.ok) {
            throw new Error('Invalid access token response from server')
        }
        return response.json()
    } catch (error) {
        console.error('Error fetching access token from server:', error)
        throw error
    }
}

export const useUserCookies = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user'])
    return {
        getUserId: () => cookies.user?.id,
        removeUserId: () => removeCookie('user'),
        getUser: () => cookies.user
    }
}

export const addCredits = async ( g_id, credits) => {
    
    const endpoint = API_URL + '/payment_success?g_id=' + g_id + '&credits=' + credits
    try {
        const response = await fetch(endpoint)
        if (!response.ok) {
            throw new Error('Failed to add credits to user')
        }
        return response.json()
    } catch (error) {
        console.error('Error adding credits to user:', error)
        throw error
    }
}
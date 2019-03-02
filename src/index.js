import './styles/styles.scss';
import { MDCDialog } from '@material/dialog';
import { MDCRipple } from '@material/ripple';

const config = {
    apiKey: "AIzaSyANF1XOiUF4ENLMwfj4kWKEe6mSBODmP-4",
    authDomain: "devfest-pardubice-2019.firebaseapp.com",
    databaseURL: "https://devfest-pardubice-2019.firebaseio.com",
    projectId: "devfest-pardubice-2019",
    storageBucket: "devfest-pardubice-2019.appspot.com",
    messagingSenderId: "925473744270"
};

firebase.initializeApp(config);
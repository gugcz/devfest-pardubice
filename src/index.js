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

const db = firebase.firestore();

const selector = '.mdc-card__primary-action, .button, .mdc-card__primary-action';
const ripples = [].map.call(document.querySelectorAll(selector), el => new MDCRipple(el));
const speakers = {};
const talks = {};

fetchSpeakersAndTalks();

function openDialog(id, isTalk) {
    const dialog = new MDCDialog(document.querySelector('.mdc-dialog'));
    dialog.listen('MDCDialog:opened', () => {
        const speaker = speakers[id];
        const name = document.getElementById('dialog-speaker-name');
        const position = document.getElementById('dialog-speaker-position');
        const companyLogo = document.getElementById('dialog-speaker-company');
        const photo = document.getElementById('dialog-speaker-photo');
        const about = document.getElementById('dialog-speaker-text-about');
        const talkContainer = document.getElementById('talk-container');
        const speakerInfoContainer = document.getElementById('speaker-info');
        const talkSpeakerContainer = document.getElementById('talk-speakers-container');
        const coSpeakerText = document.getElementById('co-speaker-text');

        if (isTalk) {
            speakerInfoContainer.style.display = 'none';
            coSpeakerText.style.display = 'none';
            talkSpeakerContainer.innerHTML = speaker.talk.speakers.map(it => 
            `<div class="speaker-container">
                <img class="speaker-photo" src="${it.photoUrl}" alt="${it.name}">
                <div class="speaker-text">
                    <h3 class="name mdc-typography--headline3">${it.name}</h3>
                    ${it.position && !it.company && `<h4 class="position mdc-typography--headline4">${it.position}</h4>` || ''}
                    ${it.position && it.company && `<h4 class="position mdc-typography--headline4">${it.position}, ${it.company}</h4>` || ''}
                </div>
            </div>`).join('');
        } else {
            speakerInfoContainer.style.display = 'grid';
            const coSpeakers = talks[speaker.talk.id].filter(it => it.name !== speaker.name);
            if (coSpeakers.length > 0) {
                coSpeakerText.style.display = 'inline';
            } else {
                coSpeakerText.style.display = 'none';
            }
            talkSpeakerContainer.innerHTML = coSpeakers.map(it => 
                `<div class="speaker-container">
                    <img class="speaker-photo" src="${it.photoUrl}" alt="${it.name}">
                    <div class="speaker-text">
                        <h3 class="name mdc-typography--headline3">${it.name}</h3>
                        ${it.position && !it.company && `<h4 class="position mdc-typography--headline4">${it.position}</h4>` || ''}
                        ${it.position && it.company && `<h4 class="position mdc-typography--headline4">${it.position}, ${it.company}</h4>` || ''}
                    </div>
                </div>`).join('');
            name.innerText = speaker.name;
            position.innerHTML = speaker.position + (speaker.company ? ', ' + speaker.company : '');
            photo.src = speaker.photoUrl;
            if (speaker.companyLogo) {
                companyLogo.style.display = 'block';
                companyLogo.src = speaker.companyLogo;
            } else {
                companyLogo.style.display = 'none';
            }
            about.innerText = speaker.about;
        }

        if (!speaker.talk.empty) {
            talkContainer.style.display = 'block';
            const talkTitle = document.getElementById('dialog-talk-title');
            const talkLevel = document.getElementById('dialog-talk-level');
            const talkIntro = document.getElementById('dialog-talk-intro');
            const topicsContainer = document.getElementById('dialog-talk-topics-container');
            topicsContainer.innerHTML = '';

            talkTitle.innerText = speaker.talk.title;

            if (speaker.talk.level) {
                talkLevel.style.display = 'block';
                talkLevel.innerText = speaker.talk.level + " / " + speaker.talk.language;
            } else if (speaker.talk.language) {
                talkLevel.style.display = 'block';
                talkLevel.innerText = speaker.talk.language;
            } else {
                talkLevel.style.display = 'none';
            }

            if (speaker.talk.intro) {
                talkIntro.style.display = 'block';
                talkIntro.innerHTML = speaker.talk.intro;
            } else {
                talkIntro.style.display = 'none';
            }

            if (speaker.talk.topics) {
                topicsContainer.style.display = 'flex';
                speaker.talk.topics
                    .map(topic =>
                        `<div class="topic">
                            <div class="topic-dot" style="background-color: ${topic.color}"></div>
                            <div class="topic-name mdc-typography--body1">${topic.text}</div>
                        </div>`)
                    .forEach(topicHTML => topicsContainer.innerHTML += topicHTML);
            } else {
                topicsContainer.style.display = 'none';
            }
        } else {
            talkContainer.style.display = 'none';
        }
    });

    dialog.listen('MDCDialog:closed', () => {
        const name = document.getElementById('dialog-speaker-name');
        const position = document.getElementById('dialog-speaker-position');
        const companyLogo = document.getElementById('dialog-speaker-company');
        const photo = document.getElementById('dialog-speaker-photo');
        const about = document.getElementById('dialog-speaker-text-about');
        const talkTitle = document.getElementById('dialog-talk-title');
        const talkLevel = document.getElementById('dialog-talk-level');
        const talkIntro = document.getElementById('dialog-talk-intro');

        name.innerText = '';
        position.innerText = '';
        photo.src = '';
        companyLogo.src = '';
        companyLogo.style.display = 'none';
        about.innerText = '';
        talkTitle.innerHTML = '';
        talkLevel.innerHTML = '';
        talkIntro.innerHTML = '';
    });
    dialog.open();
}

function speakerToDiv(data, doc) {
    const div = document.createElement('div');
    div.className = 'mdc-card mdc-card--outlined speaker mdc-card__primary-action mdc-ripple-upgraded speaker-' + data.order;
    div.onclick = () => openDialog(doc.id);
    div.innerHTML = `
            <img class="speaker-photo" src="${data.photoUrl}" alt="${data.name}">
            <h2 class="speaker-name mdc-typography--headline2">${data.name}</h2>
            ${data.position && !data.company && `<h3 class="speaker-position mdc-typography--headline3">${data.position}</h3>` || ''}
            ${data.position && data.company && `<h3 class="speaker-position mdc-typography--headline3">${data.position}, ${data.company}</h3>` || ''}
            ${!data.position && data.company && `<h3 class="speaker-position mdc-typography--headline3">${data.company}</h3>` || ''}
            ${data.companyLogo && data.company && `<img class="speaker-company" src="${data.companyLogo}" alt="${data.company}">` || ''}
            ${!data.companyLogo && `<div class="speaker-company"></div>` || ''}
        `;
    return div;
}

function talkToDiv(talk) {
    const div = document.createElement('div');
    div.className = 'mdc-card mdc-card--outlined mdc-card__primary-action mdc-ripple-upgraded talk ' + (talk.full ? 'full ' : ('column-' + talk.column + ' ')) + 'row-' + talk.row + ' mobile-row-' + talk.mobileRow + (talk.rowSpan ? ' row-end-' + (talk.row + talk.rowSpan) : '');
    div.onclick = () => openDialog(talk.speakers[0].id, true);
    div.innerHTML = `
            <h2 class="talk-name mdc-typography--headline2">${talk.title}</h2>
            <div class="topics-container">
            ${talk.topics.map(topic =>
                `<div class="topic">
                        <div class="topic-dot" style="background-color: ${topic.color}"></div>
                        <p class="topic-name mdc-typography--body1">${topic.text}</p>
                    </div>`
            ).join('')}
            </div>
            <div class="mobile-description">
            <p class="mobile-description-text mdc-typography--body1">${talk.time} / ${talk.room}</p>
            </div>
            <div class="description">
            <p class="description-text mdc-typography--body1">${talk.level} / ${talk.language} / ${talk.length}</p>
            </div>
            <div class="speakers-container speakers-container-${talk.speakers.length}">
                ${talk.speakers.map(speaker =>
                    `<div class="speaker-container">
                        <img class="speaker-photo" src="${speaker.photoUrl}" alt="${speaker.name}">
                        <div class="speaker-text">
                            <h3 class="name mdc-typography--headline3">${speaker.name}</h3>
                            ${speaker.position && !speaker.company && `<h4 class="position mdc-typography--headline4">${speaker.position}</h4>` || ''}
                            ${speaker.position && speaker.company && `<h4 class="position mdc-typography--headline4">${speaker.position}, ${speaker.company}</h4>` || ''}
                        </div>
                    </div>`).join('')}
            </div>
        `;
    return div;
}

function updateTalks() {
    const talksContainer = document.getElementById('talks-container');
    Array.from(document.getElementsByClassName('talk')).forEach(it => {
        if (it) {
            talksContainer.removeChild(it);
        }
    });
    const talks = {};
    Object.values(speakers).forEach(speaker => {
        const talk = speaker.talk;
        if (talks[talk.id]) {
            talks[talk.id].speakers.push(speaker);
        } else {
            talks[talk.id] = talk;
            talks[talk.id].speakers = [speaker];
        }
    });
    Object.values(talks).map(talkToDiv).forEach(it => talksContainer.appendChild(it));
}

function fetchSpeakersAndTalks() {
    const speakersContainer = document.getElementById('speakers-container');
    db.collection('speakers').orderBy('order')
        .get()
        .then(querySnapshot => querySnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            data.talkRef.get().then(talk => {
                if (talks[talk.id]) {
                    talks[talk.id].push(data);
                } else {
                    talks[talk.id] = [data];
                }
                data.talk = talk.data();
                data.talk.id = talk.id;
                speakers[doc.id] = data;
                data.talk.mobileRow = (data.talk.row - 2) * 2 + data.talk.column + 1;
                speakersContainer.appendChild(speakerToDiv(data, doc));
                if (!talk.empty) {
                    updateTalks();
                }
            }).catch(error => console.log("Error getting documents: ", error));
        }))
        .catch(error => console.log("Error getting documents: ", error));
}

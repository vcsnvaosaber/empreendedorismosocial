// app.js
const firebaseConfig = {

  apiKey: "AIzaSyChz2-DAuLALfIzdFmCAQ4NfkZ1cP7rmDQ",

  authDomain: "useful-monitor-366213.firebaseapp.com",

  projectId: "useful-monitor-366213",

  storageBucket: "useful-monitor-366213.appspot.com",

  messagingSenderId: "943527819480",

  appId: "1:943527819480:web:560d279b7fc58f38637fad",

  measurementId: "G-XZT3KYLDKV"

};

firebase.initializeApp(firebaseConfig);

const ui = new firebaseui.auth.AuthUI(firebase.auth());

ui.start('#firebaseui-auth-container', {
	signInOptions: [
		firebase.auth.EmailAuthProvider.PROVIDER_ID
	],
	signInSuccessUrl: '/dashboard.html',
});

firebase.auth().onAuthStateChanged(function(user) {
console.log('onAuthStateChanged', user);
  const loader = document.getElementById('loader');
  if (user) {
    loader.style.display = 'none';
    initApp();
  } else {
    loader.style.display = 'block';
  }
});

function initApp() {
	const db = firebase.firestore();

	const needsForm = document.getElementById('needs-form');
	needsForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const title = needsForm.title.value;
		const description = needsForm.description.value;
		const category = needsForm.category.value;
		const file = needsForm.file.files[0];
		if (!title || !description || !category) {
			return;
		}
		let fileUrl = '';
		if (file) {
			const storageRef = firebase.storage().ref();
			const fileRef = storageRef.child(file.name);
			fileRef.put(file).then((snapshot) => {
				return fileRef.getDownloadURL();
			}).then((url) => {
				fileUrl = url;
				return db.collection('needs').add({
					title,
					description,
					category,
					fileUrl,
					userId: firebase.auth().currentUser.uid,
					timestamp: firebase.firestore.FieldValue.serverTimestamp()
				});
			}).then(() => {
				needsForm.reset();
			}).catch((error) => {
				console.error(error);
			});
		} else {
			db.collection('needs').add({
				title,
				description,
				category,
				userId: firebase.auth().currentUser.uid,
				timestamp: firebase.firestore.FieldValue.serverTimestamp()
			}).then(() => {
				needsForm.reset();
			}).catch((error) => {
				console.error(error);
			});
		}
	});

	const needsList = document.getElementById('needs-list');
	db.collection('needs').orderBy('timestamp', 'desc').onSnapshot((querySnapshot) => {
		needsList.innerHTML = '';
		querySnapshot.forEach((doc) => {
			const need = doc.data();
			const needItem = document.createElement('div');
			needItem.innerHTML = `
				<h2>${need.title}</h2>
				<p>${need.description}</p>
				<p><strong>Categoria:</strong> ${need.category}</p>
			`;
			if (need.fileUrl) {
				const needFile = document.createElement('a');
				needFile.href = need.fileUrl;
				needFile.target = '_blank';
				needFile.innerText = 'Baixar arquivo';
				needItem.appendChild(needFile);
			}
			const helpButton = document.createElement('button');
			helpButton.innerText = 'Quero Ajudar!';
			helpButton.addEventListener('click', () => {
				db.collection('helps').add({
					needId: doc.id,
					userId: firebase.auth().currentUser.uid,
					timestamp: firebase.firestore.FieldValue.serverTimestamp()
				});
			});
			needItem.appendChild(helpButton);
			needsList.appendChild;
                        });
                        const helpsList = document.getElementById('helps-list');
                        db.collection('helps').orderBy('timestamp', 'desc').onSnapshot((querySnapshot) => {
                        helpsList.innerHTML = '';
                        querySnapshot.forEach((doc) => {
                        const help = doc.data();
                        const helpItem = document.createElement('div');
                        const needRef = db.collection('needs').doc(help.needId);
                        needRef.get().then((needDoc) => {
                        if (needDoc.exists) {
                        const need = needDoc.data();
                        helpItem.innerHTML = `
                       <h2>${need.title}</h2>
                       <p>${need.description}</p>
                       <p><strong>Categoria:</strong> ${need.category}</p>
                       <p><strong>Ajudado por:</strong> ${help.userId}</p>
                `;
                helpsList.appendChild(helpItem);
            }
        }).catch((error) => {
            console.error(error);
        });
    });
});


// authentication protection

function checkAuthState() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("User is signed in.");
    } else {
      location.href = "/landing";
    }
  });
}

function LogoutUser() {
  console.log("Logout Btn Call");
  firebase
    .auth()
    .signOut()
    .then(() => {
      location.href = "/landing";
    })
    .catch((e) => {
      console.log(e);
    });
}
checkAuthState();

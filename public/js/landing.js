const loginBtn = document.querySelector("#login-btn");

const goHome = () => (document.location.href = "/home");

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    loginBtn.innerHTML = "Home Page";
    loginBtn.removeEventListener("click", GoogleLogin, false);
    loginBtn.addEventListener("click", goHome, false);
  } else {
    loginBtn.innerHTML = "Login with Google";
    loginBtn.removeEventListener("click", goHome, false);
    loginBtn.addEventListener("click", GoogleLogin, false);
  }
});
async function SendFeedback() {
  let obj = {};

  // get values of all inputs
  userEmail = document.getElementById("user-email").value;
  userName = document.getElementById("user-name").value;
  userMessage = document.getElementById("user-query").value;

  // add them to req body object
  obj["email"] = userEmail;
  obj["name"] = userName;
  obj["message"] = userMessage;

  console.log(obj);

  let res = await fetch(`${window.location.origin}/feedback`, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "content-type": "application/json",
    },
  });
  
  // parse the response as JSON
  let data = await res.json();
  
  console.log(data);
}
let token;

function userLogIn(username, password) {

  let data = {
		"username": `${username}`,
		"password": `${password}`
  };

  url = '/api/auth/login'
  userUrl = `/api/users/username/${username}`

  return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + token
      },
      body: JSON.stringify(data)
  })
  .then(handleErrors)
  .catch(error => displayError(`Username or password is incorrect.`))
  .then(response => response.json())
  .then(function(token) {
    localStorage.setItem('token', token.authToken);
    console.log(`here is the token ${JSON.stringify(token)}`)

    return fetch(userUrl, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + token.authToken
        }
    })
    .then(response => response.json())
    .then(function(userObject) {
      console.log('logging user object info...')
      console.log(userObject)
      console.log(`User id: ${userObject._id}`)
      localStorage.setItem('userId', userObject._id);
      localStorage.setItem('isNewUser', false);
      localStorage.setItem('loggedIn', data.username);
      console.log(data.username)
      window.location.replace(`/dashboard/username/${data.username}`);
    })
  })
};
function signUpUser(fname, lname, username, password) {

  let data = {
    "firstName": `${fname}`,
    "lastName": `${lname}`,
		"username": `${username}`,
		"password": `${password}`
  };

  url = '/api/users/signup'
  authUrl = '/api/auth/login'
  userUrl = `/api/users/username/${username}`

  //request to create a new user
  return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(userObject => {
    console.log(userObject)
    if(userObject.code === 422) {
      return displayError(userObject.message)
    }
    userLogIn(data.username, data.password);
    localStorage.setItem('userId', userObject.id);
    localStorage.setItem('isNewUser', true);
    localStorage.setItem('loggedIn', data.username);
    window.location.replace(`/dashboard/username/${data.username}`);
  })
};

function getDashboard(token) {
  $.ajax({
    url: "http://localhost:8080/dashboard",
    dataType: 'json',
    type: "GET",
    success: function(data, status) {
      return console.log("The returned data", data);
    },
    beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + token ); } //set tokenString before send
  });
}

function watchSubmit() {

  $('.js-search-form').submit(event => {
    event.preventDefault();

    // $('#landing-page').hide();

    const queryUsername = $(event.currentTarget).find('#username');
    const queryPassword = $(event.currentTarget).find('#user-password');
    const queryFirstName = $(event.currentTarget).find('#user-first-name');
    const queryLastName = $(event.currentTarget).find('#user-last-name');

    username = queryUsername.val();
    password = queryPassword.val();

    firstname = queryFirstName.val();
    lastname = queryLastName.val();

    // clear out the input
    // queryUsername.val("");
    // queryPassword.val("");

    if($('.login-button').length > 0) {
      userLogIn(username, password);
    } else {
      signUpUser(firstname, lastname, username, password);
    }
  });
}

function handleUserAppRequest() {
  showSignUp();
  showLogIn();
}

function showSignUp() {
  $('#signup-button').on('click', event=> {
    console.log('clicked sign up button')
    event.preventDefault();
    // window.location.replace("/signup");
    $("footer").html(`<p>Got an account? <a href="#" id="login-button">Sign In!</a></p>`)
    $('fieldset').html(renderSignup());
  })
}

function showLogIn() {
  $('#login-button').on('click', event=> {
    console.log('clicked sign in button')
    event.preventDefault();
    // window.location.replace("/login");
    $("footer").html(`<p>Don't have an account? <a href="#" id="signup-button">Sign up!</a></p>`)
    $('fieldset').html(renderLogin());
  })
}


function renderSignup() {
  return `
  <legend style="display:none">Sign Up</legend>
  <h1>Sign Up</h1>
  <input type="text" placeholder="first name" value name="first-name" id="user-first-name" required/>
  <input type="text" placeholder="last name" value name="last-name" id="user-last-name" required/>
  <input type="text" placeholder="username" value name="username" id="username" required/>
  <input type="password" placeholder="password" value name="password" id="user-password" required/>
  <button class="signup-button" type="submit">Sign Up</button>`
}

function renderLogin() {
  return `
  <legend style="display:none">Log In</legend>
  <h1>Log In</h1>
  <input type="text" placeholder="username" value name="username" id="username" required/>
  <input type="password" placeholder="password" value name="password" id="user-password" required/>
  <button class="login-button" type="submit">Log In</button>
  `
}

function displayError(msg) {
  $('#warning-message').html(msg);
  var x = document.getElementById("warning-message");
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function handleErrors(response) {
    if (!response.ok) throw Error(response.status);
    return response;
}

function handleLogin() {
  watchSubmit();
  getDashboard();
  showLogIn();
  showSignUp();
  // handleUserAppRequest();
  // showLogIn();
  // getUserId();
}

$(handleLogin);

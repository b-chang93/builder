let token;

function userLogIn(username, password) {

  // $('.login-button').on('click', event => {
    let data = {
  		"username": `${username}`,
  		"password": `${password}`
    };

    api.create('/api/auth/login', data)
      .then(_token => {
        let token = _token;
        localStorage.setItem('token', token.authToken);
        return api.details(`/api/users/username/${username}`)
        .then(user => {
          localStorage.setItem('userId', user._id);
          localStorage.setItem('isNewUser', false);
          localStorage.setItem('loggedIn', user.username);
          window.location.replace(`/dashboard/username/${user.username}`)
        })
      })
      .catch(error => {
        displayError(`Username or password is incorrect.`)
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

  api.create('/api/users/signup', data)
    .then(_user => {
      let user = _user;
      console.log(user)
      if(user.code === 422) {
        return displayError(user.message)
      }
      localStorage.setItem('isNewUser', true);
      userLogIn(data.username, data.password);
    })
    // .then(handleErrors)
    // .catch(error => displayError(`Username or password is incorrect.`));
};

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

function demoUsername() {
    $('.demo').on('click', event => {
      var txt = "brandon.chang";
      var timeOut;
      var txtLen = txt.length;
      var char = 0;
      var tb = $("#username").attr("value", "|");
      (function typeIt() {
          var humanize = Math.round(Math.random() * (200 - 30)) + 30;
          timeOut = setTimeout(function () {
              char++;
              var type = txt.substring(0, char);
              tb.attr("value", type + '|');
              typeIt();

              if (char == txtLen) {
                  tb.attr("value", tb.attr("value").slice(0, -1))
                  clearTimeout(timeOut);
              }

          }, humanize);
      }());

      demoPwd();
    })
}

function demoPwd() {
  var txt = "password123";
  var timeOut;
  var txtLen = txt.length;
  var char = 0;
  var tb = $("#user-password").attr("value", "|");
  (function typeIt() {
      var humanize = Math.round(Math.random() * (200 - 30)) + 30;
      timeOut = setTimeout(function () {
          char++;
          var type = txt.substring(0, char);
          tb.attr("value", type + '|');
          typeIt();

          if (char == txtLen) {
              tb.attr("value", tb.attr("value").slice(0, -1))
              clearTimeout(timeOut);
          }

      }, humanize);
  }());
  setTimeout(function(){
    userLogIn("brandon.chang", "password123")
  },2000);
}

function watchSubmit() {

  $('.js-search-form').submit(event => {
    event.preventDefault();

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

function handleLoginSubmit() {
  $(".js-login-form").on("submit", event => {
    event.preventDefault();

    const loginForm = $(event.currentTarget);
    const loginUser = {
      username: loginForm.find(".js-username-entry").val(),
      password: loginForm.find(".js-password-entry").val()
    };

    api.create("/api/login", loginUser)
      .then(response => {
        store.authToken = response.authToken;
        store.authorized = true;
        loginForm[0].reset();

        return Promise.all([
          api.search("/api/notes"),
          api.search("/api/folders"),
          api.search("/api/tags")
        ]);
      })
      .then(([notes, folders, tags]) => {
        store.notes = notes;
        store.folders = folders;
        store.tags = tags;
        render();
      })
      .catch(handleErrors);
  });
}


function handleUser() {
  watchSubmit();
  showLogIn();
  showSignUp();
  demoUsername();
}

$(handleUser);

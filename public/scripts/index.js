let token;

function userLogIn(username, password) {

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
      if(user.code === 422) {
        return displayError(user.message)
      }
      localStorage.setItem('isNewUser', true);
      userLogIn(data.username, data.password);
    })
};

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
    $('fieldset').on('click', '.demo', event => {
      var txt = "brandon.chang";
      var timeOut;
      var txtLen = txt.length;
      var char = 0;
      var tb = $(".username").attr("value", "|");
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
  var tb = $(".user-password").attr("value", "|");
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

function submitLogin() {

  $('.login-form').submit(event => {
    event.preventDefault();

    const queryUsername = $(event.currentTarget).find('.username');
    const queryPassword = $(event.currentTarget).find('.user-password');

    username = queryUsername.val();
    password = queryPassword.val();

    userLogIn(username, password);

  });
}

function submitSignup() {

  $('.signup-form').submit(event => {
    event.preventDefault();

    const queryUsername = $(event.currentTarget).find('.signup-username');
    const queryPassword = $(event.currentTarget).find('.signup-user-password');
    const queryFirstName = $(event.currentTarget).find('.user-first-name');
    const queryLastName = $(event.currentTarget).find('.user-last-name');

    username = queryUsername.val();
    password = queryPassword.val();
    firstname = queryFirstName.val();
    lastname = queryLastName.val();

    signUpUser(firstname, lastname, username, password);
  });
}


function handleUser() {
  submitLogin();
  submitSignup();
  demoUsername();
}

$(handleUser);

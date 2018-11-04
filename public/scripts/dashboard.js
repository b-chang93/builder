let postTitle, workoutInfo, focusPostTitle, focusPostContent, avatar, currentUsername;
let currentUser = localStorage.getItem('userId');
let loginToken = localStorage.getItem('token');
let isNewUser = localStorage.getItem('isNewUser');
let userLoggedIn = localStorage.getItem('loggedIn');

function getToken() {
  if(!loginToken) {
    console.error(401);
    window.location.replace('/login');
  } else {
    authToken = loginToken
    api.create('/api/auth/refresh')
    .then(access => {
      token = access.authToken;
      return token;
    })
  }
}

function createPost(title, content, workoutId, callback) {
  let data = {
    "title": title,
    "content": content,
    "workout": workoutId
  }

  api.create('/api/posts/', data)
  .then(post => {
    renderNewPosts(post, avatar);
  })
}

function handlePostCreation(workoutId) {
  const targetTitle = $('.post-title')
  const targetPostContent = $('.post-content')
  $('.create-post').attr("disabled", "true");

  targetTitle.blur(function() {
    targetPostContent.blur(function() {
      if(targetTitle.val() != "" && targetPostContent.val() != "") {
        $('.create-post').removeAttr("disabled");
      } else {
        $('.create-post').attr("disabled", "true");
      }
    })
  })

  $('.create-post').on('click', event => {
    postTitle = targetTitle.val();
    postContent = targetPostContent.val();

    //clear inputs
    targetTitle.val('');
    targetPostContent.val('');

    createPost(postTitle, postContent, workoutId, renderPosts);

    //close modal after creating a post
    $('#myModal').hide();
  })
}

function createPostAndWorkout(workoutId) {
  const targetTitle = $('.workout-modal-title')
  const targetPostContent = $('.workout-post-content')
  $('.workout-create-post').attr("disabled", "true");

  targetTitle.blur(function() {
    targetPostContent.blur(function() {
      if(targetTitle.val() != "" && targetPostContent.val() != "") {
        $('.create-post').removeAttr("disabled");
      } else {
        $('.create-post').attr("disabled", "true");
      }
    })
  })

  $('.workout-create-post').on('click', event => {

    postTitle = targetTitle.val();
    postContent = targetPostContent.val();

    //clear inputs
    targetTitle.val('');
    targetPostContent.val('');

    createPost(postTitle, postContent, workoutId, renderPosts);

    //close modal after creating a post
    $('#myModal').hide();
  })
}

function deletePosts() {
  $('.main-index').on('click', '.delete', event => {
    let target = $(event.currentTarget).parent('.feed-index-item').attr('data-id');
    $(event.currentTarget).parent('.feed-index-item').remove();

    api.remove(`/api/posts/${target}`)
      .then(() => {
        notifyUserMsg('Successfully deleted post')
      });
  })
}

function loggedInUserInfo() {
  api.details(`/api/users/username/${currentUsername}`)
    .then(user => {
      renderUserProfile(user);
    })
}

function renderUserProfile(user) {
  $('.profile').html(`
    <div class="user-profile-info">
      <section id="profile-user-thumbnail">
        <img id="profile-my-avatar" src="${user.avatar}" alt="user-avatar">
        <p class="name" value="${user.username}">${user.firstName} ${user.lastName}</p>
        <input type="text" class="user-first-name" value="${user.firstName}" name="first name" placeholder="${user.firstName}" aria-labelledby="first name" required>
        <input type="text" class="user-last-name" value="${user.lastName}" name="last name" placeholder="${user.lastName}" aria-labelledby="first last" required>
        <input type="text" class="user-avatar" value name="avatar" placeholder="url-to-your-img" aria-labelledby="user avatar" required>
        <button id="edit">Edit</button>
      </section>
     </div>
  `)
}

function showEditProfileOptions() {
  $('.profile').on('click', '#edit', event => {
    let fname = $('.user-first-name');
    let lname = $('.user-last-name');
    let avatar = $('.user-avatar');

    let userData = {
      firstName: fname.val(),
      lastName: lname.val(),
      avatar: avatar.val()
    }

    if(fname.val() === '' || lname.val() === '' || avatar.val() === '') {
      let msg = 'Missing input field. Please Fill before continuing';
      notifyUserMsg(msg);
    } else {
      api.update(`/api/users/${currentUser}`, userData)
        .then(() => {
          location.reload();
        })
    }
  });
}

function displayUserDashboard(username) {
  currentUsername = window.location.href.split('/').pop()
  url = `/api/users/username/${currentUsername}`

  api.details(`/api/users/username/${currentUsername}`)
    .then(user => {
    })

  if(username) {
    url = `/api/users/username/${username}`
    window.location.replace(`/dashboard/username/${username}`);
  } else if(currentUsername === "" || currentUsername === undefined) {
    window.location.replace(`/dashboard/username/${userLoggedIn}`);
  } else {
    url = `/api/users/username/${currentUsername}`.replace(/\/$/, "")
  }


  return fetch(url, {
    method: "GET",
    mode: "cors",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + loginToken
    }
  })
  .then(function(response) {
    if(response.status === 200) {
      return response.json();
    } else {
      window.location.replace(`/dashboard/username/${userLoggedIn}`);
    }
  })
  .then(function(user) {
    const amFollowing = user.followers.indexOf(currentUser)
    avatar = user.avatar;
    displaySubscribedToUser(user, avatar, amFollowing);
    let posts = user.posts;
    fetchUserPosts(posts);
  })
}

function displaySubscribedToUser(user, avatar, amFollowing) {
  if(amFollowing > -1) {
      $('.feed-identity').html(
        `<section id="user-thumbnail">
          <img id="my-avatar" src="${avatar}" alt="user-avatar" />
          <p class="name" value="${user.username}">${user.firstName} ${user.lastName}</p>
          <button id="unsubscribe">unsubscribe</button>
        </section>`
      )
  } else {
    $('.feed-identity').html(
      `<section id="user-thumbnail">
        <img id="my-avatar" src="${avatar}" alt="user-avatar" />
        <p class="name" value="${user.username}">${user.firstName} ${user.lastName}</p>
        <button id="subscribe">follow</button>
      </section>`
    )
  }
}

function fetchUserPosts(posts) {

  let post = posts.map(post => {
  let url = `/api/posts/${post}`;

    api.details(`/api/posts/${post}`)
      .then(singlePost => {
        let sub = false;
        displayPosts(singlePost, sub);
      })
  })
}

function displayPosts(data, sub) {
  const results = renderPosts(data, sub);
  $('.main-index').append(results);
}

function renderNewPosts(post) {
  let date = post.created.slice(0,10).replace(/-/g,'/');
  $('.main-index').append(`
      <li class="feed-index-item" data-id="${post._id}">
        <section class="content">
          <section class="thumbnail-for-post">
            <img class="avatar-related-to-post" src="${avatar}" alt="user-avatar">
            <h1 class="post-title">${post.title}</h1>
            <p class="date">${date}</p>
          </section>
          <p class="post-text">${post.content}</p>
        </section>
        <button class="delete">Delete</button>
      </li>`)
}

function renderPosts(post, sub) {
  let date = post.created.slice(0,10).replace(/-/g,'/');
  if(sub) {
    return `
      <li class="feed-index-item" data-id="${post._id}">
        <section class="content">
          <section class="thumbnail-for-post">
            <img class="avatar-related-to-post" src="${post.creator.avatar}" alt="user-avatar">
            <h1 class="post-title">${post.title}</h1>
            <p class="date">${date}</p>
          </section>
          <p class="post-text">${post.content}</p>
        </section>
      </li>`
  } else {
    return `
      <li class="feed-index-item" data-id="${post._id}">
        <section class="content">
          <section class="thumbnail-for-post">
            <img class="avatar-related-to-post" src="${post.creator.avatar}" alt="user-avatar">
            <h1 class="post-title">${post.title}</h1>
            <p class="date">${date}</p>
          </section>
          <p class="post-text">${post.content}</p>
        </section>
        <button class="delete">Delete</button>
      </li>`
  }
}

function notifyUserMsg(msg) {
  $('#warning-message').html(msg);
  var x = document.getElementById("warning-message");
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function handleSubscribeToUser() {
  $('body').on('click', '#subscribe', event => {

    let data = {
      "followers": currentUser
    }

    if (userLoggedIn === currentUsername) {
      let msg = 'You cannot subscribe to yourself'
      notifyUserMsg(msg)
      $("#subscribe").attr('disabled', true);
    } else {
      api.update(`/api/users/subscribe/${currentUsername}`, data)
      .then(user => {
        let msg = `Successfully subscribed to ${currentUsername}`
        notifyUserMsg(msg)
        $("#subscribe").attr('id', "unsubscribe").html('unsubscribe')
      });
    }
  })

  $('body').on('click', '#unsubscribe', event => {
    api.update(`/api/users/unsubscribe/${currentUsername}`)
      .then(user => {
        let msg = `Successfully unsubscribed from ${currentUsername}`
        notifyUserMsg(msg)
        $("#unsubscribe").attr('id', "subscribe").html('subscribe')
      })
  })
}

function displaySubscribedPosts() {
  api.details(`/api/users/subscribedTo/${currentUser}`)
    .then(users => {
      users.following.map(user => {
          api.details(`/api/users/subscribedTo/${user}`)
            .then(followingUser => {
              followingUser.posts.map(post => {
                url = `/api/posts/${post}`;

                api.details(`/api/posts/${post}`)
                  .then(posts => {
                    const results = []
                    results.push(posts)
                    let sub = true;
                    results.map(post => displayPosts(post, sub))
                  })
            })
        })
    })
  })
}
function findMySchedule() {
  api.details(`/workoutsplit`)
    .then(schedule => {
      displayMySplit(schedule)
    })
}

function displayMySplit(data) {
 var d = new Date();
 var n = d.getDay();

 const map = {
     1: 'Monday',
     2: 'Tuesday',
     3: 'Wednesday',
     4: 'Thursday',
     5: 'Friday',
     6: 'Saturday',
     7: 'Sunday'
 }

 $(`.reveal-split > span[value="${map[n]}"]`).parent().css("background", "#003366")

 const userSchedules = data.filter(routine => routine.creator === currentUser)
 let schedule = userSchedules[0]
 let daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

 if(userSchedules.length < 1) {
   return;
 } else {
   for(let i = 0; i < daysOfWeek.length; i++) {
     let day = $(`.reveal-split > span[value="${daysOfWeek[i]}"]`)
     day.text(schedule[daysOfWeek[i]])
   }
 }

 $('.reveal-split').on('click', event => {
   let split = $(event.currentTarget).find('span').text()
 })
}

function renderExercise(exercise) {
  return `<img src="${exercise.svg[0]}"/>`
}

function searchExercises() {
  $('.search-for-exercise').on('submit', event => {
    event.preventDefault();
    let targetSearch = $('.exercise-search-query')
    let search = targetSearch.val();
    findExercises(search);
  })
}

function findExercises(search) {
  if(search === '') {
    url = `/exercises`
  } else {
    url = `/exercises/bodypart/${search}`
  }

  api.details(url)
    .then(exercises => {
      displayExercises(exercises);
    })
}

function fetchExerciseInfo(id) {

  api.details(`/exercises/${id}`)
    .then(exercise => {
      displayTargetExercise(exercise);
    })
}

function displayTargetExercise(exercise) {

  $('.list-exercises').toggle();
  $('.individual-exercise-details').toggle().attr({"aria-hidden":"false", "aria-live":"assertive"});

  let details = showTargetExerciseDetails(exercise)

  $('.individual-exercise-details').html(details)

  exercise.steps.forEach(function(step, index) {
    $('.exercise-steps').append(`${index + 1}. ${step}<br>`)
  })

  $('#back-button').on('click', event => {
    $('.individual-exercise-details').toggle();
    $('.list-exercises').toggle();
  })
}

function showTargetExerciseDetails(exercise) {
  if(exercise.svg[0] === undefined) {
    return `
    <h2 id="name-of-exercise">${exercise.title}</h2>
    <p>${exercise.primer}</p>
    <div class="general-info">
      <h3>General</h3>
      <ul>
      <li>${exercise.type}</li>
      <li>${exercise.primary}</li>
      <li>${exercise.secondary}</li>
      <li>${exercise.equipment}</li>
      </ul>
    </div>
    <div class="exercise-image-container">
      <img class="focused-exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/images/no-image.png"/>
      <img class="focused-exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/images/no-image.png"/>
    </div>
    <p class="exercise-steps"></p>
    <button id="back-button">Back</button>
    `
  }
  return `
  <h2 id="name-of-exercise">${exercise.title}</h2>
  <p>${exercise.primer}</p>
  <div>
    <h3>General</h3>
    <ul>
    <li>${exercise.type}</li>
    <li>${exercise.primary}</li>
    <li>${exercise.secondary}</li>
    <li>${exercise.equipment}</li>
    </ul>
  </div>
  <div class="exercise-image-container">
    <img class="focused-exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/${exercise.svg[0]}"/>
    <img class="focused-exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/${exercise.svg[1]}"/>
  </div>
  <p class="exercise-steps"></p>
  <button id="back-button">Back</button>
  `
}

function displayExercises(exercises) {
  const result = exercises.map(exercise => renderExercises(exercise))

  $('.content-container').html(result)
}

function renderExercises(exercise) {
  if(exercise.svg[0] == undefined) {
    return `
      <div class="card">
        <img class="exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/images/no-available-image.png"/>
        <h3 class="exercise-name">${exercise.title}</h3>
      </div>`
  }

  return `
    <div class="card">
      <img class="exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/${exercise.svg[0]}"/>
      <h3 class="exercise-name">${exercise.title}</h3>
    </div>`
}

function getExerciseInfo() {
  $('.content-container').on('click', '.card', event => {
    let id = $(event.currentTarget).find('img').attr('data-id');
    fetchExerciseInfo(id);
  })
}

function updateUserProfile() {
  api.create(`/api/users/${username}`)
}


function createWorkoutModal() {
  $('.build-workout').on('click', event => {
    $('#create-a-workout').show();
    $('body').addClass('backdrop')
  })

  $('.close').on('click', event => {
    $('#create-a-workout').hide();
    $('body').removeClass('backdrop')
  })

  $(window).click(event => {
    if (event.target.id === "create-a-workout") {
      $('#create-a-workout').hide();
      $('body').removeClass('backdrop')
    }
  })
}


function findUsers() {
  $('.find-users').on('click', event => {
    $('#explore-users').show();
    $('body').addClass('backdrop')
  })

  $('.close').on('click', event => {
    $('#explore-users').hide();
    $('body').removeClass('backdrop')
  })

  $(window).click(event => {
    if (event.target.id === "explore-users") {
      $('#explore-users').hide();
      $('body').removeClass('backdrop')
    }
  })
}

function searchExerciseModal() {
  $('.enable-search-modal').on('click', event => {
    $('#exercise-search-area').show();
    $('body').addClass('backdrop')
  })

  $('.close').on('click', event => {
    $('#exercise-search-area').hide();
    $('body').removeClass('backdrop')
  })

  $(window).click(event => {
    if (event.target.id === "exercise-search-area") {
      $('#exercise-search-area').hide();
      $('body').removeClass('backdrop')
    }
  })
}

function userProfileModal() {
  $(document).on('click', '#my-avatar', '.enable-search-modal', event => {
    $('#user-profile').show();
    $('body').addClass('backdrop')
  })

  $('.close').on('click', event => {
    $('#user-profile').hide();
    $('body').removeClass('backdrop')
  })

  $(window).click(event => {
    if (event.target.id === 'user-profile') {
      $('#user-profile').hide();
      $('body').removeClass('backdrop')
    }
  })
}

function handleModals() {
  createWorkoutModal();
  findUsers();
  searchExerciseModal();
  userProfileModal();
}

function exploreUsers() {
  $('.find-users').on('click', event => {
    url = "/api/users"

    api.details('/api/users')
      .then(users => {
        displayOtherUsers(users)
      })
  })
}

function displayOtherUsers(users) {
  const result = users.map(user => renderUser(user));
  $('.explore').html(result)
}

function renderUser(user) {
  return `
    <div class="user-card">
      <img id="my-avatar" src="${user.avatar}" alt="default-user-image">
      <p class="explore-usernames">${user.username}</p>
    </div`
}

function clickToAnotherProfile() {
  $('.explore').on('click', '.user-card', event => {
    let username = $(event.currentTarget).find('.explore-usernames').text();

    displayUserDashboard(username);
  })
}

function workoutDraft(workout) {
  $('.exercise-list').empty();
  workout.exercises.forEach((exercise, index) => {
    $('.exercise-list').append(`<li><ul class="draft exercise-${index+1}">${exercise.name}</ul></li>`)
    exercise.sets.forEach(set => {
      $(`.exercise-${index+1}`).append(`<li>set: ${set.weight}lb for ${set.reps} reps</li>`)
    })
  })
}

function getWorkouts() {
 api.details(`/workouts`)
   .then(workouts => {
     showMyWorkouts(workouts)
     showWorkoutDetails(workouts)
   })
}

function showMyWorkouts(workouts) {
 const list = workouts.map(workout => renderWorkouts(workout))
 $(`.workout-index`).html(list);
}

function renderWorkouts(workout) {
 if (workout.creator._id === currentUser) {
   return `<li>${workout.title}</li>`
 }
}

function showWorkoutDetails(data) {
 $(`.workout-index`).on(`click`, `li`, event => {
   $(`.my-workout-info`).toggle();
   for(let i = 0; i < data.length; i++) {
     if ($(event.currentTarget).text() === data[i].title) {
       $(`.workout-name`).html(data[i].title);
       $(`.individual-workout-details`).empty();
       let workout = data[i].exercises

       workout.forEach((exercise, index) => {
         $(`.individual-workout-details`).append(`<ul class="exercise-name-${index}">${exercise.name}</ul>`)
         exercise.sets.forEach(set => {
           $(`.exercise-name-${index}`).append(`<li>${set.weight}lb for ${set.reps} reps</li>`);
         })
       })
     }
   }
 })
}

function createWorkout() {
  let newWorkout = {
    title: '',
    difficulty: '',
    exercises: [],
    creator: currentUser
  };


  let exercise, set, reps;

  $('.set-info').on('click', '.save-set', event => {

    let singleExercise = {
      name: '',
      sets: []
    }

    // get user input values for single set
    weight = $(event.currentTarget).parent().find('.weight');
    reps = $(event.currentTarget).parent().find('.reps');
    exercise = $(event.currentTarget).parent().find('.exercise');

    let singleSet = {
      weight: weight.val(),
      reps: reps.val()
    }

    let index = newWorkout.exercises.findIndex(e => e.name == exercise.val())

    if (index < 0) {
      if (reps.val() === '') {
        let msg = 'Cannot add set information without an input.'
        notifyUserMsg(msg)
      } else {
        singleExercise.name = exercise.val();
        singleExercise.sets.push(singleSet)
        newWorkout.exercises.push(singleExercise)
      }
    } else {
      newWorkout.exercises[index].sets.push(singleSet)
    }

   workoutDraft(newWorkout)

   //clearing inputs
    exercise.val('');
    weight.val('');
    reps.val('');

  })

  $('.create-workout-form').on('submit', event => {
    event.preventDefault();

    let title = $(event.currentTarget).find('.workout-title').val()
    let difficulty = $(event.currentTarget).find('.workout-difficulty').val()

    newWorkout.title = title;
    newWorkout.difficulty = difficulty;
    postNewWorkout(newWorkout);
  })
}

function postNewWorkout(data) {
  let url = '/workouts';

  api.create('/workouts', data)
    .then(workout => {
      let createdWorkout = workout.id
      notifyUserMsg('Successfully created workout')
      createPostAndWorkout(createdWorkout)
    })
}

function preloadExercises() {
  api.details('/exercises')
    .then(exercises => {
      autoComplete(exercises)
    })
}

function autoComplete(exercises) {
  let exerciseList = []
  exercises.map(e => exerciseList.push(e.title))
  $( "#automplete-1" ).autocomplete({
     source: exerciseList,
     change: function (event, ui) {
                if(!ui.item){
                    $("#automplete-1").val("");
                }

            }
  });
}

function handleDashboard() {
  getToken();
  getWorkouts();
  displayUserDashboard();
  handlePostCreation();
  deletePosts();
  searchExercises();
  displaySubscribedPosts();
  findMySchedule();
  getExerciseInfo();
  handleSubscribeToUser();
  exploreUsers();
  createWorkout();
  preloadExercises();
  clickToAnotherProfile();
  handleModals();
  loggedInUserInfo();
  showEditProfileOptions();
}

$(handleDashboard);

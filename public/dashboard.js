let postTitle, workoutInfo, focusPostTitle, focusPostContent, avatar, currentUsername, subscribed;
let currentUser = localStorage.getItem('userInfo');
let loginToken = localStorage.getItem('token');
let isNewUser = localStorage.getItem('isNewUser');

function getToken() {
  if(!loginToken) {
    console.error(401);
    window.location.replace('/login');
  } else {
    url = "/api/auth/refresh";

    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + loginToken
        }
    })
    .then(response => response.json()) // parses response to JSON
    .then(function(access) {
      token = access.authToken;
      return token;
    })
  }
}

function createPost(title, content, callback) {
  let url = '/api/posts/';

  let data = {
    "title": title,
    "content": content
  }

  return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + loginToken
      },
      body: JSON.stringify(data),
  })
  .then(response => response.json()) // parses response to JSON
  .then(function(res) {
    renderNewPosts(res, avatar);
  })
}

function displayUserProfile() {
  currentUsername = window.location.href.split('/').pop()
  url = `/api/users/username/${currentUsername}`

  return fetch(url, {
    method: "GET",
    mode: "cors",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + loginToken
    }
  })
  .then(response => response.json())
  .then(function(userObject) {

    avatar = userObject.avatar;

    $('.feed-identity').html(
      `<section id="user-thumbnail">
        <img id="my-avatar" src="${avatar}" alt="workout-bear" />
        <p class="name">${userObject.firstName} ${userObject.lastName}</p>
        <button id="subscribe">follow</button>
      </section>`
    )


    if (subscribed === true) {
      $("#subscribe").attr('id', "unsubscribe").html('unsubscribe')
    }

  })
}

function displayMyPosts() {
  let url = '/api/posts/';

  return fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + loginToken
      }
  })
  .then(response => response.json())
  .then(function(postsList) {
    const result = postsList.filter( post => post.creator.username === currentUsername)
    displayPosts(result);
  })
}

function displayError(msg) {
  $('#warning-message').html(msg);
  var x = document.getElementById("warning-message");
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function subscribeToUser() {
  $('body').on('click', '#subscribe', event => {

    url = `/api/users/username/${currentUsername}`

    return fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + loginToken
      }
    })
    .then(response => response.json())
    .then(function(user) {

      let data = {
        "followers": currentUser
      }

      if (currentUser == user.id) {
        let msg = 'You cannot subscribe to yourself'
        displayError(msg)
        $("#subscribe").attr('disabled', true);
      } else {
        console.log(user.id)
        subscribeUrl = `/api/users/subscribe/${user.id}`

        return fetch(subscribeUrl, {
          method: "PUT",
          mode: "cors",
          headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Authorization": "Bearer " + loginToken
          },
          body: JSON.stringify(data)
        })
        .then(function(follower) {
          console.log(follower)
          $("#subscribe").attr('id', "unsubscribe").html('unsubscribe')
          subscribed = true;
          console.log(subscribed)
        })
      }
    })
  })
}

function unsubscribeFromUser() {
  $('body').on('click', '#unsubscribe', event => {

    url = `/api/users/username/${currentUsername}`

    return fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + loginToken
      }
    })
    .then(response => response.json())
    .then(function(user) {

      console.log(user.id)

      let data = {
        "followers": currentUser
      }

      unsubscribeUrl = `/api/users/unsubscribe/${user.id}`

      return fetch(unsubscribeUrl, {
        method: "DELETE",
        mode: "cors",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + loginToken
        },
        body: JSON.stringify(data)
      })
      .then(function(follower) {
        console.log(follower)
        subscribed = false;
      })
    })
  })
}

function displaySubscribedPosts() {
  currentUser = currentUser.split('"').join('');
  let url = `/api/users/subscribedTo/${currentUser}`;

  return fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + loginToken
      }
  })
  .then(response => response.json())
  .then(list => {
    list.following.map(follower => {
      url = `/api/users/subscribedTo/${follower}`;

          return fetch(url, {
              method: "GET",
              mode: "cors",
              headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "Authorization": "Bearer " + loginToken
              }
          })
          .then(response => response.json())
          .then(function(targetUser) {
            targetUser.posts.map(post => {
              url = `/api/posts/${post}`;

              return fetch(url, {
                  method: "GET",
                  mode: "cors",
                  headers: {
                      "Content-Type": "application/json; charset=utf-8",
                      "Authorization": "Bearer " + loginToken
                  }
              })
              .then(response => response.json())
              .then(function(posts) {
                const results = []
                results.push(posts)
                displayPosts(results);
              })
            })
          })
    })
  })
}

function findMySchedule() {
  url = `/workoutsplit`

  return fetch(url, {
    method: "GET",
    mode: "cors",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + loginToken
    }
  })
  .then(response => response.json())
  .then(function(schedule) {
    displayMySplit(schedule)
  })
}

// function displayMySplit(data) {
//
//   const userSchedules = data.filter(routine => routine.creator === currentUser)
//
//   let schedule = userSchedules[0]
//   let daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
//
//   $('.split-title').text(schedule.name);
//   for(let i = 0; i < daysOfWeek.length; i++) {
//     // console.log(daysOfWeek[i])
//     let day = $(`.reveal-split > span[value="${daysOfWeek[i]}"]`)
//     day.text(schedule[daysOfWeek[i]])
//   }
// }
function displayMySplit(data) {

  const userSchedules = data.filter(routine => routine.creator === currentUser)

  let schedule = userSchedules[0]
  let daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // $('.split-title').text(schedule.name);
  for(let i = 0; i < daysOfWeek.length; i++) {
    // console.log(daysOfWeek[i])
    let day = $(`.reveal-split > span[value="${daysOfWeek[i]}"]`)
    day.text(schedule[daysOfWeek[i]])
  }

  $('.reveal-split').on('click', event => {

  })
}

function displayExercises(data) {
  const exercises = data.map((data, index) => renderExercise(data, index));
  $('#my-workouts-list').html(exercises);
}

function renderExercise(exercise) {
  return `<img src="${exercise.svg[0]}"/>`
}

function displayPosts(data) {
  const results = data.map((post, index) => renderPosts(post, avatar, index));

  $('.main-index').append(results);
}

function displaySubscribedUserPosts(data) {
  const results = data.map((post, index) => renderPosts(post, avatar, index));

  $('.main-index').html(results);
}

function getWorkouts(token) {
  url = '/workouts'

  return fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + token
      }
  })
  .then(response => response.json()) // parses response to JSON
  .then(function(workouts) {
    showMyWorkouts(workouts)
    showWorkoutDetails(workouts)
  })
}

function showMyWorkouts(workouts) {
  const list = workouts.map(workout => renderWorkouts(workout))
  $('.workout-index').html(list);
}

function renderWorkouts(workout) {
  if (workout.creator.id === currentUser) {
    return `<li>${workout.title}</li>`
  }
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

function showWorkoutDetails(data) {
  $('.workout-index').on('click', 'li', event => {
    $('.my-workout-info').toggle();
    for(let i = 0; i < data.length; i++) {
      if ($(event.currentTarget).text() === data[i].title) {
        $('.workout-name').html(data[i].title);
        $('.individual-workout-details').empty();
        let workout = data[i].exercises

        workout.forEach((exercise, index) => {
          $(`.individual-workout-details`).append(`<ul class="exercise-name-${index}">${exercise.name}</ul>`)
          exercise.sets.forEach(set => {
            $(`.exercise-name-${index}`).append(`<li>${set.weight}lb for ${set.reps}</li>`);
          })
        })
      }
    }
  })
}

function openPostModal() {
  $('.main-index').on('click', 'li', event => {
    focusPostTitle = event.currentTarget.querySelector(".post-title").textContent;
    focusPostContent = event.currentTarget.querySelector(".post-text").textContent;
    displayPostModal(focusPostTitle, focusPostContent);
  })
}

function displayPostModal(title, content) {
  $('.main-index').on('click', 'li', event => {
    $('.post-from-stream-title').html(focusPostTitle);
    $('.post-from-stream-content').html(focusPostContent);

    $('#post-from-stream').show();
  })

  $('.close').on('click', event => {
    $('#post-from-stream').hide();
  })

  $(window).click(event => {
    if (event.target.id === "post-from-stream") {
      $('#post-from-stream').hide();
    }
  })
}

function handleWorkoutModal() {
  $('#share-workout').on('click', event =>{
    $('#create-a-workout-modal').show();
  })

  $('.close').on('click', event => {
    $('#create-a-workout-modal').hide();
  })

  $(window).click(event => {
    if (event.target.id === "create-a-workout-modal") {
      $('#create-a-workout-modal').hide();
    }
  })
}

function renderNewPosts(post) {
  let date = post.created.slice(0,10).replace(/-/g,'/');
  console.log(post)
  $('.main-index').append(`
      <li class="feed-index-item">
        <section class="content">
          <section class="thumbnail-for-post">
            <img class="avatar-related-to-post" src="${avatar}" alt="user-avatar">
            <h1 class="post-title">${post.title}</h1>
            <p class="date">${date}</p>
          </section>
          <p class="post-text">${post.content}</p>
        </section>
      </li>`)
}

function renderPosts(post) {
  let date = post.created.slice(0,10).replace(/-/g,'/');
  return `
    <li class="feed-index-item">
      <section class="content">
        <section class="thumbnail-for-post">
          <img class="avatar-related-to-post" src="${post.creator.avatar}" alt="user-">
          <h1 class="post-title">${post.title}</h1>
          <p class="date">${date}</p>
        </section>
        <p class="post-text">${post.content}</p>
      </section>
    </li>`
}

function handlePostCreation() {
  const targetTitle = $('.modal-title')
  const targetPostContent = $('.modal-workout-content')
  $('#create-post').attr("disabled", "true");

  targetTitle.blur(function() {
    targetPostContent.blur(function() {
      if(targetTitle.val() != "" && targetPostContent.val() != "") {
        $('#create-post').removeAttr("disabled");
      } else {
        $('#create-post').attr("disabled", "true");
      }
    })
  })

  $('#create-post').on('click', event => {

    postTitle = targetTitle.val();
    postContent = targetPostContent.val();

    //clear inputs
    targetTitle.val('');
    targetPostContent.val('');

    createPost(postTitle, postContent, renderPosts);

    //close modal after creating a post
    $('#myModal').hide();
  })
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

  return fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer "
      }
  })
  .then(response => response.json()) // parses response to JSON
  .then(function(exercises) {
    displayExercises(exercises);
  })
}

function fetchExerciseInfo(id) {

  url = `/exercises/${id}`

  return fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer "
      }
  })
  .then(response => response.json()) // parses response to JSON
  .then(function(exercise) {
    displayTargetExercise(exercise);
  })
}

function displayTargetExercise(exercise) {

  $('.list-exercises').toggle();
  $('.individual-exercise-details').toggle();

  let details = showTargetExerciseDetails(exercise)

  $('.individual-exercise-details').html(details)

  exercise.steps.forEach(function(step, index) {
    $('.exercise-steps').append(`${index + 1}. ${step}<br>`)
  })

  $('.close').on('click', event => {
    $('.individual-exercise-details').toggle();
    $('.list-exercises').toggle();
  })

  $(window).click(event => {
    if (event.target.id === "exercise-search-area") {
      $('#exercise-search-area').hide();
      $('.individual-exercise-details').toggle();
      $('.list-exercises').toggle();
    }
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
      <img class="focused-exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/no-image.png"/>
      <img class="focused-exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/no-image.png"/>
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
        <img class="exercise-image" data-id="${exercise.id}" name="${exercise.name}" src="/no-available-image.png"/>
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

function revealSearchModal() {
  $('.enable-search-modal').on('click', event => {
    $('#exercise-search-area').show();
  })

  $('.close').on('click', event => {
    $('#exercise-search-area').hide();
  })

  $(window).click(event => {
    if (event.target.id === "exercise-search-area") {
      $('#exercise-search-area').hide();
    }
  })
}

function findUsers() {
  $('.find-users').on('click', event => {
    $('#explore-users').show();
  })

  $('.close').on('click', event => {
    $('#explore-users').hide();
  })

  $(window).click(event => {
    if (event.target.id === "explore-users") {
      $('#explore-users').hide();
    }
  })

}

function exploreUsers() {
  $('.find-users').on('click', event => {
    console.log('clicked')
    url = "/api/users"

    return fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        }
    })
    .then(response => response.json()) // parses response to JSON
    .then(function(users) {
      console.log(users)
      renderUsers(users)
    })
  })
}

function renderUsers(users) {
  console.log(users)
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

function workoutDraft(workout) {
  $('.exercise-list').empty();
  workout.exercises.forEach((exercise, index) => {
    $('.exercise-list').append(`<li><ul class="draft exercise-${index+1}">${exercise.name}</ul></li>`)
    exercise.sets.forEach(set => {
      $(`.exercise-${index+1}`).append(`<li>set: ${set.weight}lb for ${set.reps} reps</li>`)
    })
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
        displayError(msg)
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

    console.log('creating workout...')
    console.log(newWorkout)
    postNewWorkout(newWorkout)

  })
}

function postNewWorkout(data) {
  let url = '/workouts';

  return fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer " + loginToken
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json()) // parses response to JSON
  .then(function(res) {
    // renderNewPosts(res, avatar);
  })
}

function preloadExercises() {
  url = `/exercises`

  return fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      }
  })
  .then(response => response.json()) // parses response to JSON
  .then(function(exercises) {
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
  getToken().then(res => getWorkouts(res));
  displayUserProfile();
  displayMyPosts();
  handleWorkoutModal();
  handlePostCreation();
  openPostModal();
  displaySubscribedPosts();

  findMySchedule();

  searchExercises();
  revealSearchModal();
  getExerciseInfo();
  subscribeToUser();
  unsubscribeFromUser();

  findUsers();
  exploreUsers();

  createWorkout();
  preloadExercises();
}

$(handleDashboard);

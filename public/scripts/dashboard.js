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
  // console.log(workoutId)
  // console.log(title)
  // console.log(content)
  // let url = '/api/posts/';
  let data = {
    "title": title,
    "content": content,
    "workout": workoutId
  }

  api.create('/api/posts/', data)
  .then(post => {
    console.log(post)
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

  // console.log(targetTitle)
  // console.log(targetPostContent)
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

    // console.log(postTitle)
    // console.log(postContent)

    //clear inputs
    targetTitle.val('');
    targetPostContent.val('');

    createPost(postTitle, postContent, workoutId, renderPosts);

    //close modal after creating a post
    $('#myModal').hide();
  })
}

//@WIP not fully deleting anymore
function deletePosts() {
  $('.main-index').on('click', '.delete', event => {
    let target = $(event.currentTarget).parent('.feed-index-item').attr('data-id');
    console.log(target)
    $(event.currentTarget).parent('.feed-index-item').remove();

    api.remove(`/api/posts/${target}`)
      .then(response => {
        // response.json()
        console.log(response)
        // displayError('Successfully deleted post')
      });
  })
}

function displayUserProfile(username) {
  currentUsername = window.location.href.split('/').pop()
  url = `/api/users/username/${currentUsername}`

  api.details(`/api/users/username/${currentUsername}`)
    .then(user => {
      console.log(user)
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
          <img id="my-avatar" src="${avatar}" alt="workout-bear" />
          <p class="name">${user.firstName} ${user.lastName}</p>
          <button id="unsubscribe">unsubscribe</button>
        </section>`
      )
  } else {
    $('.feed-identity').html(
      `<section id="user-thumbnail">
        <img id="my-avatar" src="${avatar}" alt="workout-bear" />
        <p class="name">${user.firstName} ${user.lastName}</p>
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
  if(data.workout) {
    let stuff = fetchWorkoutPost(data)
    console.log(stuff)
  }
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

function fetchWorkoutPost(post) {
  // console.log(post)
  api.details(`/workouts/${post.workout}`)
    .then(workout => {
      console.log(workout)
      renderWorkoutsToPost(workout)
    })
}

function renderWorkoutsToPost(workout) {
  // console.log(workout)
  $('.feed-index-item').append(`<p>${workout.difficulty}</p>`)
}

function renderPosts(post, sub) {
  // console.log(post._id)
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

function displayError(msg) {
  $('#warning-message').html(msg);
  var x = document.getElementById("warning-message");
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function handleSubscribeToUser() {
  $('body').on('click', '#subscribe', event => {
    api.details(`/api/users/username/${currentUsername}`)
    .then(user => {

      let data = {
        "followers": currentUser
      }

      if (currentUser === user.id) {
        let msg = 'You cannot subscribe to yourself'
        displayError(msg)
        $("#subscribe").attr('disabled', true);
      } else {
        api.update(`/api/users/subscribe/${user._id}`)
          .then(() => {
            $("#subscribe").attr('id', "unsubscribe").html('unsubscribe')
          })
      }
    })
  })

  $('body').on('click', '#unsubscribe', event => {

    url = `/api/users/username/${currentUsername}`

    api.details(`/api/users/username/${currentUsername}`)
      .then(user => {
        let data = {
          "followers": currentUser
        }

        api.remove(`/api/users/unsubscribe/${user._id}`)
          .then(user => {
            $("#unsubscribe").attr('id', "subscribe").html('subscribe')
          })
      })
  })
}

function displaySubscribedPosts() {
  console.log(currentUser)
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

function getWorkouts(token) {
  api.details('/workouts')
    .then(workouts => {
      showMyWorkouts(workouts)
      showWorkoutDetails(workouts)
    })
}

function showMyWorkouts(workouts) {
  const list = workouts.map(workout => renderWorkouts(workout))
  $('.workout-index').html(list);
}

function renderWorkouts(workout) {
  if (workout.creator._id === currentUser) {
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
    let deleteButton = $(event.target).is(".delete");
    if(deleteButton) {
      console.log('Successfully deleted post')
      event.stopPropagation();
    } else {
      focusPostTitle = event.currentTarget.querySelector(".post-title").textContent;
      focusPostContent = event.currentTarget.querySelector(".post-text").textContent;
      displayPostModal(focusPostTitle, focusPostContent);
    }
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

function handleModals() {
  let exerciseModal = 'enable-search-modal';
  let usersModal = 'find-users';
  let workoutModal = 'build-workout'

  $('.enable-search-modal').add('.find-users').add('.build-workout').on('click', event => {
    let target = $(event.currentTarget).attr('class');

    switch(target) {
      case exerciseModal:
          $('#exercise-search-area').show();
          $('.close').on('click', event => {
            $('#exercise-search-area').hide();
          })
          break;
      case usersModal:
          $('#explore-users').show();
          $('.close').on('click', event => {
            $('#explore-users').hide();
          })
          break;
      case workoutModal:
          $('#create-a-workout').show();
          $('.close').on('click', event => {
            $('#create-a-workout').hide();
          })
          break;
    }

      $(window).click(event => {
        if (event.target.id === "exercise-search-area" || event.target.id === "explore-users" || event.target.id === "create-workout-modal") {
          $('#exercise-search-area').hide();
          $('#explore-users').hide();
          $('#create-a-workout').hide();
        }
      })
  });
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
    console.log('clicked')
    let username = $(event.currentTarget).find('.explore-usernames').text();

    displayUserProfile(username);
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
    console.log(newWorkout)
    postNewWorkout(newWorkout);
  })
}

function postNewWorkout(data) {
  let url = '/workouts';

  api.details('/workouts')
    .then(workout => {
      let createdWorkout = workout.id
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
  // getToken().then(res => getWorkouts(res));
  getToken();
  getWorkouts();
  displayUserProfile();
  handlePostCreation();
  // renderWorkoutsToPost();
  deletePosts();
  openPostModal();
  searchExercises();
  displaySubscribedPosts();
  findMySchedule();
  getExerciseInfo();
  handleSubscribeToUser();
  findUsers();
  exploreUsers();
  createWorkout();
  preloadExercises();
  clickToAnotherProfile();
  handleModals();
  //@WIP
}

$(handleDashboard);

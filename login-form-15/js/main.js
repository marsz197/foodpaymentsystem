(function($) {

	"use strict";

	$(".toggle-password").click(function() {

  $(this).toggleClass("fa-eye fa-eye-slash");
  var input = $($(this).attr("toggle"));
  if (input.attr("type") == "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  }
});

})(jQuery);

const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created:", user);
    // Redirect to a success page or handle user creation successfully.
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error creating user:", errorCode, errorMessage);
    document.getElementById('error-message').innerHTML = errorCode + errorMessage;
  }
});

const signinForm = document.getElementById('signin-form');
signinForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user);
    // Redirect to the app's main content or a user dashboard.
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing in:", errorCode, errorMessage);
    document.getElementById('error-message').innerHTML = errorCode + errorMessage;
    // Display an error message to the user.  Common errors include wrong password, etc.
  }
});

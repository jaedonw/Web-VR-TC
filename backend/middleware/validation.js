// Ensure a given phone number is valid
export const isValidPhone = function (req, res, next) {
  // Ensure body contains phone number
  if (req.body.phone === undefined) {
    return res.status(422).json({ error: "Phone number is required." });
  }

  // Check if phone number is valid
  const phoneValue = req.body.phone
    .replace("-", "")
    .replace("(", "")
    .replace(")", "")
    .replace(" ", "");
  const phoneLength = phoneValue.length;

  // If phone number is not 10 digits, return error
  if (phoneLength !== 10 || isNaN(phoneValue)) {
    return res.status(422).json({ error: "Phone number is invalid." });
  }

  next();
};

// Ensure a given password is valid
export const isValidPassword = function (req, res, next) {
  // Ensure body contains password
  if (req.body.password === undefined) {
    return res.status(422).json({ error: "Password is required." });
  }

  // Check if password is valid
  const passwordValue = req.body.password;
  const passwordLength = passwordValue.length;
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    passwordValue
  );
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasLowerCase = /[a-z]/.test(passwordValue);

  const hasAllReqs =
    hasNumber &&
    hasSpecialChar &&
    hasUpperCase &&
    hasLowerCase &&
    passwordLength >= 8;

  // If password is not valid, return error
  if (!hasAllReqs) {
    return res.status(422).json({
      error:
        "Password must be at least 8 characters long and contain at least one" +
        " number, one uppercase letter, one lowercase letter, and one" +
        " special character.",
    });
  }

  next();
};

// Ensure a given username is valid
export const isValidUsername = function (req, res, next) {
  // Ensure body contains username
  if (req.body.username === undefined) {
    return res.status(422).json({ error: "Username is required." });
  }

  // Check if username is valid
  const usernameValue = req.body.username;
  const usernameLength = usernameValue.length;

  // If username is not at least 3 characters, return error
  if (usernameLength < 3) {
    return res.status(422).json({
      error: "Username must be greater than 3 characters.",
    });
  }

  next();
};

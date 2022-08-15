const passwordValidation = (password1: string, password2: string) => {
  if (password2 == "") {
    return false;
  }
  if (password1 !== password2) {
    return "패스워드가 일치하지 않습니다";
  }
  if (password1.length < 8) {
    return "비밀번호는 8자 이상 이여야 됩니다.";
  } else {
    return false;
  }
};

export default passwordValidation;

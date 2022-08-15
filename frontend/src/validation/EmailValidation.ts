function validEmailCheck(value: string) {
  var pattern =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
  return value.match(pattern) != null;
}

const emailValidation = (email: string) => {
  if (email == "") {
    return false;
  }
  if (!validEmailCheck(email)) {
    return "이메일을 정확하게 입력해주세요";
  }
  return false;
};

export default emailValidation;

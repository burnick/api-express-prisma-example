function validatePhoneNumber(input_str: string) {
  /**Easily change regex phone validation */
  const re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;

  return re.test(input_str);
}

export default validatePhoneNumber;

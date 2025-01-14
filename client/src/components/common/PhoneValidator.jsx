import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export const validatePhoneNumber = (phoneNumber) => {
  try {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber);
    console.log(phoneUtil.isValidNumber(parsedNumber));
    return phoneUtil.isValidNumber(parsedNumber);
  } catch (error) {
    console.log(error);
    return false;
  }
};

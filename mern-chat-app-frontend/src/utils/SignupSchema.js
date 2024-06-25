import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  name: Yup.string().required("name is required!"),
  email: Yup.string()
    .required("email is required")
    .email("invalid email format"),
  password: Yup.string()
    .required("password is required")
    .min(6, "password must be atleast 6 characters"),
  confirmPassword: Yup.string()
    .required("confirmPassword is required")
    .oneOf([Yup.ref("password")], "password does not match"),
  userPic: Yup.mixed().required("picture is required"),
});

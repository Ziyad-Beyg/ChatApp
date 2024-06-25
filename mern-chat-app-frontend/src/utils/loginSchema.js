import * as Yup from "yup";

export const validationSchema = Yup.object({
  email: Yup.string()
    .required("email is required")
    .email("invalid email format"),
  password: Yup.string()
    .required("password is required")
    .min(6, "password must be atleast 6 characters"),
});

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Formik, Form } from "formik";
import InputField from "../../../components/form-components/input-box";
import { Button, Heading } from "../../../common";
import { useLogin } from "../../../hooks";
import { encryptPassword } from "../../../utils/encrypt-password";
import { loginSchema } from "../../../schema/schema";
import { useAuth } from "../../../context/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();

  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  const inputFields = useMemo(
    () => [
      { name: "email", type: "email", label: "Email", placeholder: "Email" },
      {
        name: "password",
        type: isPasswordVisible ? "text" : "password",
        label: "Password",
        placeholder: "Password",
        showPasswordToggle: true,
        onTogglePasswordVisibility: () => setIsPasswordVisible((prev) => !prev),
        isPasswordVisible,
      },
    ],
    [isPasswordVisible]
  );

  const handleSubmit = useCallback(
    async (values) => {
      const encryptedPassword = encryptPassword(values.password);
      await login({
        body: { email: values.email, password: encryptedPassword },
      });
    },
    [login]
  );

  return (
    <div className="flex min-h-screen">
      <aside className="flex-col justify-between hidden p-12 text-white md:flex md:w-1/2 bg-custom_primary">
        <div className="flex flex-col gap-8">
          <div className="mt-16">
            <h1 className="mb-4 text-5xl font-bold">
              Hello <br /> Forecast Admin!👋
            </h1>
            <p className="mt-6 text-lg">
              Welcome to a platform where you can manage products on Shopify,
              streamline your inventory, and enhance your online store
              experience. Get started today to unlock powerful e-commerce
              features!
            </p>
          </div>
        </div>
        <div className="text-sm opacity-70">
          © 2025 Forecast. All rights reserved.
        </div>
      </aside>

      <main className="flex flex-col items-center justify-center w-full p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <Heading heading="Forecast 👋" className="mb-8" />
          <section className="mb-8">
            <h2 className="text-2xl font-bold">Welcome Back Forecast Admin!</h2>
            <p className="mt-4 text-sm text-gray-600">
              Log in now to gain access to all the powerful admin features of
              Forecast!
              <br /> It's quick and easy—get started today!
            </p>
          </section>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-5">
                {inputFields.map((field) => (
                  <InputField key={field.name} {...field} />
                ))}
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-3 text-white rounded bg-custom_primary hover:bg-gray-800"
                >
                  {isLoading ? "Logging in..." : "Login Now"}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
};

export default Login;

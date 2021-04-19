import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import { Auth } from "aws-amplify";
import { useAppContext } from "../libs/contextlib";
import { useFormFields } from "../libs/hookslib";
import { onError } from "../libs/errorlib";
import "./Login.css";

export default function Login() {
  const history = useHistory(); 
  const { userHasAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setValues] = useFormFields({
    email: "",
    password: "",
  });
  
  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    // AWS Cognito login
    try {
      await Auth.signIn(fields.email, fields.password);
      userHasAuthenticated(true);
      history.push("/");
      console.log("** user logged in **");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }    
  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={fields.email}
            onChange={setValues}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={fields.password}
            onChange={setValues}
          />
        </Form.Group>
        <Button variant="dark" block size="lg" type="submit" disabled={!validateForm() || isLoading}>
          { isLoading ? (<>Loading...</>) : (<>Login</>) }
        </Button>
      </Form>
    </div>
  );
}


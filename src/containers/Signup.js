import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import { Auth } from "aws-amplify";
import { useAppContext } from "../libs/contextlib";
import { useFormFields } from "../libs/hookslib";
import { onError } from "../libs/errorlib";
import "./Signup.css";

export default function Signup() {
  const history = useHistory();
  const { userHasAuthenticated } = useAppContext();

  // -------------------------------------------------------------------------
  // Estados
  // -------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [fields, setValues] = useFormFields({
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: "",
  });
  
  // -------------------------------------------------------------------------
  // Validaciones de formulario
  // -------------------------------------------------------------------------
  function validateForm() {
    return (
      fields.email.length > 0 && 
      fields.password.length > 0 &&
      fields.password === fields.confirmPassword
    );
  }

  function validateConfirmationCode() {
    return fields.confirmationCode.length > 0;
  }

  // -------------------------------------------------------------------------
  // Envio de datos
  // -------------------------------------------------------------------------
  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const newUser = await Auth.signUp({
        username: fields.email,
        password: fields.password,
      });
      setIsLoading(false);
      setNewUser(newUser);
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
    
  }

  async function handleConfirmationSubmit(event) {
    event.preventDefault();

    try {
      await Auth.confirmSignUp(fields.email, fields.confirmationCode);
      await Auth.signIn(fields.email, fields.password);
      userHasAuthenticated(true);
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Render de formularios
  // -------------------------------------------------------------------------
  function renderForm() {
    return (
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
      <Form.Group size="lg" controlId="confirmPassword">
        <Form.Label>Confirm your Password</Form.Label>
        <Form.Control
          type="password"
          value={fields.confirmPassword}
          onChange={setValues}
        />
      </Form.Group>
      <Button variant="dark" block size="lg" type="submit" disabled={!validateForm() || isLoading}>
        { isLoading ? (<>Loading...</>) : (<>Sign up!</>) }
      </Button>
    </Form>
    );
  }

  function renderConfirmForm() {
    return(
      <Form onSubmit={handleConfirmationSubmit}>
        <Form.Group controlId="confirmationCode" size="lg">
          <Form.Label>Confirmation Code</Form.Label>
          <Form.Control
            autoFocus
            type="tel"
            onChange={setValues}
            value={fields.confirmationCode}
          />
          <Form.Text muted>Please check your email for the code.</Form.Text>
        </Form.Group>
        <Button
          block
          size="lg"
          type="submit"
          variant="success"
          disabled={!validateConfirmationCode() || isLoading }
        >
        { isLoading ? (<>Loading...</>) : (<>Validate </>) }
        </Button>
      </Form>
    );
  };

  return (
    <div className="Signup">
      {newUser === null ? renderForm() : renderConfirmForm()}
    </div>
  );  

}


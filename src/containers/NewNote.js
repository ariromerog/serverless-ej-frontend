import React, { useRef, useState } from "react";
import { API } from "aws-amplify";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import { onError } from "../libs/errorlib";
import { s3Upload } from "../libs/awslib";
import config from "../config";
import { LinkContainer } from "react-router-bootstrap";
import "./NewNote.css";

export default function NewNote() {
  const history = useHistory();
  const file = useRef(null);

  // ------------------------------------------------------------------------- 
  // variables de estado
  // ------------------------------------------------------------------------- 
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------------------------------------- 
  // validacion formulario 
  // ------------------------------------------------------------------------- 
  function validateForm() {
    return content.length > 0;
  }

  function handleFileChange(event) {
    console.log(event);
    file.current = event.target.files[0];
  }

  // ------------------------------------------------------------------------- 
  // envio de datos 
  // ------------------------------------------------------------------------- 

  function createNote(note) {
    return API.post("notes", "/notes", {
      body: note
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const attachment = file.current ? await s3Upload(file.current) : null;
      console.log(content);
      console.log(attachment);
      await createNote({ content, attachment });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }

  }

  // ------------------------------------------------------------------------- 
  // render formulario 
  // ------------------------------------------------------------------------- 

  return (
    <div className="NewNote">
      <h2 className="pb-3 mt-4 mb-3 border-bottom">Write a new Note</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="content">
          <Form.Control
            value={content}
            as="textarea"
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="file">
          <Form.Label>Attachment</Form.Label>
          <Form.Control onChange={handleFileChange} type="file" />
        </Form.Group>
        <Button
          type="submit"
          size="lg"
          variant="success"
          disabled={!validateForm() || isLoading}
        >
        { isLoading ? (<> Loading ... </>) : (<> Create Note! </>)  }
        </Button>
      </Form>
    </div>
  );

  
};

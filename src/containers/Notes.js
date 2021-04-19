import React, { useRef, useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../libs/errorlib";
import { s3Upload, s3Delete } from "../libs/awslib";
import config from "../config";

export default function Notes() {
  // ------------------------------------------------------------------------- 
  // variables de estado
  // ------------------------------------------------------------------------- 
  const history = useHistory();
  const file = useRef(null);
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ------------------------------------------------------------------------- 
  // Guardado
  // ------------------------------------------------------------------------- 

  function validateForm() {
    return content.length > 0;
  }

  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  function saveNote(note) {
    return API.put("notes", `/notes/${id}`, {
      body: note
    });
  }

  function deleteNote() {
    return API.del("notes", `/notes/${id}`);
  }

  async function handleSubmit(event) {
    let attachment;

    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }

    setIsLoading(true);
    console.log("guardando nota...");

    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      }

      await saveNote({
        content,
        attachment: attachment || note.attachment
      });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }

  }
   
  async function handleDelete(event) {
    event.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    console.log("borrando nota...");

    try {
      await deleteNote();

      if(note.attachmentURL) {
        console.log("Eliminar attachamiento");
        console.log(note.attachment);
        await s3Delete(note.attachment);
      }

      history.push("/");
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  } 

  // ------------------------------------------------------------------------- 
  // Carga de datos 
  // ------------------------------------------------------------------------- 

  useEffect(() => {
    function loadNote() {
      return API.get("notes", `/notes/${id}`);
    }

    async function onLoad() {
      try {
        const note = await loadNote();
        const { content, attachment } = note;
        console.log(note);
        if (attachment) {
          note.attachmentURL = await Storage.vault.get(attachment);
          console.log(note);
        }

        setContent(content);
        setNote(note);
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, [id]);

  // ------------------------------------------------------------------------- 
  // Render 
  // ------------------------------------------------------------------------- 


  return (
    <div className="Notes">
      <h2 className="pb-3 mt-4 mb-3 border-bottom">View Note</h2>
       {note && (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="content">
              <Form.Control
                as="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="file">
              <Form.Label>Attachment</Form.Label>
              {note.attachment && (
                <p>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={note.attachmentURL}
                  >
                    {formatFilename(note.attachment)}
                  </a>
                </p>
              )}
              <Form.Control onChange={handleFileChange} type="file" />
            </Form.Group>
            <Button
              block
              size="lg"
              type="submit"
              isLoading={isLoading}
              disabled={!validateForm()}
            >
            Save
          </Button>
          <Button
            block
            size="lg"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </Form>
      )}

    </div>
  );

}

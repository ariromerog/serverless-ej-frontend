import React, {useState, useEffect} from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { API } from "aws-amplify";
import { useAppContext } from "../libs/contextlib";
import { onError } from "../libs/errorlib";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import "./Home.css";

export default function Home() {
  
  // -------------------------------------------------------------------------
  // Variables de estado
  // -------------------------------------------------------------------------
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAppContext();

  // -------------------------------------------------------------------------
  // Carga de datos
  // -------------------------------------------------------------------------

  async function onLoad() {
    if (isAuthenticated) {
      try {
        const notes = await API.get("notes", "/notes");
        console.log(notes)
        setNotes(notes);
      } catch (e) {
        onError(e);
      }
    }
    setIsLoading(false);
  }

  useEffect(() => { 
    onLoad();
  }, [isAuthenticated]);

  // -------------------------------------------------------------------------
  // Renders
  // -------------------------------------------------------------------------

  function renderNotesList(notes) {
    return (
      <>
        <LinkContainer to="/notes/new">
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ml-2 font-weight-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {notes.map(({ noteid, content, createdAt }) => (
          <LinkContainer key={noteid} to={`/notes/${noteid}`}>
            <ListGroup.Item action>
              <span className="font-weight-bold">
                {content.trim().split("\n")[0]}
              </span>
              <br />
              <span className="text-muted">
                Created: {new Date(createdAt).toLocaleString()}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Skratch</h1>
        <p className="text-muted">A simple note taking app</p>
      </div>
    );
  }
 
  function renderNotes() {
    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
        <ListGroup>{!isLoading && renderNotesList(notes)}</ListGroup>
        { isLoading && (<div className="p-5 text-center text-muted"> Loading notes.. </div>)  }
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}


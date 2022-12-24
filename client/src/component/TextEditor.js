import React, { useCallback, useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { io } from "socket.io-client"
// const socket = io("https://server-domain.com");
// const s = io("http://localhost:3000/");
const SAVE_INTERVAL_MS = 2000

function TextEditor() {
  // const { id: documentId } = useParams();
  const { id: documentId } = useParams()
  const [value, setValue] = useState('');
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()

  // The Quill Toolbar Module API provides an easy way to configure the default toolbar icons using an array of format names.
  //setting up quill
  // Quill requires a container where the editor will be appended
  const TOOLBAR_OPTIONS = [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ]
  var options = {
    // debug: 'info',
    modules: {
      toolbar: TOOLBAR_OPTIONS
    },
    // placeholder: 'Compose an epic...',
    // readOnly: true,
    theme: 'snow'
  };
  // var container = document.getElementById('editor');
  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, options)
    q.disable()
    q.setText("Loading...")
    setQuill(q)
  }, [])

  //////////////////////////////////////////////////////////////////////////////////// with socket
  useEffect(() => {

    const s = io("http://localhost:3000")
    // s.connect();
    console.log('while connect', s)
    setSocket(s)


    return () => {
      // The return function is the cleanup function, or when the user leaves the page and the component will unmount.
      s.disconnect()
      console.log('while return', s)
    }
  }, [])


  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once("load-document", document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit("get-document", documentId)
  }, [socket, quill, documentId])


  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    // Deltas are a simple, yet expressive format that can be used to describe Quill's contents and changes.
    const handler = delta => {
      quill.updateContents(delta)
      console.log('delta:'.delta)
    }
    console.log('handler-> ', handler)
    socket.on("receive-changes", handler)

    return () => {
      socket.off("receive-changes", handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return
      socket.emit("send-changes", delta)
    }
    quill.on("text-change", handler)

    return () => {
      quill.off("text-change", handler)
    }
  }, [socket, quill])





  return (
    <>
      {/* <div>TextEditor</div> */}
      {/* <ReactQuill theme="snow" value={value} onChange={setValue} /> */}
      <div className="container" ref={wrapperRef}></div>
      {/* Refs are a function provided by React to access the DOM element and the React element that you might have created on your own. */}
    </>

  )
}

export default TextEditor
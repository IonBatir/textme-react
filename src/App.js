import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { auth } from "firebase";
import { Conversations, Messages } from "./components";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const uiConfig = {
  signInFlow: "popup",
  signInSuccessUrl: false,
  signInOptions: [auth.EmailAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

function App() {
  const [signedIn, setSignedIn] = React.useState(false);
  const [conversation, setConversation] = React.useState(null);

  React.useEffect(
    () =>
      auth().onAuthStateChanged(user =>
        user ? setSignedIn(true) : setSignedIn(false)
      ),
    []
  );

  return signedIn ? (
    <div class="container">
      <div class="messaging">
        <div class="inbox_msg">
          <Conversations
            selectConversation={conversation => setConversation(conversation)}
            currentConversation={conversation}
          />
          {conversation && <Messages conversation={conversation} />}
        </div>
      </div>
    </div>
  ) : (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />
  );
}

export default App;

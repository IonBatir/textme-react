import React from "react";
import SearchBar from "./SearchBar";
import { fetchPersonalConversations } from "../api";
import { getFormatedDate } from "../utils";

export default function Conversations({
  selectConversation,
  currentConversation
}) {
  const [conversations, setConversations] = React.useState({
    data: [],
    loading: true
  });

  React.useEffect(
    () =>
      fetchPersonalConversations(
        conversations =>
          setConversations({ data: conversations, loading: false }),
        error => {
          setConversations({ data: [], loading: false });
          alert(error);
        }
      ),
    []
  );

  return (
    <div class="inbox_people">
      <div class="headind_srch">
        <div class="recent_heading">
          <h4>Recent</h4>
        </div>
        <SearchBar />
      </div>
      <div class="inbox_chat">
        {conversations.data.map(conversation => (
          <div
            onClick={() => selectConversation(conversation)}
            class={`chat_list ${currentConversation === conversation &&
              "active_chat"}`}
          >
            <div class="chat_people">
              <div class="chat_img">
                <img src={conversation.avatar} alt={conversation.name} />
              </div>
              <div class="chat_ib">
                <h5>
                  {conversation.name}
                  <span class="chat_date">
                    {getFormatedDate(conversation.lastTimestamp)}
                  </span>
                </h5>
                <p>{conversation.lastMessage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

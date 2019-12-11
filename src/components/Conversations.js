import React from "react";
import { fetchPersonalConversations } from "../api";
import { getFormatedDate } from "../utils";

export default function Conversations() {
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
    <div class="inbox_chat">
      {conversations.data.map(conversation => (
        <div class="chat_list active_chat">
          <div class="chat_people">
            <div class="chat_img">
              <img src={conversation.avatar} alt={conversation.name} />
            </div>
            <div class="chat_ib">
              <h5>
                {conversation.name}{" "}
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
  );
}

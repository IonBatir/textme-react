import React from "react";
import { fetchMessages } from "../api";
import { getFormatedDate, getFormatedTime } from "../utils";

export default function Messages({ conversation }) {
  const [messages, setMessages] = React.useState({ data: [], loading: true });
  const [message, setMessage] = React.useState({ text: "", sending: false });

  React.useEffect(
    () =>
      fetchMessages(
        conversation,
        messages => setMessages({ data: messages, loading: false }),
        error => {
          setMessages({ data: [], loading: false });
          alert(error);
        }
      ),
    [conversation]
  );

  return (
    <div class="mesgs">
      <div class="msg_history">
        {messages.data.map(message => (
          <div class={message.my ? "outgoing_msg" : "incoming_msg"}>
            {message.my || (
              <div class="incoming_msg_img">
                <img src={message.avatar} alt={message.from} />
              </div>
            )}
            <div class="received_msg">
              <div class="received_withd_msg">
                <p>{message.text}</p>
                <span class="time_date">{`${getFormatedTime(
                  message.timestamp
                )} | ${getFormatedDate(message.timestamp)}`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div class="type_msg">
        <div class="input_msg_write">
          <input
            type="text"
            class="write_msg"
            value={message.text}
            onChange={event =>
              setMessage({ text: event.target.value, sending: false })
            }
            placeholder="Type a message"
          />
          <button class="msg_send_btn" type="button">
            <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import uuid from "react-uuid";
import FeedbackModal from "./FeedbackModal";
import BotLogo from "./BotLogo";
import SendLogo from "./SendLogo";
import UserLogo from "./UserLogo";
import { API_URL } from "../store/constants";

function App() {
  const [messageSentBool, setMessageSentBool] = useState(false);
  const [chat, setChat] = useState([
    {
      _id: uuid(),
      message: "Hello, I'm Bookme Assistant. How may I help you.",
      source: "bot",
      isLiked: null,
    },
  ]);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [InputErrorEnabled, setInputErrorEnabled] = useState(false);
  const [loader, setLoader] = useState(false);

  let wordCount = null;

  const feedBackApiCall = async (dataObj) => {
    const response = await fetch(`${API_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataObj),
    });
  };

  const processMessageToGemini = async (message) => {
    setIsButtonDisabled(true);
    setLoader(true);
    try {
      const histories = [...chat];
      const api_data = {
        history: histories
          .slice(-4)
          .map((history) => history.message)
          .join(" "),
        query: message.message,
        user_answer: message.message,
        feedback: chat.length,
      };

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(api_data),
      });

      const botData = await response.json();

      if (botData?.message) {
        setIsButtonDisabled(false);
        setLoader(false);

        const newMessage = {
          _id: uuid(),
          message: botData.message,
          source: "bot",
          isLiked: null,
        };
        setChat([...chat, newMessage]);
      } else {
        setIsButtonDisabled(false);

        const errorMessage = {
          _id: uuid(),
          message:
            "Please try again with a valid question. Tip: Ask a question in a proper sentence?",
          source: "bot",
          isLiked: null,
        };
        setChat([...chat, errorMessage]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const handleSend = async () => {
    setMessageSentBool(!messageSentBool);
    const message = {
      _id: uuid(),
      message: userInput,
      source: "user",
      isLiked: null,
    };

    if (validateInput(userInput) === true) {
      chat.push(message);
      setChat(chat);
      await processMessageToGemini(message);
      setUserInput("");
    } else {
      setInputErrorEnabled(true);
      setUserInput("");
    }

    // setUserInput("");

    // await processMessageToGemini(message);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  //--------------Feedback data to api---------

  const handleFeedBackLike = async (ele) => {
    // UPDATE THE CHAT
    const updatedChat = chat.map((item) =>
      item._id === ele._id ? { ...item, isLiked: true } : item
    );
    setChat(updatedChat);

    const histories = [...chat];

    let feedbackHistory = histories
      .slice(-5, -1)
      .map((history) => history.message)
      .join(" ");
    let botAnswer = histories
      .slice(-1)
      .map((history) => history.message)
      .join("");

    let requestObj = {
      result: botAnswer,
      query: feedbackHistory,
      feedback: 1,
      user_answer: "Satisfactory answer",
    };

    await feedBackApiCall(requestObj);
  };

  const handleFeedBackDislike = async (ele, input) => {
    // RESET
    setCurrentItem({});
    setModalOpen(false);

    // UPDATE THE CHAT
    const updatedChat = chat.map((item) =>
      item._id === ele._id ? { ...item, isLiked: false } : item
    );
    setChat(updatedChat);

    const histories = [...chat];

    let feedbackHistory = histories
      .slice(-5, -1)
      .map((history) => history.message)
      .join(" ");
    let botAnswer = histories
      .slice(-1)
      .map((history) => history.message)
      .join("");

    let requestObj = {
      result: botAnswer,
      query: feedbackHistory,
      feedback: 0,
      user_answer: input,
    };

    await feedBackApiCall(requestObj);
  };

  const handleModal = async (ele, state) => {
    setCurrentItem(ele);
    setModalOpen(state);
  };

  //-----------------Input word limit check -------------------
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);

    // Count words in the input
    wordCount = value.split(/\s+/).filter((word) => word !== "").length;
  };
  const endofMessageRef = useRef(null);
  useEffect(() => {
    endofMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, messageSentBool]);
  //----------------------Validate Input---------------------
  function validateInput(inputStr) {
    // Check if input is empty or starts with a space
    if (inputStr.trim() === "") {
      return false; // Invalid input
    }

    // Check for special characters using a regular expression
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (specialChars.test(inputStr)) {
      return false; // Invalid input
    }

    return true; // Valid input
  }
  //---------------------input validation error ----------------
  function ErrorInputValidation() {
    if (!validateInput(userInput)) {
      return (
        <div className="errorInputMessage">
          ⚠ Special characters are not allowed
        </div>
      );
    }
  }

  return (
    <div className="chatbot-container">
      {!open && (
        <div className="chatBotIcon" onClick={() => setOpen(true)}>
          <BotLogo
            fillColor="white"
            stroke="#007aff"
            width="40px"
            height="40px"
          />
        </div>
      )}
      <FeedbackModal
        visible={modalOpen}
        onClose={(value) => {
          handleFeedBackDislike(currentItem, value);
        }}
      />
      {open && (
        <div className="chatBot">
          <div className="chatBar">
            <BotLogo
              fillColor="#007aff"
              stroke="white"
              width="32px"
              height="32px"
            />
            <h1>Bookme Assistant</h1>
            <a href="#" className="closeChat" onClick={() => setOpen(false)}>
              ✕
            </a>
          </div>
          <div className="chats">
            {chat.map((ele, index) => (
              <div
                key={index}
                className={
                  ele.source === "user" ? "senderChat" : "receiverChat"
                }
              >
                {ele.source === "user" ? (
                  <React.Fragment>
                    <div className="senderCard">
                      <p className="txt">{ele.message}</p>
                    </div>
                    <div className="senderIcon">
                      <UserLogo width="30px" height="30px" />
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div className="chat-info">
                      {" "}
                      <div className="receiverIcon">
                        <BotLogo
                          fillColor="white"
                          stroke="#007aff"
                          width="30px"
                          height="30px"
                        />
                      </div>
                      <div className="receiverCard">
                        <p className="txt">{ele.message}</p>
                      </div>
                    </div>

                    {index > 0 && index === chat.length - 1 ? (
                      <div className="feedbackBtn">
                        <input
                          type="checkbox"
                          disabled={"isLiked" in ele && ele.isLiked !== null}
                          name="feedback"
                          id={`likeLabel-${ele._id}`}
                          className="inputChecked"
                          checked={ele.isLiked === true}
                          onClick={() => handleFeedBackLike(ele)}
                          onChange={() => {}}
                        />
                        <label htmlFor={`likeLabel-${ele._id}`}>
                          <svg
                            className={
                              ele.isLiked === true ? "likeLable" : ""
                            }
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#a0a0a0"
                              d="m20.975 12.185l-.739-.128zm-.705 4.08l-.74-.128zM6.938 20.477l-.747.065zm-.812-9.393l.747-.064zm7.869-5.863l.74.122zm-.663 4.045l.74.121zm-6.634.411l-.49-.568zm1.439-1.24l.49.569zm2.381-3.653l-.726-.189zm.476-1.834l.726.188zm1.674-.886l-.23.714zm.145.047l.229-.714zM9.862 6.463l.662.353zm4.043-3.215l-.726.188zm-2.23-1.116l-.326-.675zM3.971 21.471l-.748.064zM3 10.234l.747-.064a.75.75 0 0 0-1.497.064zm17.236 1.823l-.705 4.08l1.478.256l.705-4.08zm-6.991 9.193H8.596v1.5h4.649zm-5.56-.837l-.812-9.393l-1.495.129l.813 9.393zm11.846-4.276c-.507 2.93-3.15 5.113-6.286 5.113v1.5c3.826 0 7.126-2.669 7.764-6.357zM13.255 5.1l-.663 4.045l1.48.242l.663-4.044zm-6.067 5.146l1.438-1.24l-.979-1.136L6.21 9.11zm4.056-5.274l.476-1.834l-1.452-.376l-.476 1.833zm1.194-2.194l.145.047l.459-1.428l-.145-.047zm-1.915 4.038a8.378 8.378 0 0 0 .721-1.844l-1.452-.377A6.878 6.878 0 0 1 9.2 6.11zm2.06-3.991a.885.885 0 0 1 .596.61l1.452-.376a2.385 2.385 0 0 0-1.589-1.662zm-.863.313a.515.515 0 0 1 .28-.33l-.651-1.351c-.532.256-.932.73-1.081 1.305zm.28-.33a.596.596 0 0 1 .438-.03l.459-1.428a2.096 2.096 0 0 0-1.548.107zm2.154 8.176h5.18v-1.5h-5.18zM4.719 21.406L3.747 10.17l-1.494.129l.971 11.236zm-.969.107V10.234h-1.5v11.279zm-.526.022a.263.263 0 0 1 .263-.285v1.5c.726 0 1.294-.622 1.232-1.344zM14.735 5.343a5.533 5.533 0 0 0-.104-2.284l-1.452.377a4.03 4.03 0 0 1 .076 1.664zM8.596 21.25a.916.916 0 0 1-.911-.837l-1.494.129a2.416 2.416 0 0 0 2.405 2.208zm.03-12.244c.68-.586 1.413-1.283 1.898-2.19L9.2 6.109c-.346.649-.897 1.196-1.553 1.76zm13.088 3.307a2.416 2.416 0 0 0-2.38-2.829v1.5c.567 0 1 .512.902 1.073zM3.487 21.25c.146 0 .263.118.263.263h-1.5c0 .682.553 1.237 1.237 1.237zm9.105-12.105a1.583 1.583 0 0 0 1.562 1.84v-1.5a.083.083 0 0 1-.082-.098zm-5.72 1.875a.918.918 0 0 1 .316-.774l-.98-1.137a2.418 2.418 0 0 0-.83 2.04z"
                            />
                          </svg>
                        </label>
                        <input
                          type="checkbox"
                          disabled={"isLiked" in ele && ele.isLiked !== null}
                          name="feedback"
                          id={`dislikeLabel-${ele._id}`}
                          className="inputChecked"
                          checked={ele.isLiked === false || !ele.isLiked}
                          onClick={() => handleModal(ele, true)}
                          onChange={() => {}}
                        />
                        <label htmlFor={`dislikeLabel-${ele._id}`}>
                          <svg
                            className={
                              ele.isLiked === false ? "dislikeLable" : ""
                            }
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#a0a0a0"
                              d="m20.975 11.815l-.739.128zm-.705-4.08l-.74.128zM6.938 3.523l-.747-.065zm-.812 9.393l.747.064zm7.869 5.863l.74-.122zm-.663-4.045l.74-.121zm-6.634-.412l-.49.569zm1.439 1.24l.49-.568zm2.381 3.654l-.726.189zm.476 1.834l.726-.188zm1.674.886l-.23-.714zm.145-.047l.229.714zm-2.951-4.352l.662-.353zm4.043 3.216l-.726-.189zm-2.23 1.115l-.326.675zM3.971 2.529l-.748-.064zM3 13.766l.747.064a.75.75 0 0 1-1.497-.064zm17.236-1.823l-.705-4.08l1.478-.256l.705 4.08zM13.245 2.75H8.596v-1.5h4.649zm-5.56.838l-.812 9.392l-1.495-.129l.813-9.393zm11.846 4.275c-.507-2.93-3.15-5.113-6.286-5.113v-1.5c3.826 0 7.126 2.669 7.764 6.357zM13.255 18.9l-.663-4.045l1.48-.242l.663 4.044zm-6.067-5.146l1.438 1.24l-.979 1.137l-1.438-1.24zm4.056 5.274l.476 1.834l-1.452.376l-.476-1.833zm1.194 2.194l.145-.047l.459 1.428l-.145.047zm-1.915-4.038c.312.584.555 1.203.721 1.844l-1.452.377A6.877 6.877 0 0 0 9.2 17.89zm2.06 3.991a.885.885 0 0 0 .596-.61l1.452.376a2.385 2.385 0 0 1-1.589 1.662zm-.863-.313a.513.513 0 0 0 .28.33l-.651 1.351a2.014 2.014 0 0 1-1.081-1.305zm.28.33a.596.596 0 0 0 .438.03l.459 1.428a2.096 2.096 0 0 1-1.548-.107zm2.154-8.176h5.18v1.5h-5.18zM4.719 2.594L3.747 13.83l-1.494-.129l.971-11.236zm-.969-.107v11.279h-1.5V2.487zm-.526-.022a.263.263 0 0 0 .263.285v-1.5c.726 0 1.294.622 1.232 1.344zm11.511 16.192c.125.76.09 1.538-.104 2.284l-1.452-.377c.14-.543.167-1.11.076-1.664zM8.596 2.75a.916.916 0 0 0-.911.838l-1.494-.13A2.416 2.416 0 0 1 8.596 1.25zm.03 12.244c.68.586 1.413 1.283 1.898 2.19l-1.324.707c-.346-.649-.897-1.196-1.553-1.76zm13.088-3.307a2.416 2.416 0 0 1-2.38 2.829v-1.5a.916.916 0 0 0 .902-1.073zM3.487 2.75a.263.263 0 0 0 .263-.263h-1.5c0-.682.553-1.237 1.237-1.237zm9.105 12.105a1.583 1.583 0 0 1 1.562-1.84v1.5c-.05 0-.09.046-.082.098zm-5.72-1.875a.918.918 0 0 0 .316.774l-.98 1.137a2.418 2.418 0 0 1-.83-2.04z"
                            />
                          </svg>
                        </label>
                      </div>
                    ) : null}
                  </React.Fragment>
                )}
              </div>
            ))}
            <div ref={endofMessageRef} className="scroller"></div>
          </div>

          <div className="chatFooter">
            {InputErrorEnabled == true ? <ErrorInputValidation /> : null}
            {loader == true ? (
              <div class="receiverChat">
                <div class="receiverIcon">
                  <BotLogo
                    fillColor="white"
                    stroke="#007aff"
                    width="30px"
                    height="30px"
                  />
                </div>
                <div class="receiverCard">
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              </div>
            ) : (
              ""
            )}
            <div className="inp">
              <input
                type="text"
                name=""
                id="userInput"
                placeholder="Ask a question?"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  handleInputChange(e);
                  setInputErrorEnabled(false);
                }}
                onKeyPress={(e) => handleKeyPress(e)}
                disabled={isButtonDisabled}
                autoComplete="off"
              />

              <button
                className="send"
                onClick={handleSend}
                disabled={isButtonDisabled}
              >
                <SendLogo fillColor="#007aff" width="20px" height="20px" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useEffect, useState, useRef } from "react"
import axios from 'axios';
import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom';

const Chat = () => {
    const [chat,setChat] = useState('');
    const [chatData,setChatData] = useState('');
    const [user,setUser] = useState('');
    const messageEndRef = useRef(null);
    const navigate = useNavigate();

    const convertTimestamp = (timestampMs) => {
        const date = new Date(timestampMs);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
        // 닉네임 체크
        const checkNickname = () => {
            const nickname = sessionStorage.getItem('nick');
            if (!nickname||nickname==='') {
                alert('채팅을 이용하기 위해서는 닉네임이 필요합니다.');
                navigate('/');
                return false;
            }
            return true;
        };

        if (!checkNickname()) {
            return;
        }

        // 뒤로가기 버튼 이벤트 처리
        const handlePopState = async () => {
            try {
                const currentNick = sessionStorage.getItem('nick');
                if (currentNick) {
                    // await axios.post('http://211.45.163.208:3000/api/node/nickOffline', {
                    await axios.post('http://localhost:3000/api/node/nickOffline', {
                        nickname: currentNick,
                        status: 'offline'
                    });
                    socketB.emit('newUser');
                    sessionStorage.clear();
                    navigate('/');
                }
            } catch (error) {
                console.error("Error updating user status:", error);
            }
        };

        // 뒤로가기 방지 및 이벤트 처리
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    let nodeAddr = sessionStorage.getItem('nodeAddr')?sessionStorage.getItem('nodeAddr').replace("ws://", "http://"):'';
    const socket = io(nodeAddr); 
    // const socketB = io('http://211.45.163.208:3000'); 
    const socketB = io('http://localhost:3000'); 

    const scrollToBottom = () => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ 
                behavior: "smooth",
                block: "end",
            });
        }
    };

    useEffect(() => {
        // 새 메시지가 추가될 때마다 스크롤
        scrollToBottom();
    }, [chatData]);

    // 컴포넌트가 마운트될 때도 스크롤
    useEffect(() => {
        scrollToBottom();
    }, []);

    const onChangeChat=(e)=>{
        setChat(e.target.value);
    }

    const onClickSubmit =(e)=>{
        e.preventDefault();
        try {
            const postData = {
                nick:sessionStorage.getItem('nick'),
                message:chat,
                timestamp:Date.now(),
                type:'chat'
    
            }
            setChat('');
            socket.emit('apiRequest',JSON.stringify(postData));
        } catch (error) {
            console.error("Error sending chat:", error);
            alert('채팅 전송 중 오류가 발생했습니다.');
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            onClickSubmit(e); 
        }
    };

    const handleExit = async () => {
        try {
            const currentNick = sessionStorage.getItem('nick');
            if (currentNick) {
                // await axios.post('http://211.45.163.208:3000/api/node/nickOffline', {
                await axios.post('http://localhost:3000/api/node/nickOffline', {
                    nickname: currentNick,
                    status: 'offline'
                });
                socketB.emit('newUser');
                sessionStorage.clear();
                navigate('/');
            }
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    useEffect(() => {
        // 서버에서 메시지 받기
        socketB.emit("first connect");
    
        const handlePeers = (data) => {
            console.log("Received peers update:", data);
            if (data.nicks) {
                setUser(data.nicks);
            }
        };
    
        const handleTransaction = async () => {
            try {
                const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                const res = await axios.get(`${nodeAddr}/api/getChatAfter/${oneMonthAgo}`);
                setChatData(res.data);
            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
        };
    
        socketB.on("pageUpdate", handlePeers);
        socket.on("transaction", handleTransaction);
    
        return () => {
            socketB.off("pageUpdate", handlePeers);
            socket.off("transaction", handleTransaction);
        };
    }, []);
    
    

    const getChat = async () => {
        try {
            const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const res = await axios.get(`${nodeAddr}/api/getChatAfter/${oneMonthAgo}`);
            // timestamp 변환
            const formattedData = res.data.map(chat => ({
                ...chat,
                formattedTime: convertTimestamp(chat.timestamp) // 변환된 날짜 추가
            }));
            setChatData(formattedData);
        } catch (error) {
            console.error("Error fetching chat data:", error);
        }
    };

    //3.디비 데이터 가져오기
        useEffect(() => {
            getChat();
            }, []);

    return (
        <div id='chat'>
            <div className="container">
                <div className="gap">
                    <div className="title">
                        <span className="connecting"><div></div>{user&&user.length}명 접속 중</span>
                        <h1>CHAT</h1>
                        <div className="btn">
                            <button onClick={handleExit}>채팅 종료</button> 
                        </div>
                    </div>
                    <div className="content">
                        <div className="left">
                            <ul>
                                <li><h3>접속 중인 사용자</h3></li>
                                {user && user.map((nick, idx) => (
                                    <li key={idx}>{nick.nickname}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="right">
                            <div className="msg">
                                {
                                    chatData&&chatData.map((item,idx)=>{
                                        const isMyMessage = item.nick===sessionStorage.getItem('nick');
                                        return(
                                            <div key={idx} className={`message-wrapper ${isMyMessage ? 'msg_rt' : 'msg_lt'}`}>
                                                <p className="id">{item.nick}</p>
                                                <div className="message"><p>{item.message}</p></div>
                                                <p className="time">{item.formattedTime}</p>
                                            </div>
                                        )
                                    })
                                }
                                <div ref={messageEndRef} />
                            </div>
                            <div className="input">
                                <input type="text" onChange={onChangeChat} value={chat} onKeyDown={handleKeyDown}/>
                                <button onClick={onClickSubmit}>submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;

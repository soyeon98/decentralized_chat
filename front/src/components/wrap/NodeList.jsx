import React, { useEffect, useState } from "react"
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000"); 

const NodeList = () => {

    const [message, setMessage] = useState("");
    const [modal, setMeodal] = useState(false);
    const [nick, setNick] = useState('');
    const [user,setUser] = useState('');
    const [clickAddr, setClickAddr] = useState(null);

    const onChangeNick=(e)=>{
        setNick(e.target.value)
    }

    const onClickModal = (e) => {
        e.preventDefault();
        setMeodal(!modal)
    }

    const onClickAddr=(addr,idx)=>{
        sessionStorage.setItem('nodeAddr',addr);
        setMeodal(true)
        setClickAddr(idx)
    }

    const onClickChat=async(e)=>{
        e.preventDefault();
        if(nick===''){
            alert('닉네임을 입력해주세요.');
        }
        else{
            const postData={
                nickname:nick,
                nodeid:`node${clickAddr}`
            }
            sessionStorage.setItem('nick',nick);
            try {
                const result = await axios.post('http://localhost:3000/api/node/nick',postData);
                console.log('result',result.data);
                if(result.data===1||result.data===0){
                    socket.emit('newUser');
                    window.location.href='/#/chat';
                }
                else if(result.data===-1){
                    alert('현재 사용 중인 닉네임입니다.');
                }
                else{
                    alert('노드 시작 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.log(error);
                alert('노드 시작 중 오류가 발생했습니다.');
            }
        }
    }

    useEffect(() => {
        // 서버 연결
        socket.connect();
    
        // 서버에서 메시지 받기
        socket.emit('first connect');
    
        socket.on("pageUpdate", (data) => {
            setMessage(data.peers);
            setUser(data.nicks);
        });
    
        // 소켓이 다시 연결될 때 'first connect' 자동 재전송
        socket.on("connect", () => {
            socket.emit("first connect");
        });
    
        return () => {
            socket.off("pageUpdate");
            socket.off("connect"); // 이벤트 리스너 해제
            socket.disconnect();
        };
    }, []);
    

    return (
        <div id='nodeList'>
            <div className="container">
                <div className="gap">
                    <div className="title">
                        <h1>노드 리스트</h1>
                        <p>채팅에 참여할 노드 서버를 선택해주세요.</p>
                    </div>
                    <div className="content">
                        <table>
                            <thead>
                                <tr>
                                    <th>idx</th>
                                    <th>node</th>
                                    <th>사용자 수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    message&&message.map((item,idx)=>{
                                        // 해당 노드의 사용자 수 계산
                                        const userCount = user ? user.filter(u => u.nodeid === `node${idx+1}`).length : 0;
                                        return(
                                            <tr>
                                            <td>{idx+1}</td>
                                            <td><a href="#!" onClick={()=>onClickAddr(item.address,idx+1)}>NODE{idx+1}</a></td>
                                            <td>{userCount}명</td>
                                        </tr>
                                        )
                                    })
                                }

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {
                modal&&
                <div className="modal">
                    <div className="modal_container">
                        <div className="top"><button onClick={onClickModal}>X</button></div>
                        <div className="bottom">
                            <p>서버 : NODE{clickAddr}</p>
                            <div className="start">
                                <input type="text" placeholder="사용할 닉네임을 입력해주세요." onChange={onChangeNick}/>
                                <button onClick={onClickChat}>시작</button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default NodeList;
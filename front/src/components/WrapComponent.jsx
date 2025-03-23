import React from 'react';
import NodeList from './wrap/NodeList';
import Chat from './wrap/Chat';
import { HashRouter, Routes, Route } from 'react-router-dom';

const WrapComponent = () => {
    return (
        <div id='wrap'>
            <HashRouter>
                <Routes>
                    <Route path='/*' element={<NodeList />} />
                    <Route path='/chat' element={<Chat />} />
                </Routes>
            </HashRouter>
        </div>
    );
};

export default WrapComponent;
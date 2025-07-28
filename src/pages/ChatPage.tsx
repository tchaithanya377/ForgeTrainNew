import React from 'react';
import { Layout } from '../components/layout/Layout';
import { ChatInterface } from '../components/chat/ChatInterface';

export const ChatPage: React.FC = () => {
  return (
    <Layout showSidebar={false}>
      <div className="h-screen">
        <ChatInterface />
      </div>
    </Layout>
  );
}; 
import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { Student, Teacher, ChatMessage } from '../../types';
import { useForm } from 'react-hook-form';
import { Send, User } from 'lucide-react';

const StudentChat: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { register, handleSubmit, reset } = useForm();
  
  useEffect(() => {
    // Get current student
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      const userData = JSON.parse(userJson) as Student;
      setStudent(userData);
      
      // Get teacher info if assigned
      if (userData.teacherId) {
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const teacherData = allUsers.find((user: any) => user.id === userData.teacherId) as Teacher;
        setTeacher(teacherData);
      }
    }
  }, []);
  
  useEffect(() => {
    if (student && teacher) {
      // Get messages between student and teacher
      const allMessages = JSON.parse(localStorage.getItem('chats') || '[]') as ChatMessage[];
      const conversation = allMessages.filter(msg => 
        (msg.senderId === student.id && msg.receiverId === teacher.id) || 
        (msg.senderId === teacher.id && msg.receiverId === student.id)
      ).sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(conversation);
      
      // Mark messages as read
      const updatedMessages = allMessages.map(msg => {
        if (msg.senderId === teacher.id && msg.receiverId === student.id && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });
      
      localStorage.setItem('chats', JSON.stringify(updatedMessages));
    }
  }, [student, teacher]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (data: any) => {
    if (!student || !teacher || !data.message.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: student.id,
      receiverId: teacher.id,
      message: data.message.trim(),
      timestamp: Date.now(),
      read: false
    };
    
    // Save message
    const allMessages = JSON.parse(localStorage.getItem('chats') || '[]') as ChatMessage[];
    const updatedMessages = [...allMessages, newMessage];
    localStorage.setItem('chats', JSON.stringify(updatedMessages));
    
    // Update state
    setMessages([...messages, newMessage]);
    
    // Reset form
    reset({ message: '' });
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Layout title="Chat dengan Pembimbing" role="student">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Chat dengan Pembimbing</h2>
        <p className="text-sm text-gray-500">Komunikasi dengan guru pembimbing PKL</p>
      </div>
      
      {!teacher ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <User className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-700">
            Anda belum memiliki guru pembimbing. Silahkan hubungi admin untuk mendapatkan pembimbing PKL.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">{teacher.name}</h3>
            <p className="text-sm text-gray-500">{teacher.subject}</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                <p>Belum ada pesan. Mulai percakapan dengan guru pembimbing Anda.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isStudent = message.senderId === student?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${isStudent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isStudent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">{message.message}</div>
                      <div className={`text-xs mt-1 ${isStudent ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit(handleSendMessage)} className="flex">
              <input
                type="text"
                {...register('message', { required: true })}
                className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Tulis pesan..."
              />
              <button
                type="submit"
                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentChat;

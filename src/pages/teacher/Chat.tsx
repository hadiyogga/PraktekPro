import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ChatMessage, Student } from '../../types';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';

const TeacherChat: React.FC = () => {
  const { studentId } = useParams<{ studentId?: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { register, handleSubmit, reset } = useForm();
  
  useEffect(() => {
    // Get current teacher
    const userJson = sessionStorage.getItem('currentUser');
    if (!userJson) return;
    
    const teacher = JSON.parse(userJson);
    
    // Get students assigned to this teacher
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const assignedStudents = allUsers.filter((user: any) => 
      user.role === 'student' && user.teacherId === teacher.id
    ) as Student[];
    
    setStudents(assignedStudents);
    
    // Set selected student based on URL param or first student
    if (studentId) {
      const student = assignedStudents.find(s => s.id === studentId) || null;
      setSelectedStudent(student);
    } else if (assignedStudents.length > 0) {
      setSelectedStudent(assignedStudents[0]);
    }
  }, [studentId]);
  
  useEffect(() => {
    if (selectedStudent) {
      // Get messages between teacher and selected student
      const teacherJson = sessionStorage.getItem('currentUser');
      if (!teacherJson) return;
      
      const teacher = JSON.parse(teacherJson);
      
      const allMessages = JSON.parse(localStorage.getItem('chats') || '[]') as ChatMessage[];
      const filteredMessages = allMessages.filter(msg => 
        (msg.senderId === teacher.id && msg.receiverId === selectedStudent.id) || 
        (msg.senderId === selectedStudent.id && msg.receiverId === teacher.id)
      ).sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(filteredMessages);
      
      // Mark messages as read
      const updatedMessages = allMessages.map(msg => {
        if (msg.senderId === selectedStudent.id && msg.receiverId === teacher.id && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });
      
      localStorage.setItem('chats', JSON.stringify(updatedMessages));
    }
  }, [selectedStudent]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (data: any) => {
    if (!selectedStudent || !data.message.trim()) return;
    
    const teacherJson = sessionStorage.getItem('currentUser');
    if (!teacherJson) return;
    
    const teacher = JSON.parse(teacherJson);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: teacher.id,
      receiverId: selectedStudent.id,
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
  
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Layout title="Chat dengan Siswa" role="teacher">
      <div className="flex h-[calc(100vh-136px)] bg-white shadow rounded-lg overflow-hidden">
        {/* Student list */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Siswa</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-65px)]">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{student.name}</div>
                <div className="text-sm text-gray-500">{student.class}</div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="p-4 text-sm text-gray-500">
                Belum ada siswa bimbingan
              </div>
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedStudent ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">{selectedStudent.name}</h2>
                <p className="text-sm text-gray-500">{selectedStudent.class}</p>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((message) => {
                  const isTeacher = message.senderId !== selectedStudent.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${isTeacher ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          isTeacher ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div className={`text-xs mt-1 ${isTeacher ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Pilih siswa untuk memulai chat</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherChat;

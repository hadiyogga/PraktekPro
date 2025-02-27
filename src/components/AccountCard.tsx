import React from 'react';
import { Student, Teacher, User } from '../types';
import { jsPDF } from 'jspdf';

interface AccountCardProps {
  users: Student[] | Teacher[];
  type: 'student' | 'teacher';
}

export const printAccountCards = (users: User[], type: 'student' | 'teacher') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Card dimensions
  const cardWidth = 90;
  const cardHeight = 55;
  const margin = 10;
  
  // Get school settings
  const settings = localStorage.getItem('settings') 
    ? JSON.parse(localStorage.getItem('settings') || '{}')
    : { schoolName: 'SMK Remaja Pluit', schoolAddress: 'Jl. Pluit Raya, Jakarta Utara' };
  
  // Cards per page layout
  const cardsPerRow = 2;
  const cardsPerCol = 4;
  
  let currentPage = 1;
  let currentRow = 0;
  let currentCol = 0;
  
  // Add a base64 logo image (using a placeholder school logo)
  const schoolLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEMUlEQVR4nO2Zz08TQRTHNzM0MQHixaMnI2jE4Mmb/4AJNwMHPXjQmHjzoBdvJt5MIMYfMcTEGE0uHtSLJsZEE43RCMgCCSGwLNsCRpCllKU/KEspLdyAWYaZdgtbdre7s6Uq+SZNKDDz3vfTN+/NTBoaTTd1AEEHdOcA0agNIFShtp4N2k5CtDZR2zQvPQ9hbmNWdR4Y8KrqXDj0ptA2JlTnwgGXqs5Dl7+8WbGbVbcOBLaqbR3V2s4xzm1ZDXVd/vJmYybPTICHLv+1JqCjWts5Jc9tXQ1a1aaJfDMBhWptZ594Mbz8cgIKVZtrGxLAKUDhSGAc5VtMZIIKkO+pWp+JxKIOuKNsWQ4qQF4k/QnFQxOZKj2bNz97w28ZKTQ69anRZR59Ol7ypDrGt2ZSXaZ/Qo2ZkqFFt6/U2pzrGCd0X4lVtXGg/dJT/kkH1DVPzFIrSUDqSKDcRICTOCfDNIdDFcqx46C+z7EkE8U8fQKc6LV6xDXSRPJGU8o5l7wlASQjJN0pCTQ0WxMgXggJmBFXQGXbaFTpVc6yK6CibUQX+mNGRZ5W5wNLAmrbJ79plT9mUgZSBTgvJKCueeyLEu6UBEzklgWoR3qCqVf0nwsAJ16bGmmcsBaA0ylORaEjJDUpCcjBkQP5LvFnEmhcXs4VzASw8ynXgDh9fYNhO0WaR7LMZKGSxmFXj0IW6rF62qz0OmDjM1HE67SOALlm8LeMR3r9+GjcQg2YiXIFzATg1Dknw54Yv4VYzK3DQcSLZdY1Qd+a2a5ZM6RnPFrROCjqGmiKE+LNMr39yYJ8qqLNQ5pmJ2Zmsi0wY8Zg82jMYkVOh4Y+L+h90TpYREdrS0XzIDP8+gVAR6RWkjfVg7t97KlNqSRa9wFN79+8TrjZtrZGY26RtHl/OezKPh6QRUaah1hMf8JE1RmRWk8ArsPdZwA3SWNJ6zLmJMUE+D6/oLdnUeVsYbq6/6Aj1A6GpIZg8FXiQ5MJMPziuT7XzHS6b1Jl8/RnIreXLKBnZiZSqdtf6v5UlsXcT+RJjcMJjx0cHZYS4L1zO+HmSJxoE6kYuV1RniwgcGM6sHSg5IVLSbe48O0ynHxbXwznZvhzf0lHp0d6Pd4Z/1HDU0/9Dl65yLrCkQlYAqRlmJ3/cQlwpOVyYsmC9i24QDvV6zcG/bPvXmcOGicoD//r50tJWxHYZbsC00rLvXNWsKcFjlAH+aEAwm+f6mdYlAcn/TN+f19fOrWyDCNXj9jJ16dTkGBfGQgurRybjjmwMfn0fVfG62VGV5PfAZ46mEacWvJdAP01pHZdxMMD3uRFy4jIxevYPzTTRRN5IH9KLv8BSS/gMmYkDPQAAAAASUVORK5CYII=';

  // Loop through all users and create cards
  users.forEach((user, index) => {
    // Calculate position
    const xPos = margin + (currentCol * (cardWidth + margin));
    const yPos = margin + (currentRow * (cardHeight + margin));
    
    // Draw card with rounded corners
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'S');
    
    // Add header with gradient
    doc.setFillColor(0, 83, 156);
    doc.roundedRect(xPos, yPos, cardWidth, 18, 3, 3, 'F');
    
    // Add logo
    try {
      doc.addImage(schoolLogo, 'PNG', xPos + 3, yPos + 3, 12, 12);
    } catch (error) {
      // If logo fails, just skip it
    }
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.schoolName, xPos + 17, yPos + 8);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.schoolAddress || '', xPos + 17, yPos + 14);
    
    // Card content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`KARTU ${type.toUpperCase()}`, xPos + cardWidth / 2, yPos + 24, { align: 'center' });
    
    // User details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Card content varies based on user type
    const textX = xPos + 5;
    let textY = yPos + 32;
    const lineHeight = 6;
    
    if (type === 'student') {
      const student = user as Student;
      doc.setFont('helvetica', 'bold');
      doc.text(`Nama:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(student.name, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`NISN:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(student.nisn, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Kelas:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(student.class, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Username:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(student.username, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Password:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(student.password, textX + 25, textY);
    } else {
      const teacher = user as Teacher;
      doc.setFont('helvetica', 'bold');
      doc.text(`Nama:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(teacher.name, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`NIP:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(teacher.nip, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Mapel:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(teacher.subject, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Username:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(teacher.username, textX + 25, textY);
      textY += lineHeight;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Password:`, textX, textY);
      doc.setFont('helvetica', 'normal');
      doc.text(teacher.password, textX + 25, textY);
    }
    
    // Add bottom border with color
    doc.setFillColor(0, 83, 156);
    doc.rect(xPos, yPos + cardHeight - 3, cardWidth, 3, 'F');
    
    // Move to next position
    currentCol++;
    if (currentCol >= cardsPerRow) {
      currentCol = 0;
      currentRow++;
      
      if (currentRow >= cardsPerCol && index < users.length - 1) {
        doc.addPage();
        currentPage++;
        currentRow = 0;
      }
    }
  });
  
  doc.save(`kartu_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
};

const AccountCard: React.FC<AccountCardProps> = ({ users, type }) => {
  return (
    <button
      onClick={() => printAccountCards(users, type)}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Cetak Kartu {type === 'student' ? 'Siswa' : 'Guru'}
    </button>
  );
};

export default AccountCard;

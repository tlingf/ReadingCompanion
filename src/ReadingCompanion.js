import React, { useState, useEffect } from 'react';
import { segmentTranscript, generateGist, generateReflectionPrompt } from './utils/textProcessing';
import Textarea from './components/Textarea';
import Button from './components/Button';
import Checkbox from './components/Checkbox';
import Input from './components/Input';
import Progress from './components/Progress';

const ReadingCompanion = () => {
  const [text, setText] = useState('');
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [readCount, setReadCount] = useState(0);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };


  const processParagraphs = () => {
    const segmentedSections = segmentTranscript(text);
    const newSections = segmentedSections.map((section, index) => ({
      ...section,
      isRead: false,
      annotation: '',
      gist: generateGist(section.content),
      reflectionPrompt: generateReflectionPrompt(section.content)
    }));
    setSections(newSections);
  };

  const toggleRead = (index) => {
    setSections(prev => prev.map((s, i) => 
      i === index ? { ...s, isRead: !s.isRead } : s
    ));
  };

  const handleAnnotation = (index, annotation) => {
    setSections(prev => prev.map((s, i) => 
      i === index ? { ...s, annotation } : s
    ));
  };

  useEffect(() => {
    const newReadCount = sections.filter(s => s.isRead).length;
    setReadCount(newReadCount);
    setProgress((newReadCount / sections.length) * 100 || 0);
  }, [sections]);

  const exportAnnotations = () => {
    const annotationsText = sections
      .filter(s => s.annotation)
      .map((s, index) => `Section ${index + 1} (${s.timestamp}):\n${s.content}\n\nAnnotation: ${s.annotation}\n\n`)
      .join('---\n\n');
    
    if (annotationsText.trim() === '') {
      alert('No annotations to export. Please add some annotations first.');
      return;
    }
    
    const blob = new Blob([annotationsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = (content) => {
    // Replace newlines with <br> tags
    const formattedContent = content.replace(/\n/g, '<br>');
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} style={{ whiteSpace: 'pre-wrap' }} />;
  };

  const progressBarStyle = {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '9999px',
    height: '10px',
    overflow: 'hidden',
  };

  const progressStyle = {
    width: `${progress}%`,
    backgroundColor: '#3b82f6', // blue-500
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.5s ease-in-out',
  };

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem', backgroundColor: '#f3f4f6' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Reading Companion</h1>
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#4b5563' }}>Progress</div>
        <div style={progressBarStyle}>
          <div style={progressStyle}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          <span>{readCount} paragraphs read</span>
          <span>{Math.round(progress)}% complete</span>
          <span>{sections.length - readCount} paragraphs left</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <Textarea 
          value={text}
          onChange={handleTextChange}
          placeholder="Paste your text here..."
          className="w-full h-40 mb-4 p-2 border rounded"
        />
        <Button 
          onClick={processParagraphs} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Process Text
        </Button>
      </div>
      
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="prose max-w-none mb-4">
              {renderContent(section.content)}
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id={`read-${index}`}
                checked={section.isRead}
                onCheckedChange={() => toggleRead(index)}
              />
              <label htmlFor={`read-${index}`} className="text-gray-700">
                Read
              </label>
            </div>
            <Input 
              value={section.annotation}
              onChange={(e) => handleAnnotation(index, e.target.value)}
              placeholder="Add your annotation..."
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
      </div>

      {sections.length > 0 && (
        <div className="mt-6">
          <Button 
            onClick={exportAnnotations}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Export Annotations
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReadingCompanion;
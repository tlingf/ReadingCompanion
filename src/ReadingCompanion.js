import React, { useState, useEffect } from 'react';

const Textarea = ({ value, onChange, placeholder, className }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-2 border rounded ${className}`}
  />
);

const Button = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
  >
    {children}
  </button>
);

const Checkbox = ({ id, checked, onCheckedChange }) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
  />
);

const Input = ({ value, onChange, placeholder, className }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-2 border rounded ${className}`}
  />
);

const Progress = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded ${className}`}>
    <div
      className="bg-blue-500 rounded h-2"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const ReadingCompanion = () => {
  const [text, setText] = useState('');
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [readCount, setReadCount] = useState(0);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const segmentTranscript = (text) => {
    // Split the text into lines
    const lines = text.split(/\r?\n/);
    const segments = [];
    let currentSegment = [];
    let inBulletList = false;
  
    const isBulletPoint = (line) => /^[\s]*[-•*]\s/.test(line.trim());
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
  
      if (isBulletPoint(line)) {
        if (!inBulletList && currentSegment.length > 0) {
          segments.push(currentSegment.join('\n'));
          currentSegment = [];
        }
        inBulletList = true;
        currentSegment.push(line);
      } else if (inBulletList && !isBulletPoint(nextLine) && nextLine.trim() !== '') {
        // End of bullet list
        currentSegment.push(line);
        segments.push(currentSegment.join('\n'));
        currentSegment = [];
        inBulletList = false;
      } else if (line.trim() === '' && nextLine.trim() === '') {
        // Double newline detected
        if (currentSegment.length > 0) {
          segments.push(currentSegment.join('\n'));
          currentSegment = [];
        }
        inBulletList = false;
      } else {
        if (currentSegment.length === 0 || inBulletList) {
          currentSegment.push(line);
        } else {
          segments.push(currentSegment.join('\n'));
          currentSegment = [line];
        }
      }
    }
  
    // Add the last segment if there's anything left
    if (currentSegment.length > 0) {
      segments.push(currentSegment.join('\n'));
    }
  
    return segments.map(segment => ({
      content: segment.trim(),
      timestamp: '' // We're ignoring timestamps for now
    })).filter(segment => segment.content !== ''); // Remove empty segments
  };

  const generateGist = (content) => {
    // Simple gist generation: take the first 5-7 words
    const words = content.split(/\s+/);
    return words.slice(0, Math.min(7, Math.max(5, Math.floor(words.length / 4)))).join(' ') + '...';
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

  const generateReflectionPrompt = (content) => {
    if (content.length > 200) {
      const prompts = [
        "What's the main point here?",
        "How does this relate to the overall topic?",
        "Any key terms or concepts introduced?",
        "What questions does this raise?",
        "How might this information be applied?"
      ];
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
    return '';
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

  return (
    <div className="w-full p-4 space-y-4">
      <div className="bg-white p-4 shadow-md">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{readCount} sections read</span>
          <span>{Math.round(progress)}% complete</span>
          <span>{sections.length - readCount} sections left</span>
        </div>
      </div>

      <div className="mt-4">
        <Textarea 
          value={text}
          onChange={handleTextChange}
          placeholder="Paste your transcript or text here..."
          className="w-full h-40"
        />
        <Button onClick={processParagraphs} className="mt-2">Process Text</Button>
      </div>
      
      <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="border p-4 rounded">
          <div className="flex-grow">
            {renderContent(section.content)}
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id={`read-${index}`}
                checked={section.isRead}
                onCheckedChange={() => toggleRead(index)}
              />
              <label htmlFor={`read-${index}`}>
                Mark as read
              </label>
            </div>
            {/* ... (reflection prompt and annotation input as before) ... */}
          </div>
        </div>
      ))}
    </div>

      {sections.length > 0 && (
        <div className="mt-4">
          <Textarea 
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your transcript or text here..."
            className="w-full h-60" // Increased height to h-60
          />
          <Button onClick={processParagraphs} className="mt-2">Process Text</Button>
        </div>
      )}
    </div>
  );
};

export default ReadingCompanion;